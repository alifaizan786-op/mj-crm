const { SARECORD } = require('../../models'); // Import the Mongoose model
const path = require('path');
const { MalaniCRM } = require('../../config/connection'); // MongoDB connection

const DBFReader = require('../DatabaseReader/DBFReader');
const validateDate = require('../DataValidation/DateValidator');

// Array of file paths to read data from
let filePaths = [
  // ATL
  {
    name: 'ATL',
    DBF: path.resolve(
      __dirname,
      '../../../../../VISUALJS/data/ATL/ARCHIVE/SARECORD.DBF'
    ),
  },
  {
    name: 'ATL',
    DBF: path.resolve(
      __dirname,
      '../../../../../VISUALJS/data/ATL/CURRENT/SARECORD.DBF'
    ),
  },
  // AS
  {
    name: 'AS',
    DBF: path.resolve(
      __dirname,
      '../../../../../VISUALJS/data/AS/ARCHIVE/SARECORD.DBF'
    ),
  },
  {
    name: 'AS',
    DBF: path.resolve(
      __dirname,
      '../../../../../VISUALJS/data/AS/CURRENT/SARECORD.DBF'
    ),
  },
  // AI
  {
    name: 'AI',
    DBF: path.resolve(
      __dirname,
      '../../../../../VISUALJS/data/AI/ARCHIVE/SARECORD.DBF'
    ),
  },
  {
    name: 'AI',
    DBF: path.resolve(
      __dirname,
      '../../../../../VISUALJS/data/AI/CURRENT/SARECORD.DBF'
    ),
  },
  // TPA
  {
    name: 'TPA',
    DBF: path.resolve(
      __dirname,
      '../../../../../VISUALJS/data/TPA/ARCHIVE/SARECORD.DBF'
    ),
  },
  {
    name: 'TPA',
    DBF: path.resolve(
      __dirname,
      '../../../../../VISUALJS/data/TPA/CURRENT/SARECORD.DBF'
    ),
  },
  // TS
  {
    name: 'TS',
    DBF: path.resolve(
      __dirname,
      '../../../../../VISUALJS/data/TS/ARCHIVE/SARECORD.DBF'
    ),
  },
  {
    name: 'TS',
    DBF: path.resolve(
      __dirname,
      '../../../../../VISUALJS/data/TS/CURRENT/SARECORD.DBF'
    ),
  },
  // TI
  {
    name: 'TI',
    DBF: path.resolve(
      __dirname,
      '../../../../../VISUALJS/data/TI/ARCHIVE/SARECORD.DBF'
    ),
  },
  {
    name: 'TI',
    DBF: path.resolve(
      __dirname,
      '../../../../../VISUALJS/data/TI/CURRENT/SARECORD.DBF'
    ),
  },
  // DAL
  {
    name: 'DAL',
    DBF: path.resolve(
      __dirname,
      '../../../../../VISUALJS/data/DAL/ARCHIVE/SARECORD.DBF'
    ),
  },
  {
    name: 'DAL',
    DBF: path.resolve(
      __dirname,
      '../../../../../VISUALJS/data/DAL/CURRENT/SARECORD.DBF'
    ),
  },
  // DS
  {
    name: 'DS',
    DBF: path.resolve(
      __dirname,
      '../../../../../VISUALJS/data/DS/ARCHIVE/SARECORD.DBF'
    ),
  },
  {
    name: 'DS',
    DBF: path.resolve(
      __dirname,
      '../../../../../VISUALJS/data/DS/CURRENT/SARECORD.DBF'
    ),
  },
  // DI
  {
    name: 'DI',
    DBF: path.resolve(
      __dirname,
      '../../../../../VISUALJS/data/DI/ARCHIVE/SARECORD.DBF'
    ),
  },
  {
    name: 'DI',
    DBF: path.resolve(
      __dirname,
      '../../../../../VISUALJS/data/DI/CURRENT/SARECORD.DBF'
    ),
  },
];

// Get the current year
const currentYear = new Date().getFullYear();

