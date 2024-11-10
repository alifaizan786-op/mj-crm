const { CUSTOMER } = require('../../models'); // Import the Mongoose model
const path = require('path');
const { MalaniCRM } = require('../../config/connection'); // MongoDB connection

const DBFReader = require('../DatabaseReader/DBFReader');
const validateDate = require('../DataValidation/DateValidator');
const validatePhone = require('../DataValidation/PhoneValidator');

// Array of file paths to read data from
let filePaths = [
  {
    name: 'AI',
    DBF: path.resolve(
      __dirname,
      '../../../SampleDBF/AI/Current/CUSTOMER.DBF'
    ),
  },
];

async function processDBFData(filePath, name) {
  console.time(`Processing DBF data from: ${filePath}`);
  try {
    const data = await DBFReader(filePath); // Read the DBF file
    console.time(`Inserting/Updating data from: ${filePath}`);

    const bulkOps = [];
    const batchSize = data.length > 50000 ? 2000 : 5000; // Set a batch size for processing

    for (let i = 0; i < data.length; i++) {
      const record = data[i];

      // Skip records with missing first and last names
      if (!record.FIRST && !record.LAST) continue;

      // Clean up phone numbers
      const home = validatePhone(record.HOME);
      const work = validatePhone(record.WORK);
      const mobile = validatePhone(record.MOBILE);

      const mappedRecord = {
        recno: record.RECNO || null,
        last: record.LAST || null,
        customer: record.CUSTOMER || null,
        first: record.FIRST || null,
        title1: record.TITLE1 || null,
        address: record.ADDRESS || null,
        address2: record.ADDRESS2 || null,
        city: record.CITY || null,
        state: record.STATE || null,
        zip: record.ZIP || null,
        country: record.COUNTRY || null,
        carrier: record.CARRIER || null,
        inactive: !!record.INACTIVE,
        home: validatePhone(record.HOME),
        exthome: record.EXTHOME || null,
        work: validatePhone(record.WORK),
        extwork: record.EXTWORK || null,
        fax: validatePhone(record.FAX),
        extfax: record.EXTFAX || null,
        mobile: validatePhone(record.MOBILE),
        extmobile: record.EXTMOBILE || null,
        spouse: record.SPOUSE || null,
        title2: record.TITLE2 || null,
        spouselast: record.SPOUSELAST || null,
        spwork: validatePhone(record.SPWORK),
        extspwork: record.EXTSPWORK || null,
        comments: record.COMMENTS || null,
        py_purch: parseInt(record.PY_PURCH) || 0,
        ytd_purch: parseInt(record.YTD_PURCH) || 0,
        py_00purch: parseInt(record.PY_00PURCH) || 0,
        py_01purch: parseInt(record.PY_01PURCH) || 0,
        py_02purch: parseInt(record.PY_02PURCH) || 0,
        py_03purch: parseInt(record.PY_03PURCH) || 0,
        py_04purch: parseInt(record.PY_04PURCH) || 0,
        cust_type: record.CUST_TYPE || null,
        last_purch: await validateDate(record.LAST_PURCH),
        clerk: record.CLERK || null,
        e1: record.E1 || null,
        d1: record.D1 || null,
        y1: record.Y1 || null,
        e2: record.E2 || null,
        d2: record.D2 || null,
        y2: record.Y2 || null,
        e3: record.E3 || null,
        d3: record.D3 || null,
        y3: record.Y3 || null,
        purchases: parseInt(record.PURCHASES) || 0,
        profit: parseInt(record.PROFIT) || 0,
        notes: record.NOTES || null,
        misc_xml: record.MISC_XML || null,
        wholesale: !!record.WHOLESALE,
        resaleno: record.RESALENO || null,
        salut: record.SALUT || null,
        discount: parseInt(record.DISCOUNT) || 0,
        disc_basis: record.DISC_BASIS || null,
        tax_exempt: !!record.TAX_EXEMPT,
        date_added: await validateDate(record.DATE_ADDED),
        email: record.EMAIL || null,
        emailcode: record.EMAILCODE || null,
        emailspous: record.EMAILSPOUS || null,
        website: record.WEBSITE || null,
        purchvisit: parseInt(record.PURCHVISIT) || 0,
        polled: !!record.POLLED,
        mod_date: await validateDate(record.MOD_DATE),
        mod_second: record.MOD_SECOND
          ? new Date(record.MOD_SECOND)
          : null,
        store_id: record.STORE_ID || null,
        bp_dollars: parseInt(record.BP_DOLLARS) || 0,
        bp_earned: parseInt(record.BP_EARNED) || 0,
        bp_redeem: parseInt(record.BP_REDEEM) || 0,
        bp_1stdate: await validateDate(record.BP_1STDATE),
        balance: parseInt(record.BALANCE) || 0,
        pm: record.PM || null,
        chargeacct: record.CHARGEACCT || null,
        pictures: record.PICTURES || null,
        qbid: record.QBID || null,
        qbseq: record.QBSEQ || null,
        qbadd: !!record.QBADD,
        qbmod: !!record.QBMOD,
        chkfield: record.CHKFIELD || null,
        gender: record.GENDER || null,
        spousegend: record.SPOUSEGEND || null,
        ringsize: record.RINGSIZE || null,
        spousering: record.SPOUSERING || null,
        store_code: name,
      };

      // Use unique filter criteria to prevent overwriting
      bulkOps.push({
        updateOne: {
          filter: {
            customer: mappedRecord.customer,
            store_code: name,
          }, // Unique criteria
          update: { $set: mappedRecord },
          upsert: true,
        },
      });

      // Execute bulk operations in batches
      if (bulkOps.length >= batchSize) {
        await CUSTOMER.bulkWrite(bulkOps, { ordered: true });
        bulkOps.length = 0; // Clear the operations array
      }
    }

    // Execute remaining bulk operations
    if (bulkOps.length > 0) {
      await CUSTOMER.bulkWrite(bulkOps, { ordered: true });
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

// node --max-old-space-size=16384 utils/DatabaseWriter/INV.js
