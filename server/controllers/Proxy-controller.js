const axios = require('axios');

const SHOP = process.env.Shopify_Shop_Name;
const ADMIN_TOKEN = process.env.Shopify_Admin_Api_Access_Token;
const SHOPIFY_API_URL = `https://${SHOP}.myshopify.com/admin/api/2023-10/graphql.json`;

module.exports = {
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
};
