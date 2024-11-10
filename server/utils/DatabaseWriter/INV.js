const { INV } = require('../../models'); // Import the Mongoose model
const path = require('path');
const { MalaniCRM } = require('../../config/connection'); // MongoDB connection

const DBFReader = require('../DatabaseReader/DBFReader');
const validateDate = require('../DataValidation/DateValidator');

// Array of file paths to read data from
let filePaths = [
  {
    name: 'ATL',
    DBF: path.resolve(
      __dirname,
      '../../../../../VISUALJS/data/ATL/CURRENT/INV.DBF'
    ),
  },
  {
    name: 'AS',
    DBF: path.resolve(
      __dirname,
      '../../../../../VISUALJS/data/AS/CURRENT/INV.DBF'
    ),
  },
  {
    name: 'AI',
    DBF: path.resolve(
      __dirname,
      '../../../../../VISUALJS/data/AI/CURRENT/INV.DBF'
    ),
  },
  {
    name: 'DAL',
    DBF: path.resolve(
      __dirname,
      '../../../../../VISUALJS/data/DAL/CURRENT/INV.DBF'
    ),
  },
  {
    name: 'DS',
    DBF: path.resolve(
      __dirname,
      '../../../../../VISUALJS/data/DS/CURRENT/INV.DBF'
    ),
  },
  {
    name: 'DI',
    DBF: path.resolve(
      __dirname,
      '../../../../../VISUALJS/data/DI/CURRENT/INV.DBF'
    ),
  },
  {
    name: 'TPA',
    DBF: path.resolve(
      __dirname,
      '../../../../../VISUALJS/data/TPA/CURRENT/INV.DBF'
    ),
  },
  {
    name: 'TS',
    DBF: path.resolve(
      __dirname,
      '../../../../../VISUALJS/data/TS/CURRENT/INV.DBF'
    ),
  },
  {
    name: 'TI',
    DBF: path.resolve(
      __dirname,
      '../../../../../VISUALJS/data/TI/CURRENT/INV.DBF'
    ),
  },
  {
    name: 'WS',
    DBF: path.resolve(
      __dirname,
      '../../../../../VISUALJS/data/WS/CURRENT/INV.DBF'
    ),
  },
];

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
      const skuNo = record.SKU_NO;
      const recordKey = `${skuNo}-${storeCode}`;

      let date = await validateDate(record.DATE);
      const mappedRecord = {
        recno: record.RECNO || null,
        sku_no: skuNo,
        po_no: record.PO_NO || null,
        mfg_code: record.MFG_CODE || null,
        ven_code: record.VEN_CODE || null,
        vndr_style: record.VNDR_STYLE || null,
        substyle: record.SUBSTYLE || null,
        desc: record.DESC || null,
        desc2: record.DESC2 || null,
        class_12: parseInt(record.CLASS_12) || 0,
        class_34: record.CLASS_34 || null,
        category3: record.CATEGORY3 || null,
        size: record.SIZE || null,
        mat_type: record.MAT_TYPE || null,
        mat_color: record.MAT_COLOR || null,
        mat_finish: record.MAT_FINISH || null,
        cost: record.COST || null,
        repl_cost: record.REPL_COST || null,
        cost_per: record.COST_PER || null,
        retail: parseInt(record.RETAIL) || 0,
        retail_per: record.RETAIL_PER || null,
        min_price: record.MIN_PRICE || null,
        msrp: record.MSRP || null,
        qty_order: record.QTY_ORDER || null,
        date: date,
        rec_qty1: record.REC_QTY1 || null,
        invoice: record.INVOICE || null,
        originvoic: record.ORIGINVOIC || null,
        item: record.ITEM || null,
        loc1: record.LOC1 || null,
        loc_qty1: parseInt(record.LOC_QTY1) || 0,
        wt_order: record.WT_ORDER || null,
        wt_rec: record.WT_REC || null,
        weight: record.WEIGHT || null,
        precious: record.PRECIOUS || null,
        cprecious: record.CPRECIOUS || null,
        to_return: record.TO_RETURN || null,
        returned: record.RETURNED || null,
        layaway_qt: record.LAYAWAY_QT || null,
        layaway_wt: record.LAYAWAY_WT || null,
        mnemonic: record.MNEMONIC || null,
        phys_qty: record.PHYS_QTY || null,
        phys_wt: record.PHYS_WT || null,
        memo_qty: record.MEMO_QTY || null,
        memo_wt: record.MEMO_WT || null,
        reorderqty: record.REORDERQTY || null,
        reorderwt: record.REORDERWT || null,
        high_qty: record.HIGH_QTY || null,
        high_wt: record.HIGH_WT || null,
        job_order: record.JOB_ORDER || null,
        comm_perc: record.COMM_PERC || null,
        spiff_perc: record.SPIFF_PERC || null,
        goldfactor: record.GOLDFACTOR || null,
        laborcost: record.LABORCOST || null,
        laborprice: record.LABORPRICE || null,
        part_no: record.PART_NO || null,
        stdsaleqty: record.STDSALEQTY || null,
        picturefil: record.PICTUREFIL || null,
        polled: record.POLLED || false,
        mod_date: await validateDate(record.MOD_DATE),
        mod_second: record.MOD_SECOND
          ? new Date(record.MOD_SECOND)
          : null,
        store_id: record.STORE_ID || null,
        sku1: record.SKU1 || null,
        sku2: record.SKU2 || null,
        temp_logic: record.TEMP_LOGIC || null,
        temp_qty: record.TEMP_QTY || null,
        temp_date: await validateDate(record.TEMP_DATE),
        extended: record.EXTENDED || null,
        pictures: record.PICTURES || null,
        split_sku: record.SPLIT_SKU || null,
        po_item: record.PO_ITEM || null,
        audit_memo: record.AUDIT_MEMO || null,
        webcode: record.WEBCODE || null,
        webexpdate: await validateDate(record.WEBEXPDATE),
        chkfield: record.CHKFIELD || null,
        store_code: storeCode,
      };

      // Use updateOne with upsert: true
      bulkOps.push({
        updateOne: {
          filter: { sku_no: skuNo, store_code: storeCode },
          update: { $set: mappedRecord },
          upsert: true, // Insert the document if it doesn't exist
        },
      });

      // Execute bulk operations in batches
      if (bulkOps.length >= batchSize) {
        try {
          await INV.bulkWrite(bulkOps, { ordered: true });
        } catch (error) {
          console.error(`BulkWrite error for ${filePath}:`, error);
        }
        bulkOps.length = 0; // Clear the operations array
      }
    }

    console.timeEnd(`Inserting/Updating data from: ${filePath}`);
    console.timeEnd(`Processing DBF data from: ${filePath}`);
  } catch (error) {
    console.error(
      `Error processing DBF data from ${filePath}:`,
      error
    );
    throw error;
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
    process.exit(1);
  }
  console.timeEnd('Total Execution Time');
}

// Establish the MongoDB connection
MalaniCRM.once('open', async () => {
  console.log('Connected to MongoDB.');

  // Execute the main function
  await main();

  // Close the MongoDB connection when the process is complete
  await MalaniCRM.close();
  console.log('MongoDB connection closed.');
});

//  node --max-old-space-size=16384 utils/DatabaseWriter/INV.js
