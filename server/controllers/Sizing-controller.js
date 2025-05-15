const { Sizing, INV } = require('../models');
const fetch = require('node-fetch');
const Web = require('./Web-controller');

module.exports = {
  // empty collection
  async emptySizing(req, res) {
    try {
      const data = await Sizing.remove({});
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  },

  // Update sizing
  async updateSizing(req, res) {
    try {
      // Ensure req.body is not empty to avoid invalid updates
      if (!req.body || Object.keys(req.body).length === 0) {
        return res
          .status(400)
          .json({ message: 'Invalid request body' });
      }

      // Find, update, or insert the sizing document
      const data = await Sizing.findOneAndUpdate(
        { SKUCode: req.params.SKUCode },
        req.body,
        {
          new: true, // Return the updated document
          upsert: true, // Create a new document if no match is found
          runValidators: true, // Validate schema on update
        }
      );

      // Return the updated or newly created document
      res.json(data);
    } catch (err) {
      console.error('Error updating sizing:', err);
      res
        .status(500)
        .json({ message: 'An error occurred', error: err.message });
    }
  },

  // bulk insert
  async bulkInsertSizing(req, res) {
    try {
      const tempArr = [];

      console.log(req.body.length);

      for (let i = 0; i < req.body.length; i++) {
        const dateValue = new Date(req.body[i].Date);

        if (!isNaN(dateValue.getTime())) {
          // Date is valid
          const tempObj = {
            ...req.body[i],
            Date: dateValue.toISOString(),
          };
          tempArr.push(tempObj);
        } else {
          // Invalid date, handle accordingly
          console.error(
            `Invalid date at index ${i}: ${req.body[i].Date}`
          );
        }
      }

      console.log(tempArr.length);

      const data = await Sizing.insertMany(tempArr);
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  },

  // find all
  async findAllSizing(req, res) {
    try {
      const data = await Sizing.find({}).select('-__v -_id');
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  },

  // find all from an array of SKUCode
  async findSizing(req, res) {
    try {
      const query = req.body.map((sku) => ({ SKUCode: sku }));
      console.log('Query:', query);

      const data =
        query.length > 1
          ? await Sizing.find({ $or: query }).select('-__v -_id')
          : await Sizing.find(query[0]).select('-__v -_id');

      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  },

  // create single
  async createSizing(req, res) {
    try {
      const data = await Sizing.create(req.body);
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  },

  // get sku by date
  async getSkuByDate(req, res) {
    try {
      const date = new Date(req.query.date);
      const data = await Sizing.find({ Date: date }).select(
        'SKUCode'
      );
      const skuCode = data.map((item) => item.SKUCode);
      res.json(skuCode);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  },

  // find all pending upload
  async pendingUpload(req, res) {
    try {
      const oneYearAgo = new Date();
      oneYearAgo.setMonth(oneYearAgo.getMonth() - 12);

      // Fetch relevant Sizing data
      const sizingData = await Sizing.find({
        Date: { $gte: oneYearAgo },
      }).select('Date SKUCode');

      // Define the fixed date range for 2024
      // const startDate = new Date('2018-01-01T00:00:00Z');
      // const endDate = new Date('2018-12-31T23:59:59Z');

      // // Fetch relevant Sizing data for 2024
      // const sizingData = await Sizing.find({
      //   Date: { $gte: startDate, $lte: endDate },
      // }).select('Date SKUCode');

      const allSkuCodes = sizingData.map(({ SKUCode }) => SKUCode);

      // Fetch uploaded data in bulk to reduce individual lookups
      const uploadedData = new Set(
        (await Web.getAllFromArr(null, null, allSkuCodes)).map(
          ({ SKUCode }) => SKUCode
        )
      );

      // Filter out uploaded SKUs in-memory for performance
      const notUploadedData = sizingData.filter(
        ({ SKUCode }) => !uploadedData.has(SKUCode)
      );

      // Extract SKUs that are in-stock
      const notUploadedSkus = notUploadedData.map(
        ({ SKUCode }) => SKUCode
      );
      const inStockData = await INV.find({
        sku_no: { $in: notUploadedSkus },
        loc_qty1: { $gt: 0 },
      });

      // Map dates to their SKUs
      const dateSkuMap = notUploadedData.reduce(
        (acc, { Date, SKUCode }) => {
          if (inStockData.some(({ sku_no }) => sku_no === SKUCode)) {
            const formattedDate = dateFormatter(Date);
            if (!acc[formattedDate]) {
              acc[formattedDate] = {
                Date: formattedDate,
                SKUCodes: [],
              };
            }
            acc[formattedDate].SKUCodes.push(SKUCode);
          }
          return acc;
        },
        {}
      );

      // Sort the unique dates
      const uniqueDates = Object.values(dateSkuMap).sort(
        (a, b) => new Date(a.Date) - new Date(b.Date)
      );

      res.json(uniqueDates);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // find all pending upload SKU
  async pendingUploadSku(req, res) {
    try {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      // Fetch relevant Sizing data
      const sizingData = await Sizing.find({
        Date: { $gte: threeMonthsAgo },
      }).select('SKUCode');

      const allSkuCodes = sizingData.map(({ SKUCode }) => SKUCode);

      // Fetch uploaded data in bulk to reduce individual lookups
      const uploadedData = new Set(
        (await Web.getAllFromArr(null, null, allSkuCodes)).map(
          ({ SKUCode }) => SKUCode
        )
      );

      // Filter out uploaded SKUs in-memory
      const notUploadedSkus = allSkuCodes.filter(
        (SKUCode) => !uploadedData.has(SKUCode)
      );

      // Fetch in-stock data for not uploaded SKUs
      const inStockData = await INV.find({
        sku_no: { $in: notUploadedSkus },
        loc_qty1: { $gt: 0 },
      });

      // Extract and return SKU numbers
      res.json(inStockData.map(({ sku_no }) => sku_no));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // find entries by MultiCode
  async getSkuByMultiCode(req, res) {
    try {
      const data = await Sizing.find({
        StyleMultiCode: req.params.multiCode,
      });
      res.json(data);
    } catch (error) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // Get Video Data
  async getVideosData(req, res) {
    try {
      const data = await Sizing.find({ video: { $exists: true } })
        .select('Date SKUCode video Classcode')
        .sort({ Date: -1 });

      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  },

  // Remove exact duplicate documents
  async removeDuplicates(req, res) {
    try {
      // Find all exact duplicates based on the entire document
      const uniqueDocs = await Sizing.aggregate([
        {
          $group: {
            _id: {
              Date: '$Date',
              Initial: '$Initial',
              SKUCode: '$SKUCode',
              Note: '$Note',
              GoldKT: '$GoldKT',
              Color: '$Color',
              'Jewelry For': '$Jewelry For',
              'Jewelry Type': '$Jewelry Type',
              Finishing: '$Finishing',
              'Number of Pcs': '$Number of Pcs',
              Length: '$Length',
              Width: '$Width',
              'Chain included in the price':
                '$Chain included in the price',
              'Chain Length': '$Chain Length',
              'Pendant Length': '$Pendant Length',
              'Pendant Width': '$Pendant Width',
              'Earrings Length': '$Earrings Length',
              'Earrings Width': '$Earrings Width',
              'Earring Post Type': '$Earring Post Type',
              'Ring Size': '$Ring Size',
              'Ring Design Height': '$Ring Design Height',
              'Ring Width': '$Ring Width',
              'Ring Type': '$Ring Type',
              'Bangle Size': '$Bangle Size',
              'Bangle/Bracelet Size Adjustable up-to':
                '$Bangle/Bracelet Size Adjustable up-to',
              'Bangle Inner Diameter': '$Bangle Inner Diameter',
              'Bangle Width': '$Bangle Width',
              'Bangle Design Height': '$Bangle Design Height',
              'Bangle/Bracelet Type': '$Bangle/Bracelet Type',
              'Diamond Type': '$Diamond Type',
              'Diamond Total Weight': '$Diamond Total Weight',
              'Diamond Total Pcs': '$Diamond Total Pcs',
              'Diamond Clarity': '$Diamond Clarity',
              'Diamond Color': '$Diamond Color',
              'Center Diamond Weight': '$Center Diamond Weight',
              IsGIACertified: '$IsGIACertified',
              'Certificate#': '$Certificate#',
              Certification: '$Certification',
              'Nose Pin Type': '$Nose Pin Type',
              'Changeable Stones Included':
                '$Changeable Stones Included',
              'Gemstones Weight': '$Gemstones Weight',
              'Chain Length(#28-40 and 360-365)':
                '$Chain Length(#28-40 and 360-365)',
              StyleMultiCode: '$StyleMultiCode',
              Disclaimer: '$Disclaimer',
            },
            docs: { $push: '$_id' },
            count: { $sum: 1 },
          },
        },
        {
          $match: { count: { $gt: 1 } },
        },
      ]);

      // Loop through each group of duplicates and remove the extra documents
      for (const group of uniqueDocs) {
        group.docs.slice(1).forEach(async (docId) => {
          // Delete all but the first document (preserving one document in each group)
          await Sizing.deleteOne({ _id: docId });
        });
      }

      res.json({ message: 'Exact duplicates removed successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: 'Error removing duplicates',
        details: err.message,
      });
    }
  },
};

function dateFormatter(date) {
  const inputDate = new Date(date);
  const month = String(inputDate.getMonth() + 1).padStart(2, '0');
  const day = String(inputDate.getDate()).padStart(2, '0');
  const year = inputDate.getFullYear();

  return `${month}/${day}/${year}`;
}
