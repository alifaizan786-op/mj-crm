const axios = require('axios');

const SHOP = process.env.Shopify_Shop_Name;
const ADMIN_TOKEN = process.env.Shopify_Admin_Api_Access_Token;
const SHOPIFY_API_URL = `https://${SHOP}.myshopify.com/admin/api/2023-10/graphql.json`;
const METAL_PRICE_API = process.env.METAL_PRICE_API;
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

const restInstance = axios.create({
  baseURL: `https://${SHOP}.myshopify.com/admin/api/2023-10`,
  headers: {
    'X-Shopify-Access-Token': ADMIN_TOKEN,
    'Content-Type': 'application/json',
  },
});

const graphQlInstance = axios.create({
  baseURL: `https://${SHOP}.myshopify.com/admin/api/2023-10/graphql.json`,
  headers: {
    'X-Shopify-Access-Token': ADMIN_TOKEN,
    'Content-Type': 'application/json',
  },
});

module.exports = {
  async getClientCoupons(req, res) {
    try {
      const now = new Date();

      const {
        data: { price_rules },
      } = await restInstance.get('/price_rules.json');

      const results = await Promise.all(
        price_rules.map(async (rule) => {
          if (rule.customer_selection !== 'all') return [];

          const { data } = await restInstance.get(
            `/price_rules/${rule.id}/discount_codes.json`
          );

          // Attempt to resolve first collection handle (if exists)
          let cta_link = '/';
          let subheadingTarget = 'sitewide';

          if (rule.entitled_collection_ids?.length > 0) {
            const firstCollectionId = rule.entitled_collection_ids[0];

            try {
              // Try smart collection first
              const smart = await restInstance.get(
                `/smart_collections/${firstCollectionId}.json`
              );
              cta_link = `/collections/${smart.data.smart_collection.handle}`;
              subheadingTarget = 'on selected collections';
            } catch {
              try {
                // Then try custom collection
                const custom = await restInstance.get(
                  `/custom_collections/${firstCollectionId}.json`
                );
                cta_link = `/collections/${custom.data.custom_collection.handle}`;
                subheadingTarget = 'on selected collections';
              } catch {
                // fallback
                cta_link = '/';
                subheadingTarget = 'sitewide';
              }
            }
          }

          return data.discount_codes.map((code) => {
            const isPercentage = rule.value_type === 'percentage';
            const value = Math.abs(rule.value);
            const formattedDiscount = isPercentage
              ? `${value}% Off`
              : `$${value} Off`;

            const endsAt = new Date(rule.ends_at);
            const isActive =
              new Date(rule.starts_at) <= now && endsAt >= now;

            return {
              code: code.code,
              heading: formattedDiscount,
              subheading: `${rule.title} – ${
                rule.target_type === 'shipping_line'
                  ? 'on shipping'
                  : 'on products'
              } ${subheadingTarget}. Valid until ${endsAt.toLocaleDateString()}.`,
              starts_at: rule.starts_at,
              ends_at: rule.ends_at,
              usage_limit: rule.usage_limit,
              status: isActive ? 'enabled' : 'expired',
              cta_link,
            };
          });
        })
      );

      const publicCoupons = results
        .flat()
        .filter((c) => c.status === 'enabled');
      res.json(publicCoupons);
    } catch (error) {
      console.error(
        'Error fetching enriched public coupons:',
        error.response?.data || error.message
      );
      res
        .status(500)
        .json({ error: 'Failed to fetch public discount codes' });
    }
  },
  async getGoldPrice(req, res) {
    try {
      res.json({
        goldPrice: 3600,
      });
    } catch (error) {
      res.json({ error: error });
    }
  },
  async addToWishList(req, res) {
    const { customerId, productId } = req.body;

    if (!customerId || !productId) {
      return res
        .status(400)
        .json({ error: 'Missing customerId or productId' });
    }

    try {
      // 1. Get current wishlist metafield
      const query = `
      query GetWishlist($customerId: ID!) {
        customer(id: $customerId) {
          metafield(namespace: "client", key: "wishlist") {
            id
            value
          }
        }
      }
    `;

      const response = await axios.post(
        SHOPIFY_API_URL,
        { query, variables: { customerId } },
        {
          headers: {
            'X-Shopify-Access-Token': ADMIN_TOKEN,
            'Content-Type': 'application/json',
          },
        }
      );

      const metafield = response.data.data.customer.metafield;
      const currentWishlist = metafield
        ? JSON.parse(metafield.value)
        : [];

      if (currentWishlist.includes(productId)) {
        return res
          .status(200)
          .json({ message: 'Already in wishlist' });
      }

      const updatedWishlist = [...currentWishlist, productId];

      const metafieldValue = JSON.stringify(updatedWishlist); // JSON array of GIDs as string

      // 2. Update or create metafield
      const mutation = `
            mutation UpdateWishlist($customerId: ID!, $value: String!) {
              customerUpdate(input: {
                id: $customerId,
                metafields: [
                  {
                    namespace: "client",
                    key: "wishlist",
                    type: "list.product_reference",
                    value: $value
                    ${metafield ? `, id: "${metafield.id}"` : ''}
                  }
                ]
              }) {
                customer {
                  id
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `;

      const mutationVars = {
        customerId,
        value: metafieldValue,
      };
      const updateResponse = await axios.post(
        SHOPIFY_API_URL,
        { query: mutation, variables: mutationVars },
        {
          headers: {
            'X-Shopify-Access-Token': ADMIN_TOKEN,
            'Content-Type': 'application/json',
          },
        }
      );

      const errors =
        updateResponse.data.data.customerUpdate.userErrors;
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      return res
        .status(200)
        .json({ success: true, wishlist: updatedWishlist });
    } catch (err) {
      console.error(err.response?.data || err.message);
      return res
        .status(500)
        .json({ error: 'Failed to update wishlist' });
    }
  },
  async removeFromWishlist(req, res) {
    const { customerId, productId } = req.body;

    if (!customerId || !productId) {
      return res
        .status(400)
        .json({ error: 'Missing customerId or productId' });
    }

    try {
      // 1. Get current wishlist metafield
      const query = `
      query GetWishlist($customerId: ID!) {
        customer(id: $customerId) {
          metafield(namespace: "client", key: "wishlist") {
            id
            value
          }
        }
      }
    `;

      const response = await axios.post(
        SHOPIFY_API_URL,
        { query, variables: { customerId } },
        {
          headers: {
            'X-Shopify-Access-Token': ADMIN_TOKEN,
            'Content-Type': 'application/json',
          },
        }
      );

      const metafield = response.data.data.customer.metafield;
      const currentWishlist = metafield
        ? JSON.parse(metafield.value)
        : [];

      // If item is not in the list, do nothing
      if (!currentWishlist.includes(productId)) {
        return res.status(200).json({
          message: 'Product not in wishlist',
          wishlist: currentWishlist,
        });
      }

      // 2. Remove the product ID
      const updatedWishlist = currentWishlist.filter(
        (id) => id !== productId
      );
      const metafieldValue = JSON.stringify(updatedWishlist);

      // 3. Update the metafield
      const mutation = `
      mutation UpdateWishlist($customerId: ID!, $value: String!) {
        customerUpdate(input: {
          id: $customerId,
          metafields: [
            {
              namespace: "client",
              key: "wishlist",
              type: "list.product_reference",
              value: $value
              ${metafield ? `, id: "${metafield.id}"` : ''}
            }
          ]
        }) {
          customer {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

      const mutationVars = {
        customerId,
        value: metafieldValue,
      };

      const updateResponse = await axios.post(
        SHOPIFY_API_URL,
        { query: mutation, variables: mutationVars },
        {
          headers: {
            'X-Shopify-Access-Token': ADMIN_TOKEN,
            'Content-Type': 'application/json',
          },
        }
      );

      const errors =
        updateResponse.data.data.customerUpdate.userErrors;
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      return res.status(200).json({
        success: true,
        wishlist: updatedWishlist,
      });
    } catch (err) {
      console.error(err.response?.data || err.message);
      return res
        .status(500)
        .json({ error: 'Failed to update wishlist' });
    }
  },
  async proxyUpdateViewCount(req, res) {
    const productId = req.params.productId;

    if (!productId) {
      return res.status(400).send('Missing product ID');
    }

    try {
      // Step 1: Get existing metafield
      const getMetafieldsQuery = `
        query {
          product(id: "gid://shopify/Product/${productId}") {
            metafield(namespace: "sku", key: "view_count") {
              id
              value
              type
            }
          }
        }
      `;

      const getResponse = await axios.post(
        SHOPIFY_API_URL,
        { query: getMetafieldsQuery },
        {
          headers: {
            'X-Shopify-Access-Token': ADMIN_TOKEN,
            'Content-Type': 'application/json',
          },
        }
      );

      const metafield = getResponse.data.data.product.metafield;
      const currentCount = metafield
        ? parseInt(metafield.value, 10)
        : 0;
      const metafieldId = metafield?.id;

      // Step 2: Update or create metafield with +1
      const newCount = currentCount + 1;

      const mutation = `
          mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
            metafieldsSet(metafields: $metafields) {
              metafields {
                key
                namespace
                value
                type
              }
              userErrors {
                field
                message
              }
            }
          }
        `;

      const variables = {
        metafields: [
          {
            ownerId: `gid://shopify/Product/${productId}`,
            namespace: 'sku',
            key: 'view_count',
            type: 'number_integer',
            value: `${newCount}`,
          },
        ],
      };

      const updateResponse = await axios.post(
        SHOPIFY_API_URL,
        {
          query: mutation,
          variables,
        },
        {
          headers: {
            'X-Shopify-Access-Token': ADMIN_TOKEN,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = updateResponse.data?.data?.metafieldsSet;

      if (result?.userErrors?.length) {
        return res.status(400).json({ error: result.userErrors });
      }

      return res.status(200).json({ updated: result.metafields });
    } catch (error) {
      console.error('View count update error:', error.message);
      return res.status(500).send('Server error');
    }
  },
  async goldPriceApi(req, res) {
    const { url } = req.body;

    if (!url) {
      return res
        .status(400)
        .json({ error: 'URL is required in request body' });
    }

    try {
      const apiUrl = url.replace('replaceApiKey', METAL_PRICE_API);

      // Normalize URL (sort query params)
      const urlObj = new URL(apiUrl);
      urlObj.searchParams.sort(); // Ensure order consistency

      const cacheKey = urlObj.toString();

      const cachedEntry = cache.get(cacheKey);
      const now = Date.now();

      if (cachedEntry && now - cachedEntry.timestamp < CACHE_TTL) {
        console.log('Serving from cache for:', cacheKey);
        return res.json(cachedEntry.data);
      }

      console.log('Fetching fresh data for:', cacheKey);
      const response = await fetch(cacheKey);
      const data = await response.json();

      // Cache it
      cache.set(cacheKey, {
        data,
        timestamp: now,
      });

      res.json(data);
    } catch (error) {
      console.error('Error fetching gold price:', error);
      res
        .status(500)
        .json({ error: 'Failed to fetch gold price data' });
    }
  },
};
