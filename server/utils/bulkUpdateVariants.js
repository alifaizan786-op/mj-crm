// utils/graphqlBatchUpdate.js - GraphQL batching approach (RECOMMENDED)
const axios = require('axios');

async function batchUpdateVariantsGraphQL(variants, log) {
	const SHOP = process.env.SHOPIFY_SHOP_NAME;
	const TOKEN = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
	const API_URL = `https://${SHOP}.myshopify.com/admin/api/2025-01/graphql.json`;

	const batchSize = 25; // Optimal batch size for variant updates
	const delay = 1000; // 1 second between batches
	let updatedCount = 0;
	let errorCount = 0;

	const chunks = Array.from(
		{ length: Math.ceil(variants.length / batchSize) },
		(_, i) => variants.slice(i * batchSize, (i + 1) * batchSize)
	);

	await log(
		`🚀 Starting GraphQL batch update for ${variants.length} variants in ${chunks.length} batches`
	);
	await log(
		`📊 Batch configuration: ${batchSize} variants per batch, ${delay}ms delay between batches`
	);

	for (const [i, chunk] of chunks.entries()) {
		await log(
			`📦 Processing batch ${i + 1}/${chunks.length} (${chunk.length} variants)`
		);
		await log(`🔄 Starting batch ${i + 1}...`);

		try {
			const mutation = buildBatchMutation(chunk);
			const response = await executeGraphQLMutation(API_URL, TOKEN, mutation);

			// Process results
			const results = processBatchResults(response.data.data, chunk, log);
			updatedCount += results.success;
			errorCount += results.errors;

			await log(
				`✅ Batch ${i + 1} completed - Success: ${results.success}, Errors: ${
					results.errors
				}`
			);

			// Log any specific errors for debugging
			if (results.errorDetails.length > 0) {
				results.errorDetails.forEach((error) => {
					await.error(
						`❌ Error in batch ${i + 1} for variant ${error.variant}:`,
						error.errors
					);
				});
			}
		} catch (error) {
			errorCount += chunk.length;
			await log(`❌ Batch ${i + 1} failed completely: ${error.message}`);
			console.error('Full batch error:', error);
		}

		// Rate limiting - GraphQL allows ~1000 points/second
		// Each productVariantUpdate costs ~10 points, so 25 mutations = ~250 points
		if (i < chunks.length - 1) {
			await log(`⏳ Waiting ${delay}ms before next batch...`);
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}

	await log(
		`🎯 GraphQL batch update completed - Updated: ${updatedCount}, Errors: ${errorCount}`
	);
	await log(`📈 Final Results:`);
	await log(`   ✅ Successfully updated: ${updatedCount} variants`);
	await log(`   ❌ Failed updates: ${errorCount} variants`);
	await log(
		`   📊 Success rate: ${((updatedCount / variants.length) * 100).toFixed(
			1
		)}%`
	);

	return { updated: updatedCount, errors: errorCount };
}
function buildBatchMutation(variants) {
	const variantsByProduct = new Map();

	variants.forEach((variant) => {
		const productId = variant.productId;

		if (!productId) {
			console.error('Missing productId for variant:', variant.id);
			return;
		}

		if (!variantsByProduct.has(productId)) {
			variantsByProduct.set(productId, []);
		}
		variantsByProduct.get(productId).push(variant);
	});

	const mutations = Array.from(variantsByProduct.entries()).map(
		([productId, productVariants], prodIndex) => {
			const variantsInput = productVariants.map((variant) => {
				// Construct new title: SKU | Price | Grossweight
				const updatedTitle = `${variant.sku} | $${variant.calculated_price} | ${variant.grossWeight} g`;

				// Create option values with the updated title
				const optionValues = [];

				if (variant.selectedOptions && variant.selectedOptions.length > 0) {
					variant.selectedOptions.forEach((option) => {
						// Find the corresponding product option
						const productOption = variant.productOptions?.find(
							(po) => po.name === option.name
						);

						if (productOption) {
							optionValues.push(`{
              optionId: "${productOption.id}"
              name: "${updatedTitle.replace(/"/g, '\\"')}"
            }`);
						} else {
							// Fallback: use optionName if we don't have the ID
							optionValues.push(`{
              optionName: "${option.name.replace(/"/g, '\\"')}"
              name: "${updatedTitle.replace(/"/g, '\\"')}"
            }`);
						}
					});
				}

				console.log(
					`🔄 ${variant.sku}: Old="${variant.title}" → New="${updatedTitle}"`
				);

				let variantId = variant.id;
				if (
					typeof variantId === 'string' &&
					variantId.includes(
						'gid://shopify/ProductVariant/gid://shopify/ProductVariant/'
					)
				) {
					variantId = variantId.replace(
						'gid://shopify/ProductVariant/gid://shopify/ProductVariant/',
						'gid://shopify/ProductVariant/'
					);
				} else if (
					typeof variantId === 'string' &&
					!variantId.startsWith('gid://shopify/ProductVariant/')
				) {
					variantId = `gid://shopify/ProductVariant/${variant.id}`;
				}

				return `{
        id: "${variantId}"
        price: "${variant.calculated_price}"
        ${
					optionValues.length > 0
						? `optionValues: [${optionValues.join(',')}]`
						: ''
				}
        metafields: [{
          namespace: "variant"
          key: "per_gram_or_disc"
          value: "${(variant.perGramOrDisc || '')
						.toString()
						.replace(/"/g, '\\"')}"
          type: "single_line_text_field"
        }]
      }`;
			});

			return `
      product${prodIndex}: productVariantsBulkUpdate(
        productId: "${productId}"
        variants: [${variantsInput.join(',')}]
      ) {
        productVariants {
          id
          title
          price
        }
        userErrors {
          field
          message
        }
      }
    `;
		}
	);

	return `mutation batchVariantUpdate { ${mutations.join('\n')} }`;
}

async function executeGraphQLMutation(apiUrl, token, mutation) {
	const response = await axios.post(
		apiUrl,
		{
			query: mutation,
		},
		{
			headers: {
				'X-Shopify-Access-Token': token,
				'Content-Type': 'application/json',
			},
			timeout: 30000, // 30 second timeout
		}
	);

	if (response.data.errors) {
		throw new Error(`GraphQL Error: ${JSON.stringify(response.data.errors)}`);
	}

	return response;
}

function processBatchResults(data, originalVariants, log) {
	let success = 0;
	let errors = 0;
	const errorDetails = [];

	Object.keys(data).forEach((key) => {
		const result = data[key];

		if (result.userErrors && result.userErrors.length > 0) {
			errors += result.productVariants?.length || 1;
			errorDetails.push({
				product: key,
				errors: result.userErrors,
			});
		} else if (result.productVariants) {
			success += result.productVariants.length;
			result.productVariants.forEach((v) => {
				console.log(`✅ Updated variant ${v.id} - Price: ${v.price}`);
			});
		}
	});

	return { success, errors, errorDetails };
}
module.exports = {
	batchUpdateVariantsGraphQL,
};
