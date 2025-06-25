const {
  PricingPolicy,
  GoldWeb,
  WebInv,
  WebChangeLog,
} = require('../models');
const axios = require('axios');

const SHOPIFY_ADMIN_API_ACCESS_TOKEN =
  process.env.Shopify_Admin_Api_Access_Token;
const SHOPIFY_SHOP_NAME = process.env.Shopify_Shop_Name;
const SHOPIFY_GRAPHQL_URL = `https://${SHOPIFY_SHOP_NAME}.myshopify.com/admin/api/2024-04/graphql.json`;

module.exports = {
  async updateSkuPriceByRule(req, res) {
    try {
      const { sku } = req.body;
      if (!sku)
        return res.status(400).json({ error: 'SKU is required' });

      // 1. Find variant using GraphQL by SKU (correct query using variable)
      const query = `
        query getVariantBySKU($skuQuery: String!) {
          productVariants(first: 1, query: $skuQuery) {
            edges {
              node {
                id
                sku
                price
                product {
                  id
                  title
                }
              }
            }
          }
        }
      `;

      const variantResp = await axios({
        url: SHOPIFY_GRAPHQL_URL,
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
        data: {
          query,
          variables: { skuQuery: `sku:${sku}` },
        },
      });

      const variant =
        variantResp.data.data.productVariants.edges[0]?.node;
      if (!variant)
        return res
          .status(404)
          .json({ error: `Variant with SKU ${sku} not found` });

      const productId = variant.product.id.replace(
        'gid://shopify/Product/',
        ''
      );

      // 2. Fetch product-level metafields (REST call is still fine here)
      const metafieldsResp = await axios({
        url: `https://${SHOPIFY_SHOP_NAME}.myshopify.com/admin/api/2024-04/products/${productId}/metafields.json`,
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      });

      const metafields = metafieldsResp.data.metafields;

      const getValue = (namespace, key) =>
        metafields.find(
          (m) => m.namespace === namespace && m.key === key
        )?.value || null;

      const classcode = +getValue('sku', 'classcode');
      const vendor = getValue('sku', 'vendor');
      const grossWeight = +getValue('sku', 'grossWeight');
      const entryDate = getValue('sku', 'entryDate');
      const tag_price = parseInt(
        JSON.parse(getValue('sku', 'tag_price')).amount
      );
      const autoUpdate = getValue('sku', 'autoUpdatePrice');
      const goldKt = getValue('sku', 'gold_karat');

      if (!goldKt) {
        return res
          .status(400)
          .json({ error: 'Gold karat is missing or not set' });
      }

      if (!grossWeight || isNaN(grossWeight)) {
        return res
          .status(400)
          .json({ error: 'Gross weight is missing or invalid' });
      }

      if (!autoUpdate) {
        return res
          .status(400)
          .json({ error: 'AutoUpdatePricing is false or not set' });
      }

      // 3. Calculate product age
      const productAgeMonths =
        (new Date() - new Date(entryDate)) /
        (1000 * 60 * 60 * 24 * 30);

      // 4. Find matching pricing policy
      const policies = await PricingPolicy.find({
        Classcode: classcode,
        FromMonths: { $lte: productAgeMonths },
        ToMonths: { $gte: productAgeMonths },
      });

      let matchedPolicy =
        policies.find((p) => p.Vendor === vendor) ||
        policies.find((p) => !p.Vendor);

      if (!matchedPolicy) {
        return res
          .status(404)
          .json({ error: 'No matching pricing policy found' });
      }

      let calculatedPrice = 0;

      if (matchedPolicy.Type === 'PerGram') {
        if (goldKt === '22KT') {
          calculatedPrice = Math.round(
            matchedPolicy.Base22KtRate * grossWeight
          );
        } else if (goldKt === '21KT') {
          calculatedPrice = Math.round(
            matchedPolicy.Base21KtRate * grossWeight
          );
        } else if (goldKt === '18KT') {
          calculatedPrice = Math.round(
            matchedPolicy.Base18KtRate * grossWeight
          );
        }
      } else if (matchedPolicy.Type === 'Discount') {
        calculatedPrice = Math.round(
          tag_price -
            (tag_price * matchedPolicy.DiscountOnMargin) / 100
        );
      }

      // 7. Update price using GraphQL mutation
      const mutation = `
        mutation updateVariantPrice($variantId: ID!, $price: Money!) {
          productVariantUpdate(input: {id: $variantId, price: $price}) {
            productVariant {
              id
              price
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const updateResp = await axios({
        url: SHOPIFY_GRAPHQL_URL,
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
        data: {
          query: mutation,
          variables: {
            variantId: variant.id,
            price: calculatedPrice.toString(),
          },
        },
      });

      const errors =
        updateResp.data.data.productVariantUpdate.userErrors;
      if (errors.length) {
        console.error('Shopify Errors:', errors);
        return res
          .status(500)
          .json({ error: errors.map((e) => e.message).join(', ') });
      }

      res.status(200).json({
        message: `SKU ${sku} updated successfully`,
        newPrice: calculatedPrice.toString(),
      });
    } catch (error) {
      console.error(
        'Error updating SKU price:',
        error.response?.data || error.message
      );
      res.status(500).json({ error: 'Error updating SKU price' });
    }
  },
  async syncWebInvFromShopify(req, res) {
    let cursor = null;
    const limit = 250;
    let totalSynced = 0;
    const batchSize = 1000;
    let batch = [];
    let requestCount = 0;

    try {
      console.log(
        'Starting WebInv sync with fixed metafield queries...'
      );
      const startTime = Date.now();

      do {
        const query = `
        query GetVariants($limit: Int!, $cursor: String) {
          productVariants(first: $limit, after: $cursor) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                id
                sku
                price
                product {
                  id
                  title
                  vendor
                  # Get specific metafields directly to avoid pagination issues
                  classcode: metafield(namespace: "sku", key: "classcode") {
                    value
                  }
                  vendor_meta: metafield(namespace: "sku", key: "vendor") {
                    value
                  }
                  grossWeight: metafield(namespace: "sku", key: "grossWeight") {
                    value
                  }
                  entryDate: metafield(namespace: "sku", key: "entryDate") {
                    value
                  }
                  tag_price: metafield(namespace: "sku", key: "tag_price") {
                    value
                  }
                  autoUpdatePrice: metafield(namespace: "sku", key: "autoUpdatePrice") {
                    value
                  }
                  gold_karat: metafield(namespace: "sku", key: "gold_karat") {
                    value
                  }
                }
              }
            }
          }
        }`;

        const response = await axios({
          url: SHOPIFY_GRAPHQL_URL,
          method: 'POST',
          headers: {
            'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_ACCESS_TOKEN,
            'Content-Type': 'application/json',
          },
          data: { query, variables: { limit, cursor } },
        });

        requestCount++;

        // Rate limit monitoring
        const remainingPoints =
          response.headers['x-shopify-shop-api-call-limit'];
        if (remainingPoints) {
          const [used, total] = remainingPoints
            .split('/')
            .map(Number);
          console.log(
            `API usage: ${used}/${total}, Request #${requestCount}`
          );

          if (used / total > 0.8) {
            console.log('Approaching rate limit, adding delay...');
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        const data = response.data;

        if (data.errors) {
          console.error('GraphQL errors:', data.errors);
          throw new Error(
            `GraphQL errors: ${data.errors
              .map((e) => e.message)
              .join(', ')}`
          );
        }

        const variants = data.data.productVariants.edges;

        for (const edge of variants) {
          const node = edge.node;

          if (!node.sku) continue;

          // Extract values directly from the individual metafield queries
          const getValue = (metafieldObj) =>
            metafieldObj?.value || null;

          // Clean variant and product IDs
          const variantId = node.id.replace(
            'gid://shopify/ProductVariant/',
            ''
          );
          const productId = node.product.id.replace(
            'gid://shopify/Product/',
            ''
          );

          // Extract and process values
          let classcode = null;
          let grossWeight = null;
          let tag_price = null;
          let autoUpdatePrice = false;
          let gold_karat = null;
          let vendor = null;
          let entryDate = null;

          try {
            const classcodeRaw = getValue(node.product.classcode);
            classcode = classcodeRaw ? +classcodeRaw : null;

            const grossWeightRaw = getValue(node.product.grossWeight);
            grossWeight = grossWeightRaw ? +grossWeightRaw : null;

            vendor = getValue(node.product.vendor_meta);

            const entryDateRaw = getValue(node.product.entryDate);
            entryDate = entryDateRaw ? new Date(entryDateRaw) : null;

            // Handle tag_price
            const tagPriceRaw = getValue(node.product.tag_price);
            if (tagPriceRaw) {
              try {
                if (
                  typeof tagPriceRaw === 'string' &&
                  tagPriceRaw.startsWith('{')
                ) {
                  tag_price = JSON.parse(tagPriceRaw).amount;
                } else {
                  tag_price = +tagPriceRaw || null;
                }
              } catch (e) {
                tag_price = null;
              }
            }

            // Handle autoUpdatePrice - the fixed version
            const autoUpdateRaw = getValue(
              node.product.autoUpdatePrice
            );
            if (autoUpdateRaw !== null) {
              if (typeof autoUpdateRaw === 'string') {
                autoUpdatePrice =
                  autoUpdateRaw.toLowerCase() === 'true';
              } else if (typeof autoUpdateRaw === 'boolean') {
                autoUpdatePrice = autoUpdateRaw;
              } else {
                autoUpdatePrice = Boolean(autoUpdateRaw);
              }
            }

            // Handle gold_karat
            gold_karat = getValue(node.product.gold_karat);
            if (typeof gold_karat === 'string') {
              gold_karat = gold_karat.trim();
            }
          } catch (error) {
            console.error(
              `Error processing metafields for SKU ${node.sku}:`,
              error.message
            );
          }

          const docData = {
            sku: node.sku,
            variantId,
            productId,
            title: node.product.title,
            vendor,
            classcode,
            grossWeight,
            entryDate,
            tag_price,
            autoUpdatePrice,
            gold_karat,
            currentPrice: parseFloat(node.price) || 0,
            updatedAt: new Date(),
          };

          batch.push({
            updateOne: {
              filter: { sku: node.sku },
              update: { $set: docData },
              upsert: true,
            },
          });

          // Execute batch when it reaches the batch size
          if (batch.length >= batchSize) {
            await WebInv.bulkWrite(batch, { ordered: false });
            totalSynced += batch.length;
            console.log(`Processed ${totalSynced} variants...`);
            batch = [];
          }
        }

        cursor = data.data.productVariants.pageInfo.hasNextPage
          ? data.data.productVariants.pageInfo.endCursor
          : null;

        if (cursor && requestCount % 10 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } while (cursor);

      // Process remaining items in the batch
      if (batch.length > 0) {
        await WebInv.bulkWrite(batch, { ordered: false });
        totalSynced += batch.length;
      }

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      console.log(
        `WebInv sync completed in ${duration}s with ${requestCount} GraphQL requests`
      );

      // Verify the data in database
      const autoUpdateStats = await WebInv.aggregate([
        {
          $group: {
            _id: '$autoUpdatePrice',
            count: { $sum: 1 },
          },
        },
      ]);

      const goldKaratStats = await WebInv.aggregate([
        {
          $group: {
            _id: '$gold_karat',
            count: { $sum: 1 },
          },
        },
      ]);

      console.log('\n=== DATABASE VERIFICATION ===');
      console.log('autoUpdatePrice distribution:', autoUpdateStats);
      console.log('gold_karat distribution:', goldKaratStats);

      res.json({
        message: 'WebInv sync complete with direct metafield queries',
        totalSynced,
        duration: `${duration}s`,
        requestCount,
        verification: {
          autoUpdateStats,
          goldKaratStats,
        },
      });
    } catch (err) {
      console.error(
        'Sync failed:',
        err.response?.data || err.message
      );
      res.status(500).json({
        error: 'WebInv sync failed',
        details: err.message,
      });
    }
  },
  async updatePricesByClasscode(req, res) {
    try {
      const { fromClasscode, toClasscode, dryRun = false } = req.body;

      // Get user info for logging (req.user is now the data object directly)
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          error: 'User authentication required for logging changes',
        });
      }

      if (!fromClasscode || !toClasscode) {
        return res.status(400).json({
          error: 'fromClasscode and toClasscode are required',
        });
      }

      if (fromClasscode > toClasscode) {
        return res.status(400).json({
          error:
            'fromClasscode must be less than or equal to toClasscode',
        });
      }

      console.log(
        `Starting bulk price update for classcodes ${fromClasscode}-${toClasscode}${
          dryRun ? ' (DRY RUN)' : ''
        } by user: ${userId}`
      );
      const startTime = Date.now();

      // 1. Find all eligible products from local WebInv
      const eligibleProducts = await WebInv.find({
        classcode: { $gte: fromClasscode, $lte: toClasscode },
        autoUpdatePrice: true,
        gold_karat: { $in: ['18KT', '21KT', '22KT'] },
        grossWeight: { $gt: 0 },
        $or: [
          { tag_price: { $gt: 0 } },
          { gold_karat: { $exists: true } },
        ],
      }).lean();

      if (eligibleProducts.length === 0) {
        return res.status(404).json({
          error:
            'No eligible products found in the specified classcode range',
        });
      }

      console.log(
        `Found ${eligibleProducts.length} eligible products`
      );

      // 2. Get current date for age calculation
      const currentDate = new Date();

      // 3. Process products for pricing calculations
      const priceUpdates = [];
      const errors = [];
      let processed = 0;

      for (const product of eligibleProducts) {
        try {
          // Calculate product age in months
          const productAgeMonths = product.entryDate
            ? (currentDate - new Date(product.entryDate)) /
              (1000 * 60 * 60 * 24 * 30)
            : 0;

          // Find matching pricing policy
          const policies = await PricingPolicy.find({
            Classcode: product.classcode,
            FromMonths: { $lte: productAgeMonths },
            ToMonths: { $gte: productAgeMonths },
          });

          let matchedPolicy =
            policies.find((p) => p.Vendor === product.vendor) ||
            policies.find((p) => !p.Vendor);

          if (!matchedPolicy) {
            // Log failed pricing attempt
            try {
              await WebChangeLog.logChanges(
                userId,
                'shopify',
                product.sku,
                {
                  fieldName: 'price',
                  oldValue: product.currentPrice || 0,
                  newValue: null,
                  source: 'bulk_pricing',
                  message: 'Price Update Failed: No Policy Found',
                }
              );
            } catch (logError) {
              console.error(
                `Failed to log policy error for SKU ${product.sku}:`,
                logError.message
              );
            }

            errors.push({
              sku: product.sku,
              error: 'No matching pricing policy found',
              classcode: product.classcode,
              ageMonths: Math.round(productAgeMonths * 10) / 10,
            });
            continue;
          }

          let calculatedPrice = 0;

          // Calculate price based on policy type
          if (matchedPolicy.Type === 'PerGram') {
            if (product.gold_karat === '22KT') {
              calculatedPrice = Math.round(
                matchedPolicy.Base22KtRate * product.grossWeight
              );
            } else if (product.gold_karat === '21KT') {
              calculatedPrice = Math.round(
                matchedPolicy.Base21KtRate * product.grossWeight
              );
            } else if (product.gold_karat === '18KT') {
              calculatedPrice = Math.round(
                matchedPolicy.Base18KtRate * product.grossWeight
              );
            }
          } else if (matchedPolicy.Type === 'Discount') {
            calculatedPrice = Math.round(
              product.tag_price -
                (product.tag_price * matchedPolicy.DiscountOnMargin) /
                  100
            );
          }

          if (calculatedPrice > 0) {
            let metafieldValue;
            let perGramRate = null;
            let discountPercentage = null;

            if (matchedPolicy.Type === 'PerGram') {
              // Get the per gram rate used
              if (product.gold_karat === '22KT') {
                perGramRate = matchedPolicy.Base22KtRate;
              } else if (product.gold_karat === '21KT') {
                perGramRate = matchedPolicy.Base21KtRate;
              } else if (product.gold_karat === '18KT') {
                perGramRate = matchedPolicy.Base18KtRate;
              }
              metafieldValue = perGramRate.toString();
            } else if (matchedPolicy.Type === 'Discount') {
              // Get the discount percentage
              discountPercentage = matchedPolicy.DiscountOnMargin;
              metafieldValue = discountPercentage.toString();
            }

            priceUpdates.push({
              sku: product.sku,
              variantId: `gid://shopify/ProductVariant/${product.variantId}`,
              currentPrice: product.currentPrice || 0,
              newPrice: calculatedPrice,
              priceChange:
                calculatedPrice - (product.currentPrice || 0),
              classcode: product.classcode,
              vendor: product.vendor,
              gold_karat: product.gold_karat,
              grossWeight: product.grossWeight,
              ageMonths: Math.round(productAgeMonths * 10) / 10,
              policyType: matchedPolicy.Type,
              policyId: matchedPolicy._id,
              metafieldValue: metafieldValue,
              perGramRate: perGramRate,
              discountPercentage: discountPercentage,
            });
          } else {
            // Log failed calculation
            try {
              await WebChangeLog.logChanges(
                userId,
                'shopify',
                product.sku,
                {
                  fieldName: 'price',
                  oldValue: product.currentPrice || 0,
                  newValue: 0,
                  source: 'bulk_pricing',
                  message:
                    'Price Update Failed: Calculated Price Invalid',
                }
              );
            } catch (logError) {
              console.error(
                `Failed to log calculation error for SKU ${product.sku}:`,
                logError.message
              );
            }

            errors.push({
              sku: product.sku,
              error: 'Calculated price is 0 or invalid',
              classcode: product.classcode,
              policyType: matchedPolicy.Type,
            });
          }

          processed++;
          if (processed % 500 === 0) {
            console.log(
              `Processed ${processed}/${eligibleProducts.length} products...`
            );
          }
        } catch (error) {
          // Log processing error
          try {
            await WebChangeLog.logChanges(
              userId,
              'shopify',
              product.sku,
              {
                fieldName: 'price',
                oldValue: product.currentPrice || 0,
                newValue: null,
                source: 'bulk_pricing',
                message: `Price Update Failed: ${error.message}`,
              }
            );
          } catch (logError) {
            console.error(
              `Failed to log processing error for SKU ${product.sku}:`,
              logError.message
            );
          }

          errors.push({
            sku: product.sku,
            error: error.message,
            classcode: product.classcode,
          });
        }
      }

      console.log(
        `Price calculations complete. ${priceUpdates.length} updates ready, ${errors.length} errors`
      );

      // 4. If dry run, return the results without updating Shopify
      if (dryRun) {
        const endTime = Date.now();

        // Group results for better analysis
        const updatesByClasscode = priceUpdates.reduce(
          (acc, update) => {
            acc[update.classcode] = (acc[update.classcode] || 0) + 1;
            return acc;
          },
          {}
        );

        const errorsByType = errors.reduce((acc, error) => {
          acc[error.error] = (acc[error.error] || 0) + 1;
          return acc;
        }, {});

        // Calculate price change statistics
        const priceChanges = priceUpdates.map((u) => u.priceChange);
        const avgPriceChange =
          priceChanges.length > 0
            ? Math.round(
                priceChanges.reduce((a, b) => a + b, 0) /
                  priceChanges.length
              )
            : 0;
        const totalPriceChange = priceChanges.reduce(
          (a, b) => a + b,
          0
        );

        return res.json({
          message: 'Dry run complete',
          summary: {
            eligible: eligibleProducts.length,
            priceUpdates: priceUpdates.length,
            errors: errors.length,
            avgPriceChange,
            totalPriceChange: Math.round(totalPriceChange),
            duration: `${(endTime - startTime) / 1000}s`,
          },
          analysis: {
            updatesByClasscode,
            errorsByType,
          },
          sampleUpdates: priceUpdates.slice(0, 10),
          sampleErrors: errors.slice(0, 10),
          note: 'Showing first 10 items. Use dryRun: false to execute updates.',
        });
      }

      // 5. Update prices in Shopify using bulk GraphQL mutations
      const batchSize = 50; // Reduced batch size since we're doing more operations per variant
      let totalUpdated = 0;
      let shopifyErrors = [];

      console.log(
        `Starting Shopify updates in batches of ${batchSize}...`
      );

      for (let i = 0; i < priceUpdates.length; i += batchSize) {
        const batch = priceUpdates.slice(i, i + batchSize);

        // Create bulk mutation - both price update and metafield update
        const mutations = batch
          .map((update, index) => {
            const metafieldValue =
              update.policyType === 'PerGram'
                ? `Per Gram (${update.gold_karat})`
                : `Discount`;

            return `
          update${index}: productVariantUpdate(input: {
            id: "${update.variantId}",
            price: "${update.newPrice}",
            metafields: [{
              namespace: "sku",
              key: "per_gram_or_disc",
              value: "${metafieldValue}",
              type: "single_line_text_field"
            }]
          }) {
            productVariant { 
              id 
              price 
            }
            userErrors { 
              field 
              message 
            }
          }
        `;
          })
          .join('\n');

        const bulkMutation = `mutation { ${mutations} }`;

        try {
          const response = await axios({
            url: SHOPIFY_GRAPHQL_URL,
            method: 'POST',
            headers: {
              'X-Shopify-Access-Token':
                SHOPIFY_ADMIN_API_ACCESS_TOKEN,
              'Content-Type': 'application/json',
            },
            data: { query: bulkMutation },
          });

          if (response.data.errors) {
            console.error('GraphQL errors:', response.data.errors);
            batch.forEach((update) => {
              shopifyErrors.push({
                sku: update.sku,
                errors: [
                  'GraphQL error: ' +
                    response.data.errors
                      .map((e) => e.message)
                      .join(', '),
                ],
              });
            });
            continue;
          }

          // Process response for each update in the batch
          const successfulUpdates = [];

          batch.forEach((update, index) => {
            const result = response.data.data[`update${index}`];
            const success = result.userErrors.length === 0;

            if (success) {
              totalUpdated++;
              successfulUpdates.push({
                sku: update.sku,
                oldPrice: update.currentPrice,
                newPrice: update.newPrice,
                metafieldValue: update.metafieldValue,
              });
            } else {
              shopifyErrors.push({
                sku: update.sku,
                errors: result.userErrors.map((e) => e.message),
              });
            }
          });

          // Log successful changes only
          for (const update of successfulUpdates) {
            try {
              const changes = [
                {
                  fieldName: 'price',
                  oldValue: update.oldPrice,
                  newValue: update.newPrice,
                  source: 'bulk_pricing',
                  message: 'Price Updated Successfully',
                },
                {
                  fieldName: 'per_gram_or_disc',
                  oldValue: null, // We don't track old metafield values
                  newValue: update.metafieldValue,
                  source: 'bulk_pricing',
                  message: 'Pricing Method Updated',
                },
              ];

              await WebChangeLog.logChanges(
                userId,
                'shopify',
                update.sku,
                changes
              );
            } catch (logError) {
              console.error(
                `Failed to log changes for SKU ${update.sku}:`,
                logError.message
              );
              // Don't fail the entire operation if logging fails
            }
          }

          if (successfulUpdates.length > 0) {
            console.log(
              `Logged ${
                successfulUpdates.length
              } successful changes for batch ${
                Math.floor(i / batchSize) + 1
              }`
            );
          }

          const batchNum = Math.floor(i / batchSize) + 1;
          const totalBatches = Math.ceil(
            priceUpdates.length / batchSize
          );
          console.log(
            `Completed batch ${batchNum}/${totalBatches} - Updated ${totalUpdated} so far`
          );

          // Rate limiting: small delay between batches
          if (i + batchSize < priceUpdates.length) {
            await new Promise((resolve) => setTimeout(resolve, 200));
          }
        } catch (error) {
          console.error(
            `Batch ${Math.floor(i / batchSize) + 1} failed:`,
            error.response?.data || error.message
          );

          batch.forEach((update) => {
            shopifyErrors.push({
              sku: update.sku,
              errors: ['Batch update failed: ' + error.message],
            });
          });
        }
      }

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      console.log(`Bulk price update completed in ${duration}s`);

      // Group results for summary
      const successfulByClasscode = priceUpdates
        .filter(
          (update) =>
            !shopifyErrors.find((err) => err.sku === update.sku)
        )
        .reduce((acc, update) => {
          acc[update.classcode] = (acc[update.classcode] || 0) + 1;
          return acc;
        }, {});

      res.json({
        message: `Bulk price update completed for classcodes ${fromClasscode}-${toClasscode}`,
        summary: {
          eligible: eligibleProducts.length,
          attempted: priceUpdates.length,
          successful: totalUpdated,
          calculationErrors: errors.length,
          shopifyErrors: shopifyErrors.length,
          duration: `${duration}s`,
        },
        results: {
          successfulByClasscode,
          totalBatches: Math.ceil(priceUpdates.length / batchSize),
        },
        errors: {
          calculations: errors.slice(0, 5),
          shopify: shopifyErrors.slice(0, 5),
        },
      });
    } catch (error) {
      console.error('Bulk pricing update failed:', error.message);
      res.status(500).json({
        error: 'Bulk pricing update failed',
        details: error.message,
      });
    }
  },
};
