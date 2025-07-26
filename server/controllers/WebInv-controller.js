const {
  PricingPolicy,
  GoldWeb,
  WebInv,
  WebChangeLog,
} = require('../models');
const axios = require('axios');
const { runBulkJob } = require('../utils/bulkRunner');
const { updateField } = require('../utils/updateField');
const { createLogger } = require('../utils/logger');

const SHOPIFY_ADMIN_API_ACCESS_TOKEN =
  process.env.Shopify_Admin_Api_Access_Token;

const SHOPIFY_SHOP_NAME = process.env.Shopify_Shop_Name;

const SHOPIFY_GRAPHQL_URL = `https://${SHOPIFY_SHOP_NAME}.myshopify.com/admin/api/2024-04/graphql.json`;

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

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
      const variantId = variant.id.replace(
        'gid://shopify/ProductVariant/',
        ''
      );

      // 2. Fetch product-level metafields (only classcode and goldKt)
      const productMetafieldsResp = await axios({
        url: `https://${SHOPIFY_SHOP_NAME}.myshopify.com/admin/api/2024-04/products/${productId}/metafields.json`,
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      });

      // 3. Fetch variant-level metafields (entryDate, vendor, grossWeight, tag_price, autoUpdate)
      const variantMetafieldsResp = await axios({
        url: `https://${SHOPIFY_SHOP_NAME}.myshopify.com/admin/api/2024-04/variants/${variantId}/metafields.json`,
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      });

      const productMetafields = productMetafieldsResp.data.metafields;
      const variantMetafields = variantMetafieldsResp.data.metafields;

      // Helper functions to get values from different metafield sources
      const getProductValue = (namespace, key) =>
        productMetafields.find(
          (m) => m.namespace === namespace && m.key === key
        )?.value || null;

      const getVariantValue = (namespace, key) =>
        variantMetafields.find(
          (m) => m.namespace === namespace && m.key === key
        )?.value || null;

      // Get product metafields (classcode and goldKt)
      const classcode = +getProductValue('sku', 'classcode');
      const goldKt = getProductValue('sku', 'gold_karat');

      // Get variant metafields (all others)
      const entryDate = getVariantValue('variant', 'entry_date');
      const vendor = getVariantValue('variant', 'vendor');
      const grossWeight = +getVariantValue('variant', 'gross_weight');

      // Handle tag_price with proper null checking
      const tagPriceRaw = getVariantValue('variant', 'tag_price');
      let tag_price = null;

      if (tagPriceRaw) {
        try {
          const parsedTagPrice = JSON.parse(tagPriceRaw);
          tag_price = parseInt(parsedTagPrice.amount);
        } catch (parseError) {
          console.error('Error parsing tag_price:', parseError);
          return res
            .status(400)
            .json({ error: 'Invalid tag_price format' });
        }
      }

      const autoUpdate = getVariantValue(
        'variant',
        'autoUpdatePrice'
      );

      // Debug logging for missing metafields
      console.log('Metafield values:', {
        classcode,
        goldKt,
        entryDate,
        vendor,
        grossWeight,
        tag_price,
        autoUpdate,
        tagPriceRaw,
      });

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

      if (!entryDate) {
        return res
          .status(400)
          .json({ error: 'Entry date is missing or not set' });
      }

      // 4. Calculate product age
      const productAgeMonths =
        (new Date() - new Date(entryDate)) /
        (1000 * 60 * 60 * 24 * 30);

      // 5. Find matching pricing policy
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
        if (!tag_price) {
          return res.status(400).json({
            error:
              'Tag price is required for discount calculation but is missing',
          });
        }
        calculatedPrice = Math.round(
          tag_price -
            (tag_price * matchedPolicy.DiscountOnMargin) / 100
        );
      }

      // 6. Update price using GraphQL mutation
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
  async getSkuListing(req, res) {
    try {
      const {
        search = '',
        classcode,
        vendor,
        gold_karat,
        autoUpdatePrice,
        page = 1,
        limit = 50,
        sortBy = 'sku',
        sortOrder = 'asc',
      } = req.query;

      // Build filter object
      const filter = {};

      // Text search across multiple fields
      if (search) {
        filter.$or = [
          { sku: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
          { vendor: { $regex: search, $options: 'i' } },
        ];
      }

      // Specific filters
      if (classcode) filter.classcode = parseInt(classcode);
      if (vendor) filter.vendor = vendor;
      if (gold_karat) filter.gold_karat = gold_karat;
      if (autoUpdatePrice !== undefined)
        filter.autoUpdatePrice = autoUpdatePrice === 'true';

      // Pagination
      const skip = (page - 1) * limit;
      const totalCount = await WebInv.countDocuments(filter);
      const totalPages = Math.ceil(totalCount / limit);

      // Sort options
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Get SKUs with pagination and sorting
      const skus = await WebInv.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      // Get filter options for dropdowns (for frontend filters)
      const [vendors, goldKarats, classcodes] = await Promise.all([
        WebInv.distinct('vendor', { vendor: { $ne: null } }),
        WebInv.distinct('gold_karat', { gold_karat: { $ne: null } }),
        WebInv.distinct('classcode', { classcode: { $ne: null } }),
      ]);

      // Add some statistics
      const stats = {
        totalProducts: totalCount,
        autoUpdateEnabled: await WebInv.countDocuments({
          autoUpdatePrice: true,
        }),
        autoUpdateDisabled: await WebInv.countDocuments({
          autoUpdatePrice: false,
        }),
        withGoldKarat: await WebInv.countDocuments({
          gold_karat: { $ne: null },
        }),
        withoutGoldKarat: await WebInv.countDocuments({
          gold_karat: null,
        }),
      };

      res.json({
        message: 'SKU listing retrieved successfully',
        data: {
          skus,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalCount,
            hasNext: page < totalPages,
            hasPrev: page > 1,
            limit: parseInt(limit),
            showing: skus.length,
          },
          filters: {
            vendors: vendors.sort(),
            goldKarats: goldKarats.sort(),
            classcodes: classcodes.sort((a, b) => a - b),
          },
          search: {
            query: search,
            appliedFilters: {
              classcode,
              vendor,
              gold_karat,
              autoUpdatePrice,
            },
          },
          stats,
        },
      });
    } catch (error) {
      console.error('Failed to get SKU listing:', error.message);
      res.status(500).json({
        error: 'Failed to retrieve SKU listing',
        details: error.message,
      });
    }
  },
  async getSkuDetails(req, res) {
    try {
      const { sku } = req.params;

      if (!sku) {
        return res
          .status(400)
          .json({ error: 'SKU parameter is required' });
      }

      console.log(`Fetching details for SKU: ${sku}`);

      // 1. Get SKU data from local WebInv
      const localSkuData = await WebInv.findOne({ sku }).lean();

      if (!localSkuData) {
        return res
          .status(404)
          .json({ error: `SKU ${sku} not found in local database` });
      }

      const { productId, variantId } = localSkuData;

      if (!productId || !variantId) {
        return res.status(400).json({
          error:
            'SKU missing productId or variantId - sync may be required',
        });
      }

      console.log(
        `Found local data - ProductID: ${productId}, VariantID: ${variantId}`
      );

      // 2. Fetch detailed product and variant info from Shopify
      const shopifyQuery = `
      query getProductDetails($productId: ID!, $variantId: ID!) {
        product(id: $productId) {
          id
          title
          description
          vendor
          productType
          tags
          status
          createdAt
          updatedAt
         productCategory {
      productTaxonomyNode {
        id
        name
        fullName
      }
    }
          images(first: 5) {
            edges {
              node {
                id
                url
                altText
              }
            }
          }
          metafields(first: 50, namespace: "sku") {
            edges {
              node {
                namespace
                key
                value
                type
              }
            }
          }
          variants(first: 50) {
            edges {
              node {
                id
                sku
                title
                price
                compareAtPrice
                inventoryQuantity
                inventoryPolicy
                weight
                weightUnit
                availableForSale
                selectedOptions {
                  name
                  value
                }
                image {
                  id
                  url
                  altText
                }
              }
            }
          }
        }
        variant: productVariant(id: $variantId) {
          id
          sku
          title
          price
          compareAtPrice
          inventoryQuantity
            inventoryPolicy  
          weight
          weightUnit
          availableForSale
          selectedOptions {
            name
            value
          }
          image {
            id
            url
            altText
          }
          metafields(first: 20) {
            edges {
              node {
                namespace
                key
                value
                type
              }
            }
          }
        }
      }
    `;

      const shopifyResponse = await axios({
        url: SHOPIFY_GRAPHQL_URL,
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
        data: {
          query: shopifyQuery,
          variables: {
            productId: `gid://shopify/Product/${productId}`,
            variantId: `gid://shopify/ProductVariant/${variantId}`,
          },
        },
      });

      if (shopifyResponse.data.errors) {
        console.error(
          'Shopify GraphQL errors:',
          shopifyResponse.data.errors
        );
        return res.status(500).json({
          error: 'Failed to fetch data from Shopify',
          details: shopifyResponse.data.errors,
        });
      }

      const { product, variant } = shopifyResponse.data.data;

      if (!product) {
        return res.status(404).json({
          error: `Product with ID ${productId} not found in Shopify`,
        });
      }

      if (!variant) {
        return res.status(404).json({
          error: `Variant with ID ${variantId} not found in Shopify`,
        });
      }

      // 3. Process product metafields
      const productMetafields = {};
      product.metafields.edges.forEach(({ node }) => {
        productMetafields[node.key] = {
          value: node.value,
          type: node.type,
        };
      });

      // 4. Process variant metafields
      const variantMetafields = {};

      variant.metafields.edges.forEach(({ node }) => {
        variantMetafields[node.key] = {
          namespace: node.namespace,
          value: node.value,
          type: node.type,
        };
      });

      // 5. Process all variants (siblings)
      const allVariants = product.variants.edges.map(({ node }) => ({
        id: node.id.replace('gid://shopify/ProductVariant/', ''),
        sku: node.sku,
        title: node.title,
        price: parseFloat(node.price),
        compareAtPrice: node.compareAtPrice
          ? parseFloat(node.compareAtPrice)
          : null,
        inventoryQuantity: node.inventoryQuantity,
        weight: node.weight,
        weightUnit: node.weightUnit,
        availableForSale: node.availableForSale,
        selectedOptions: node.selectedOptions,
        image: node.image
          ? {
              id: node.image.id,
              url: node.image.url,
              altText: node.image.altText,
            }
          : null,
        isCurrentVariant:
          node.id === `gid://shopify/ProductVariant/${variantId}`,
      }));

      // 6. Get recent change history for this SKU
      const recentChanges = await WebChangeLog.find({
        destination: 'shopify',
        id: sku,
      })
        .populate('user', 'firstName lastName email employeeId')
        .sort({ timestamp: -1 })
        .limit(10)
        .lean();

      // 7. Build comprehensive response
      const response = {
        message: 'SKU details retrieved successfully',
        data: {
          // Local database info
          localData: localSkuData,

          // Shopify product info
          product: {
            id: product.id.replace('gid://shopify/Product/', ''),
            title: product.title,
            description: product.description,
            vendor: product.vendor,
            productType: product.productType,
            tags: product.tags,
            status: product.status,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            productCategory: {
              id: product.productCategory.productTaxonomyNode.id,
              name: product.productCategory.productTaxonomyNode.name,
              fullName:
                product.productCategory.productTaxonomyNode.fullName,
            },
            images: product.images.edges.map(({ node }) => ({
              id: node.id,
              url: node.url,
              altText: node.altText,
            })),
            metafields: productMetafields,
          },

          // Current variant info
          currentVariant: {
            id: variant.id.replace(
              'gid://shopify/ProductVariant/',
              ''
            ),
            sku: variant.sku,
            title: variant.title,
            price: parseFloat(variant.price),
            compareAtPrice: variant.compareAtPrice
              ? parseFloat(variant.compareAtPrice)
              : null,
            inventoryQuantity: variant.inventoryQuantity,
            weight: variant.weight,
            weightUnit: variant.weightUnit,
            availableForSale: variant.availableForSale,
            selectedOptions: variant.selectedOptions,
            image: variant.image
              ? {
                  id: variant.image.id,
                  url: variant.image.url,
                  altText: variant.image.altText,
                }
              : null,
            metafields: variantMetafields,
          },

          // All variants (siblings)
          allVariants: allVariants,
          variantCount: allVariants.length,

          // Change history
          recentChanges: recentChanges.map((change) => ({
            timestamp: change.timestamp,
            user:
              change.user?.employeeId ||
              change.user?.firstName ||
              'Unknown',
            changes: change.changes,
            summary: change.changes
              .map(
                (c) =>
                  `${c.fieldName}: ${c.oldValue} → ${c.newValue}${
                    c.message ? ` (${c.message})` : ''
                  }`
              )
              .join(', '),
          })),

          // Comparison between local and Shopify data
          dataComparison: {
            priceMatch:
              localSkuData.currentPrice === parseFloat(variant.price),
            localPrice: localSkuData.currentPrice,
            shopifyPrice: parseFloat(variant.price),
            lastSynced: localSkuData.updatedAt,
          },
        },
      };

      res.json(response);
    } catch (error) {
      console.error('Failed to get SKU details:', error.message);
      res.status(500).json({
        error: 'Failed to retrieve SKU details',
        details: error.message,
      });
    }
  },
  async updateSkuDetails(req, res) {
    try {
      const userId = req.user?._id;
      const { sku } = req.params;
      const { changes, currentData } = req.body;

      let changeLog = [];

      // 1. CONVERT CHANGES TO LOG FORMAT

      // Product field changes
      Object.entries(changes.product.fields).forEach(
        ([field, change]) => {
          changeLog.push({
            fieldName: field,
            oldValue: change.oldValue,
            newValue: change.newValue,
            source: 'SKU Detail Page',
            message: `${field} updated successfully`,
          });
        }
      );

      // Variant field changes
      Object.entries(changes.variant.fields).forEach(
        ([field, change]) => {
          changeLog.push({
            fieldName: field,
            oldValue: change.oldValue,
            newValue: change.newValue,
            source: 'SKU Detail Page',
            message: `${field} updated successfully`,
          });
        }
      );

      // Product metafield changes
      Object.entries(changes.product.metafields).forEach(
        ([namespace, fields]) => {
          Object.entries(fields).forEach(([key, change]) => {
            changeLog.push({
              fieldName: `${namespace}.${key}`,
              oldValue: change.oldValue,
              newValue: change.newValue,
              source: 'SKU Detail Page',
              message: `${key} updated successfully`,
            });
          });
        }
      );

      // Variant metafield changes
      Object.entries(changes.variant.metafields).forEach(
        ([namespace, fields]) => {
          Object.entries(fields).forEach(([key, change]) => {
            changeLog.push({
              fieldName: `variant.${namespace}.${key}`,
              oldValue: change.oldValue,
              newValue: change.newValue,
              source: 'SKU Detail Page',
              message: `${key} updated successfully`,
            });
          });
        }
      );

      // 2. APPLY BUSINESS LOGIC (using current data)
      const processedData = { ...currentData };

      // Auto pricing logic (if enabled and relevant fields changed)
      const autoUpdatePrice =
        currentData.product.metafields.sku?.autoUpdatePrice;

      if (autoUpdatePrice) {
        const entryDate =
          currentData.product.metafields.sku?.entryDate;

        const classCode =
          currentData.product.metafields.sku?.classcode;

        const vendor = currentData.product.metafields.sku?.vendor;

        const grossWeight =
          currentData.product.metafields.sku?.grossWeight;

        const tagPrice =
          currentData.product.metafields.sku?.tag_price;

        const goldKarat =
          currentData.product.metafields.sku?.gold_karat;

        const productAgeMonths =
          (new Date() - new Date(entryDate)) /
          (1000 * 60 * 60 * 24 * 30);

        const policies = await PricingPolicy.find({
          Classcode: classCode,
          FromMonths: { $lte: productAgeMonths },
          ToMonths: { $gte: productAgeMonths },
        });

        let matchedPolicy =
          policies.find((p) => p.Vendor === vendor) ||
          policies.find((p) => !p.Vendor);

        if (matchedPolicy) {
          let calculatedPrice = currentData.variant.price;

          if (matchedPolicy.Type === 'PerGram' && grossWeight) {
            if (goldKarat === '22KT') {
              calculatedPrice = Math.round(
                matchedPolicy.Base22KtRate * grossWeight
              );
            } else if (goldKarat === '21KT') {
              calculatedPrice = Math.round(
                matchedPolicy.Base21KtRate * grossWeight
              );
            } else if (goldKarat === '18KT') {
              calculatedPrice = Math.round(
                matchedPolicy.Base18KtRate * grossWeight
              );
            }
          } else if (matchedPolicy.Type === 'Discount' && tagPrice) {
            calculatedPrice = Math.floor(
              tagPrice -
                (tagPrice * matchedPolicy.DiscountOnMargin) / 100
            );
          }

          // Add auto-calculated price change
          if (calculatedPrice !== currentData.variant.price) {
            changeLog.push({
              fieldName: 'price',
              oldValue: currentData.variant.price,
              newValue: calculatedPrice,
              source: 'Auto Pricing',
              message: 'Price auto-calculated based on policy',
            });
            if (matchedPolicy.Type === 'PerGram') {
              changeLog.push({
                fieldName: 'Per Gram Or Discount',
                oldValue: Math.floor(
                  currentData.variant.price / grossWeight
                ),
                newValue: Math.floor(calculatedPrice / grossWeight),
                source: 'Auto Pricing',
                message: 'Price auto-calculated based on policy',
              });
            } else {
              changeLog.push({
                fieldName: 'Per Gram Or Discount',
                oldValue: Math.floor(
                  (currentData.variant.price / tagPrice) * 100
                ),
                newValue: Math.floor(
                  (calculatedPrice / tagPrice) * 100
                ),
                source: 'Auto Pricing',
                message: 'Price auto-calculated based on policy',
              });
            }

            processedData.variant.price = calculatedPrice;
          }
        }
      }

      // 3. RETURN RESULTS
      res.json({
        success: true,
        message: `SKU ${sku} updated successfully`,
        data: processedData,
        changes: changeLog,
        changesCount: changeLog.length,
      });

      // TODO: Update Shopify and local database
      // TODO: Save change log to database
    } catch (error) {
      console.error('Failed to update SKU details:', error.message);
      res.status(500).json({
        error: 'Failed to update SKU details',
        details: error.message,
      });
    }
  },
  async refreshNewArrivals(req, res) {
    const log = createLogger('refreshNewArrivals');

    try {
      const today = new Date();
      if (today.getDay() === 1) {
        await log('⏭ Skipped: Today is Monday.');
        return res.status(200).send('Skipped: Today is Monday.');
      }

      await log('🚀 RefreshNewArrivals job started');

      const recentVariants = [];

      await runBulkJob({
        graphqlQuery: `
            {
              productVariants {
                edges {
                  node {
                    id
                    metafield(namespace: "variant", key: "upload_date") {
                      value
                    }
                  }
                }
              }
            }
          `,
        onEachRecord: async (variant) => {
          const uploadDate = variant.metafield?.value;
          const variantId = variant.id;

          if (!uploadDate) return;

          const daysAgo = Math.floor(
            (Date.now() - new Date(uploadDate).getTime()) / 86400000
          );

          if (daysAgo >= 0 && daysAgo <= 30) {
            recentVariants.push({
              id: variantId,
              upload_date: uploadDate,
            });
          }
        },
        jobName: 'refreshNewArrivals',
      });

      // ✅ Sort and tag 30 most recent
      recentVariants.sort(
        (a, b) => new Date(b.upload_date) - new Date(a.upload_date)
      );

      const top30 = recentVariants.slice(0, 50);

      await log(
        `📊 Found ${recentVariants.length} variants in last 30 days. Tagging top ${top30.length}.`
      );

      for (const variant of top30) {
        await updateField({
          parent: 'Variant',
          fieldType: 'Metafield',
          parentId: variant.id,
          namespace: 'variant',
          key: 'new_arrival',
          type: 'boolean',
          value: true,
        });
        await log(
          `✅ Tagged: ${variant.id} — ${variant.upload_date}`
        );
      }

      await log(
        '🟡 Bulk job started. Waiting for completion in background.'
      );
      return res.status(202).send('Bulk job triggered.');
    } catch (error) {
      await log(`❌ Error: ${error.message}`);
      return res.status(500).send('Internal server error.');
    }
  },
  
  async PricingWebhook(req, res) {
    try {
      const product = req.body;

      // Step 1: Build initial tempArr from webhook data
      let tempArr = product.variants.map((variant) => ({
        id: variant.id,
        product_id: variant.product_id,
        sku: variant.sku,
        inventory_quantity: variant.inventory_quantity,
        title: variant.title, // For UX display only
        current_price: variant.price, // ← ADD THIS LINE!
        // price will be computed and added later
      }));

      // Step 2: Get metafields and enrich tempArr
      tempArr = await enrichWithMetafields(tempArr, product.id);

      // Step 3: Do pricing computation
      tempArr = await computePrices(tempArr);

      console.log(tempArr);

      // Step 4: Update prices back to Shopify
      await updateVariantPrices(tempArr);

      res.status(200).send('OK');
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).send('Error');
    }
  },
};

