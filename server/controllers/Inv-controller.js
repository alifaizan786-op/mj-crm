const { INV } = require('../models');
const Web = require('./Web-controller');

module.exports = {
  async getOneSku(req, res) {
    try {
      // Fetch multiple documents matching the `sku_no`
      const skuDataArray = await INV.find({
        sku_no: req.params.sku,
      });

      // Resolve the status for each document using the static method
      const result = await Promise.all(
        skuDataArray.map(async (skuData) => {
          const status = await INV.getStatus(skuData.sku_no); // Call the static method
          return { ...skuData.toObject(), status }; // Include the status in the response
        })
      );

      // Send the resolved data
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: 'An error occurred while fetching the SKU data.',
      });
    }
  },
  async openToBuy(req, res) {
    try {
      const { store } = req.params;

      const result = await INV.aggregate([
        {
          $match: {
            loc_qty1: 1,
            store_code: store,
          },
        },
        {
          $group: {
            _id: {
              store: '$store_code',
              majorCode: '$class_12',
            },
            totalQty: {
              $sum: '$loc_qty1',
            },
          },
        },
        {
          $group: {
            _id: '$_id.store',
            totalQty: {
              $sum: '$totalQty',
            },
            totalRetail: {
              $sum: '$totalRetail',
            },
            majorCodes: {
              $push: {
                majorCode: '$_id.majorCode',
                totalQty: '$totalQty',
              },
            },
          },
        },
        {
          $addFields: {
            allMajorCodes: {
              $map: {
                input: { $range: [1, 701] }, // Generates numbers from 1 to 700
                as: 'code',
                in: {
                  majorCode: '$$code',
                  totalQty: {
                    $ifNull: [
                      {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: '$majorCodes',
                              as: 'major',
                              cond: {
                                $eq: ['$$major.majorCode', '$$code'],
                              },
                            },
                          },
                          0,
                        ],
                      },
                      { totalQty: 0 },
                    ],
                  },
                },
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            store: '$_id',
            totalQty: 1,
            totalRetail: 1,
            majorCodes: '$allMajorCodes',
          },
        },
      ]);

      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  async openToBuyByMajorCode(req, res) {
    try {
      const { store, majorCode } = req.params;

      // Fetch data from the inventory
      const classCodeData = await INV.find({
        loc_qty1: 1,
        class_12: majorCode,
        store_code: store,
      }).lean();

      if (!classCodeData.length) {
        return res.json({ data: "No Sku's found" });
      }

      // Extract SKU numbers
      const skuNumbers = classCodeData.map((item) => item.sku_no);

      // Fetch online status for the SKUs
      const onlineStatuses = await Web.getAllFromArr(
        null,
        null,
        skuNumbers
      );

      // Prepare the response data
      const allClassCodeData = classCodeData.map((item) => {
        const onlineStatus = onlineStatuses.find(
          (obj) => obj.SKUCode === item.sku_no
        );
        return {
          ...item,
          isOnline: onlineStatus || 'SKU Is Not Online',
        };
      });

      return res.json(allClassCodeData);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  },
  async reportBuilder(req, res) {
    try {
      const filter = req.body;

      const query = {};

      // Apply filters
      if (filter.class_12 && filter.class_12.length > 0) {
        query.class_12 = {
          $in: filter.class_12.map((item) => parseInt(item)),
        };
      }
      if (filter.ven_code && filter.ven_code.length > 0) {
        query.ven_code = { $in: filter.ven_code };
      }
      if (filter.store_code && filter.store_code.length > 0) {
        query.store_code = { $in: filter.store_code };
      }
      if (filter.loc_qty1 && filter.loc_qty1.length > 0) {
        query.loc_qty1 = { $in: filter.loc_qty1 };
      }
      if (filter.WEIGHT) {
        query.WEIGHT = {
          $gte: filter.WEIGHT.min,
          $lte: filter.WEIGHT.max,
        };
      }
      if (filter.RETAIL) {
        query.RETAIL = {
          $gte: filter.RETAIL.min,
          $lte: filter.RETAIL.max,
        };
      }
      if (filter.date && filter.date.length > 0) {
        const startOfYear = filter.date.map(
          (year) => new Date(`${year}-01-01T00:00:00.000Z`)
        );
        const endOfYear = filter.date.map(
          (year) => new Date(`${year}-12-31T23:59:59.999Z`)
        );
        query.date = {
          $gte: startOfYear[0],
          $lte: endOfYear[endOfYear.length - 1],
        };
      }

      // Apply sorting
      let sortOption = {};
      if (filter.sort) {
        switch (filter.sort) {
          case 'Price: High To Low':
            sortOption = { retail: -1 };
            break;
          case 'Price: Low To High':
            sortOption = { retail: 1 };
            break;
          case 'Entry Date: New To Old':
            sortOption = { date: -1 };
            break;
          case 'Entry Date: Old To New':
            sortOption = { date: 1 };
            break;
          case 'Classcode: Low To High':
            sortOption = { class_12: 1 };
            break;
          case 'Classcode: High To Low':
            sortOption = { class_12: -1 };
            break;
          case 'Weight: High To Low':
            sortOption = { WEIGHT: -1 };
            break;
          case 'Weight: Low To High':
            sortOption = { WEIGHT: 1 };
            break;
          default:
            // Default sorting
            sortOption = { DATE: 1 };
            break;
        }
      }

      const results = await INV.find(query)
        .select(
          ' sku_no class_12 ven_code desc retail weight date store_code -_id'
        )
        .sort(sortOption)
        .allowDiskUse(true)
        .lean();

      // Extract SKU numbers
      const skuNumbers = results.map((item) => item.sku_no);

      // Fetch online status for the SKUs
      const onlineStatuses = await Web.getAllFromArr(
        null,
        null,
        skuNumbers
      );

      // Prepare the response data
      const resultData = results.map((item) => {
        const onlineStatus = onlineStatuses.find(
          (obj) => obj.SKUCode === item.sku_no
        );

        return {
          ...item,
          onlinePurchasable: onlineStatus?.Purchasable ?? null,
          onlineHidden: onlineStatus?.Hidden ?? null,
          onlineStockQty: onlineStatus?.StockQty ?? null,
        };
      });

      res.status(200).json(resultData);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};
