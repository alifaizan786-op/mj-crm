const https = require('https');
const readline = require('readline');
const { shopifyGraphQL } = require('./shopifyGraphql');
const { createLogger } = require('./logger');

async function runBulkJob({
  graphqlQuery,
  onEachRecord,
  jobName = 'bulkJob',
}) {
  const log = createLogger(jobName);

  // 1. Start Bulk Operation
  const mutation = `
    mutation {
      bulkOperationRunQuery(
        query: """${graphqlQuery}"""
      ) {
        bulkOperation {
          id
          status
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const startRes = await shopifyGraphQL(mutation);
  const errors = startRes?.data?.bulkOperationRunQuery?.userErrors;
  if (errors?.length) {
    await log(`❌ Bulk start failed: ${JSON.stringify(errors)}`);
    throw new Error(`Bulk start failed: ${JSON.stringify(errors)}`);
  }

  await log('📤 Bulk job started. Waiting for completion...');

  // 2. Poll until completed
  const getStatus = async () => {
    const query = `
      {
        currentBulkOperation {
          id
          status
          url
          errorCode
          createdAt
          completedAt
        }
      }
    `;
    const res = await shopifyGraphQL(query);
    return res.data.currentBulkOperation;
  };

  const waitForCompletion = async () => {
    while (true) {
      const op = await getStatus();
      await log(`⏳ Status: ${op.status}`);

      if (op.status === 'COMPLETED') return op.url;
      if (op.status === 'FAILED')
        throw new Error('Bulk operation failed');

      await new Promise((r) => setTimeout(r, 10000));
    }
  };

  const jsonlUrl = await waitForCompletion();
  await log(`📥 Downloading result from: ${jsonlUrl}`);

  const stream = await getHttpsStream(jsonlUrl);

  await new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: stream,
      crlfDelay: Infinity,
    });

    rl.on('line', async (line) => {
      try {
        const record = JSON.parse(line);
        await onEachRecord(record);
      } catch (err) {
        log(`⚠️ Failed to process line: ${err.message}`);
      }
    });

    rl.on('close', () => {
      log('✅ Finished processing all records.');
      resolve();
    });

    rl.on('error', async (err) => {
      await log(`❌ Stream error: ${err.message}`);
      reject(err);
    });
  });
}

// Helper: returns readable stream from HTTPS URL
function getHttpsStream(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Non-200 status: ${res.statusCode}`));
        } else {
          resolve(res);
        }
      })
      .on('error', reject);
  });
}

module.exports = { runBulkJob };