async function enrichWithMetafields(tempArr, productId) {
  // Remove 'gid://shopify/Product/' prefix if present
  const cleanProductId = productId
    .toString()
    .replace('gid://shopify/Product/', '');

  // Get product-level metafields (classcode and goldKt)
  const productMetafieldsResp = await axios({
    url: `https://${SHOPIFY_SHOP_NAME}.myshopify.com/admin/api/2024-04/products/${cleanProductId}/metafields.json`,
    method: 'GET',
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_ACCESS_TOKEN,
      'Content-Type': 'application/json',
    },
  });

  const productMetafields = productMetafieldsResp.data.metafields;

  // Helper function to get product metafield values
  const getProductValue = (namespace, key) =>
    productMetafields.find(
      (m) => m.namespace === namespace && m.key === key
    )?.value || null;

  // Get product-level data
  const classcode = +getProductValue('sku', 'classcode');
  const goldKt = getProductValue('sku', 'gold_karat');

  // Enrich each variant with its metafields + product metafields
  const enrichedArr = await Promise.all(
    tempArr.map(async (variant) => {
      try {
        // Get variant-level metafields
        const variantMetafieldsResp = await axios({
          url: `https://${SHOPIFY_SHOP_NAME}.myshopify.com/admin/api/2024-04/variants/${variant.id}/metafields.json`,
          method: 'GET',
          headers: {
            'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_ACCESS_TOKEN,
            'Content-Type': 'application/json',
          },
        });

        const variantMetafields =
          variantMetafieldsResp.data.metafields;

        // Helper function to get variant metafield values
        const getVariantValue = (namespace, key) =>
          variantMetafields.find(
            (m) => m.namespace === namespace && m.key === key
          )?.value || null;

        // Get variant metafields
        const entryDate = getVariantValue('variant', 'entry_date');
        const vendor = getVariantValue('variant', 'vendor');
        const grossWeight = +getVariantValue(
          'variant',
          'gross_weight'
        );
        const autoUpdate = getVariantValue(
          'variant',
          'autoUpdatePrice'
        );

        // Handle tag_price with proper null checking
        const tagPriceRaw = getVariantValue('variant', 'tag_price');
        let tag_price = null;

        if (tagPriceRaw) {
          try {
            const parsedTagPrice = JSON.parse(tagPriceRaw);
            tag_price = parseInt(parsedTagPrice.amount);
          } catch (parseError) {
            console.error(
              `Error parsing tag_price for variant ${variant.id}:`,
              parseError
            );
          }
        }

        return {
          ...variant,
          // Product-level metafields
          classcode,
          goldKt,
          // Variant-level metafields
          entryDate,
          vendor,
          grossWeight,
          tag_price,
          autoUpdate,
          // For debugging
          tagPriceRaw,
        };
      } catch (error) {
        console.error(
          `Error fetching metafields for variant ${variant.id}:`,
          error
        );
        return {
          ...variant,
          // Set defaults for failed fetches
          classcode: null,
          goldKt: null,
          entryDate: null,
          vendor: null,
          grossWeight: null,
          tag_price: null,
          autoUpdate: null,
        };
      }
    })
  );

  return enrichedArr;
}

