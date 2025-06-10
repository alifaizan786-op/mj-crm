const { PricingPolicy, GoldWeb } = require('../models');
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

      console.log({
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
};
