const axios = require('axios');
require('dotenv').config();

const SHOP = process.env.SHOPIFY_SHOP_NAME;
const TOKEN = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
const GRAPHQL_URL = `https://${SHOP}.myshopify.com/admin/api/2024-04/graphql.json`;
const HEADERS = {
  'Content-Type': 'application/json',
  'X-Shopify-Access-Token': TOKEN,
};

async function updateField({
  parent,
  fieldType,
  parentId,
  name,
  namespace,
  key,
  type,
  value,
}) {
  if (!['Product', 'Variant'].includes(parent)) {
    throw new Error(
      "Invalid parent type: must be 'Product' or 'Variant'"
    );
  }

  if (!['Metafield', 'Built-In'].includes(fieldType)) {
    throw new Error(
      "Invalid fieldType: must be 'Metafield' or 'Built-In'"
    );
  }

  if (fieldType === 'Metafield') {
    if (!namespace || !key || !type) {
      throw new Error(
        'Missing namespace, key, or type for metafield update'
      );
    }

    const mutation = `
      mutation {
        metafieldsSet(metafields: [
          {
            ownerId: "${parentId}",
            namespace: "${namespace}",
            key: "${key}",
            type: "${type}",
            value: "${value}"
          }
        ]) {
          metafields {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    try {
      const res = await axios.post(
        GRAPHQL_URL,
        { query: mutation },
        { headers: HEADERS }
      );
      const errors = res?.data?.data?.metafieldsSet?.userErrors;
      if (errors?.length) {
        console.error('⚠️ Metafield error:', errors);
      }
    } catch (e) {
      console.error('❌ Metafield update failed:', e.message);
    }
  } else if (fieldType === 'Built-In') {
    if (!name)
      throw new Error("Missing built-in field 'name' to update");

    // Map mutation input fields dynamically
    const inputType =
      parent === 'Product' ? 'ProductInput' : 'ProductVariantInput';
    const mutationName =
      parent === 'Product' ? 'productUpdate' : 'productVariantUpdate';

    const mutation = `
      mutation {
        ${mutationName}(input: {
          id: "${parentId}",
          ${name}: ${typeof value === 'string' ? `"${value}"` : value}
        }) {
          ${parent.toLowerCase()} {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    try {
      const res = await axios.post(
        GRAPHQL_URL,
        { query: mutation },
        { headers: HEADERS }
      );
      const errors = res?.data?.data?.[mutationName]?.userErrors;
      if (errors?.length) {
        console.error('⚠️ Built-in field error:', errors);
      }
    } catch (e) {
      console.error('❌ Built-in update failed:', e.message);
    }
  }
}

module.exports = { updateField };