async function computePrices(tempArr) {
  const updatedArr = await Promise.all(
    tempArr.map(async (variant) => {
      try {
        // Skip pricing if autoUpdate is not enabled
        if (!variant.autoUpdate) {
          console.log(
            `Skipping ${variant.sku}: AutoUpdatePricing is false or not set`
          );
          return {
            ...variant,
            needsUpdate: false,
            skipReason: 'AutoUpdate disabled',
          };
        }

        // Validate required metafields
        if (!variant.goldKt) {
          console.log(
            `Skipping ${variant.sku}: Gold karat is missing`
          );
          return {
            ...variant,
            needsUpdate: false,
            skipReason: 'Missing gold karat',
          };
        }

        if (!variant.grossWeight || isNaN(variant.grossWeight)) {
          console.log(
            `Skipping ${variant.sku}: Gross weight is missing or invalid`
          );
          return {
            ...variant,
            needsUpdate: false,
            skipReason: 'Missing/invalid gross weight',
          };
        }

        if (!variant.entryDate) {
          console.log(
            `Skipping ${variant.sku}: Entry date is missing`
          );
          return {
            ...variant,
            needsUpdate: false,
            skipReason: 'Missing entry date',
          };
        }

        // Calculate product age in months
        const productAgeMonths =
          (new Date() - new Date(variant.entryDate)) /
          (1000 * 60 * 60 * 24 * 30);

        // Find matching pricing policy
        const policies = await PricingPolicy.find({
          Classcode: variant.classcode,
          FromMonths: { $lte: productAgeMonths },
          ToMonths: { $gte: productAgeMonths },
        });

        let matchedPolicy =
          policies.find((p) => p.Vendor === variant.vendor) ||
          policies.find((p) => !p.Vendor);

        if (!matchedPolicy) {
          console.log(
            `Skipping ${variant.sku}: No matching pricing policy found`
          );
          return {
            ...variant,
            needsUpdate: false,
            skipReason: 'No matching policy',
          };
        }

        let calculatedPrice = 0;
        let perGramOrDisc;

        // Calculate price based on policy type
        if (matchedPolicy.Type === 'PerGram') {
          if (variant.goldKt === '22KT') {
            calculatedPrice = Math.round(
              matchedPolicy.Base22KtRate * variant.grossWeight
            );
            perGramOrDisc = matchedPolicy.Base22KtRate;
          } else if (variant.goldKt === '21KT') {
            calculatedPrice = Math.round(
              matchedPolicy.Base21KtRate * variant.grossWeight
            );
            perGramOrDisc = matchedPolicy.Base21KtRate;
          } else if (variant.goldKt === '18KT') {
            calculatedPrice = Math.round(
              matchedPolicy.Base18KtRate * variant.grossWeight
            );
            perGramOrDisc = matchedPolicy.Base18KtRate;
          } else {
            console.log(
              `Skipping ${variant.sku}: Unsupported gold karat ${variant.goldKt}`
            );
            return {
              ...variant,
              needsUpdate: false,
              skipReason: 'Unsupported gold karat',
            };
          }
        } else if (matchedPolicy.Type === 'Discount') {
          if (!variant.tag_price) {
            console.log(
              `Skipping ${variant.sku}: Tag price required for discount calculation but missing`
            );
            return {
              ...variant,
              needsUpdate: false,
              skipReason: 'Missing tag price for discount',
            };
          }
          calculatedPrice = Math.round(
            variant.tag_price -
              (variant.tag_price * matchedPolicy.DiscountOnMargin) /
                100
          );
          perGramOrDisc = matchedPolicy.DiscountOnMargin;
        } else {
          console.log(
            `Skipping ${variant.sku}: Unknown policy type ${matchedPolicy.Type}`
          );
          return {
            ...variant,
            needsUpdate: false,
            skipReason: 'Unknown policy type',
          };
        }

        // Check if price actually changed
        const currentPrice = parseFloat(variant.current_price);
        const priceChanged =
          Math.floor(currentPrice) !== Math.floor(calculatedPrice); // Allow for small rounding differences

        return {
          ...variant,
          calculated_price: calculatedPrice,
          needsUpdate: priceChanged,
          policy_used: matchedPolicy.Name || 'Unnamed Policy',
          price_change: calculatedPrice - currentPrice,
          perGramOrDisc: perGramOrDisc,
          currentPrice: currentPrice,
        };
      } catch (error) {
        console.error(
          `Error calculating price for variant ${variant.id}:`,
          error
        );
        return {
          ...variant,
          needsUpdate: false,
          skipReason: 'Calculation error',
        };
      }
    })
  );

  return updatedArr;
}