// Function to process and map DBF data to the MongoDB model
async function processDBFData(filePath, name) {
  console.time(`Processing DBF data from: ${filePath}`);
  try {
    const data = await DBFReader(filePath); // Read the DBF file
    console.time(`Inserting/Updating data from: ${filePath}`);

    const bulkOps = [];
    const batchSize = data.length > 50000 ? 2000 : 5000; // Set a batch size for processing

    for (let i = 0; i < data.length; i++) {
      const record = data[i];

      // Skip records with null or undefined sku_no
      if (!record.SKU_NO) continue;

      const storeCode = name;

      // Validate the date and skip records from previous years
      const saleDate = await validateDate(record.DATE);
      if (
        !saleDate ||
        new Date(saleDate).getFullYear() < currentYear
      ) {
        continue; // Skip records from previous years
      }

      const mappedRecord = {
        recno: record.RECNO || null,
        job_order: record.JOB_ORDER || null,
        dept: record.DEPT || null,
        customer: record.CUSTOMER || null,
        sku_no: record.SKU_NO,
        mfg_code: record.MFG_CODE || null,
        vndr_style: record.VNDR_STYLE || null,
        ven_code: record.VEN_CODE || null,
        mnemonic: record.MNEMONIC || null,
        class_12: record.CLASS_12 || null,
        class_34: record.CLASS_34 || null,
        desc: record.DESC || null,
        desc2: record.DESC2 || null,
        date: saleDate,
        detail: record.DETAIL || null,
        detail_cap: record.DETAIL_CAP || null,
        qty: parseInt(record.QTY) || 0,
        qty_order: parseInt(record.QTY_ORDER) || 0,
        weight: parseInt(record.WEIGHT) || 0,
        precious: parseInt(record.PRECIOUS) || 0,
        cprecious: parseInt(record.CPRECIOUS) || 0,
        cost: parseInt(record.COST) || 0,
        price: parseInt(record.PRICE) || 0,
        retail: parseInt(record.RETAIL) || 0,
        msrp: parseInt(record.MSRP) || 0,
        item: record.ITEM || null,
        sold: !!record.SOLD,
        normalsale: !!record.NORMALSALE,
        period: record.PERIOD || null,
        saleloc: record.SALELOC || null,
        taxstatus: record.TAXSTATUS || null,
        taxstat2: record.TAXSTAT2 || null,
        taxstat3: record.TAXSTAT3 || null,
        clerk1: record.CLERK1 || null,
        comm_rate1: parseInt(record.COMM_RATE1) || 0,
        check1: !!record.CHECK1,
        clerk2: record.CLERK2 || null,
        comm_rate2: parseInt(record.COMM_RATE2) || 0,
        check2: !!record.CHECK2,
        polled: !!record.POLLED,
        mod_date: await validateDate(record.MOD_DATE),
        mod_second: record.MOD_SECOND
          ? new Date(record.MOD_SECOND)
          : null,
        store_id: record.STORE_ID || null,
        qbid: record.QBID || null,
        qbseq: record.QBSEQ || null,
        qbadd: !!record.QBADD,
        qbmod: !!record.QBMOD,
        img_exists: !!record.IMG_EXISTS,
        chkfield: record.CHKFIELD || null,
        store_code: storeCode,
      };

      // Use updateOne with upsert: true
      bulkOps.push({
        updateOne: {
          filter: { sku_no: record.SKU_NO, store_code: storeCode },
          update: { $set: mappedRecord },
          upsert: true, // Insert the document if it doesn't exist
        },
      });

      // Execute bulk operations in batches
      if (bulkOps.length >= batchSize) {
        await SARECORD.bulkWrite(bulkOps, { ordered: true });
        bulkOps.length = 0; // Clear the operations array
      }
    }

    // Execute remaining bulk operations
    if (bulkOps.length > 0) {
      await SARECORD.bulkWrite(bulkOps, { ordered: true });
    }

    console.timeEnd(`Inserting/Updating data from: ${filePath}`);
    console.timeEnd(`Processing DBF data from: ${filePath}`);
  } catch (error) {
    console.error(
      `Error processing DBF data from ${filePath}:`,
      error
    );
  }
}

// Main function to execute the data transfer
async function main() {
  console.time('Total Execution Time');
  try {
    await Promise.all(
      filePaths.map((file) => processDBFData(file.DBF, file.name))
    );
    console.log('Data transfer complete.');
  } catch (error) {
    console.error('Error in main function:', error);
  }
  console.timeEnd('Total Execution Time');
}

// Establish the MongoDB connection
MalaniCRM.once('open', async () => {
  console.log('Connected to MongoDB.');
  await main();
  await MalaniCRM.close();
  console.log('MongoDB connection closed.');
});

//  node --max-old-space-size=16384 utils/DatabaseWriter/SARECORD.js
