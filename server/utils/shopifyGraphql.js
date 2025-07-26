const axios = require('axios');
require('dotenv').config();

const SHOPIFY_SHOP = process.env.SHOPIFY_SHOP_NAME;
const SHOPIFY_TOKEN = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
const SHOPIFY_GRAPHQL_URL = `https://${SHOPIFY_SHOP}.myshopify.com/admin/api/2024-04/graphql.json`;

const HEADERS = {
  'Content-Type': 'application/json',
  'X-Shopify-Access-Token': SHOPIFY_TOKEN,
};

async function shopifyGraphQL(query) {
  const res = await axios.post(
    SHOPIFY_GRAPHQL_URL,
    { query },
    { headers: HEADERS }
  );
  return res.data;
}

module.exports = { shopifyGraphQL };