async function updateVariantPrices(tempArr) {
  const variantsToUpdate = tempArr.filter(
    (variant) => variant.needsUpdate
  );

  if (variantsToUpdate.length === 0) {
    console.log('No variants need price updates');
    return;
  }

  console.log(
    `Updating prices for ${variantsToUpdate.length} variants`
  );

  const updatePromises = variantsToUpdate.map(async (variant) => {
    try {
      // Parse and update the structured title
      const titleParts = variant.title
        .split('|')
        .map((part) => part.trim());

      // Update index 1 (price part) with new calculated price
      let updatedTitle = variant.title;
      if (titleParts.length >= 2) {
        titleParts[1] = `$${variant.calculated_price}`;
        updatedTitle = titleParts.join(' | ');
        console.log(
          `Attempting option1 update: "${variant.title}" → "${updatedTitle}"`
        );
      }

      // Step 1: Update price and option1 (which controls the title)
      console.log('Making REST API call to update variant...');
      const restUpdateResp = await axios({
        url: `https://${SHOPIFY_SHOP_NAME}.myshopify.com/admin/api/2024-04/variants/${variant.id}.json`,
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
        data: {
          variant: {
            id: variant.id,
            price: variant.calculated_price.toString(),
            option1: updatedTitle, // Update option1 instead of title!
          },
        },
      });

      console.log(
        'Updated variant title from response:',
        restUpdateResp.data.variant.title
      );
      console.log(
        'Updated variant option1 from response:',
        restUpdateResp.data.variant.option1
      );
      console.log(
        'Updated variant price from response:',
        restUpdateResp.data.variant.price
      );

      // Step 2: Update metafields
      await axios({
        url: `https://${SHOPIFY_SHOP_NAME}.myshopify.com/admin/api/2024-04/variants/${variant.id}/metafields.json`,
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
        data: {
          metafield: {
            namespace: 'variant',
            key: 'per_gram_or_disc',
            value: variant.perGramOrDisc.toString(),
            type: 'single_line_text_field',
          },
        },
      });

      console.log(
        `✅ Updated ${variant.sku}: $${variant.current_price} → $${variant.calculated_price} (${variant.policy_used}) [Rate: ${variant.perGramOrDisc}]`
      );
    } catch (error) {
      console.error(`Error updating variant ${variant.sku}:`);
      console.error(
        'Error details:',
        error.response?.data || error.message
      );
    }
  });

  await Promise.all(updatePromises);
}
