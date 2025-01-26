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
  async newArrivals(req, res) {
    try {
      const { days } = req.params;
      if (!days || isNaN(days)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing "days" parameter.',
        });
      }

      const storeCode = 'WS';
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days, 10));

      const aggregation = [
        {
          $match: {
            store_code: storeCode,
            date: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: '$date', // Group by date
            totalSKUs: { $sum: 1 }, // Count the total SKUs per date
            skus: {
              $push: {
                sku_no: '$sku_no',
                retail: '$retail',
                weight: '$weight',
                ven_code: '$ven_code',
                date: '$date',
                loc_qty1: '$loc_qty1', // Include `loc_qty1` for status calculation
                store_code: '$store_code', // Include store_code for status calculation
              },
            },
          },
        },
        {
          $lookup: {
            from: 'SARECORD',
            localField: 'skus.sku_no',
            foreignField: 'sku_no',
            as: 'sa_records',
          },
        },
        {
          $addFields: {
            skus: {
              $map: {
                input: '$skus',
                as: 'sku',
                in: {
                  sku_no: '$$sku.sku_no',
                  retail: '$$sku.retail',
                  weight: '$$sku.weight',
                  ven_code: '$$sku.ven_code',
                  date: '$$sku.date',
                  status: {
                    $cond: [
                      { $eq: ['$$sku.loc_qty1', 0] },
                      {
                        $cond: [
                          {
                            $gt: [
                              {
                                $size: {
                                  $filter: {
                                    input: '$sa_records',
                                    as: 'record',
                                    cond: {
                                      $eq: [
                                        '$$record.sku_no',
                                        '$$sku.sku_no',
                                      ],
                                    },
                                  },
                                },
                              },
                              0,
                            ],
                          },
                          'sold out',
                          'in-transit',
                        ],
                      },
                      { $concat: ['available-', '$$sku.store_code'] },
                    ],
                  },
                },
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            totalSKUs: 1,
            skus: 1,
          },
        },
      ];

      const result = await INV.aggregate(aggregation);

      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while processing the request.',
        error: error.message,
      });
    }
  },
  async newArrivalsByDate(req, res) {
    try {
      const { date } = req.params;
      if (new Date(date) == 'Invalid Date') {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing "date" parameter.',
        });
      }

      const storeCode = 'WS';
      const startDate = new Date(date);

      const newArrivalDataByDate = await INV.find({
        store_code: storeCode,
        date: startDate,
      }).select(
        'sku_no store_code class_12 date desc desc2 invoice retail ven_code vndr_style weight '
      );

      // Resolve the status for each document using the static method
      const result = await Promise.all(
        newArrivalDataByDate.map(async (skuData) => {
          const status = await INV.getStatus(skuData.sku_no); // Call the static method
          return { ...skuData.toObject(), status }; // Include the status in the response
        })
      );

      // Extract SKU numbers
      const skuNumbers = result.map((item) => item.sku_no);

      // Fetch online status for the SKUs
      const onlineStatuses = await Web.getAllFromArr(
        null,
        null,
        skuNumbers
      );

      // Prepare the response data
      const resultData = result.map((item) => {
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
      console.error(error);
      res.status(500).json({
        error: 'An error occurred while fetching the SKU data.',
      });
    }
  },
  async newArrivalsByVendor(req, res) {
    try {
      const { days } = req.params;
      if (!days || isNaN(days)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing "days" parameter.',
        });
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days, 10));

      const aggregationPipeline = [
        {
          // Match documents from store 'WS' and date within the last specified days
          $match: {
            store_code: 'WS',
            date: { $gte: startDate },
          },
        },
        {
          // Group by ven_code and collect all SKUs
          $group: {
            _id: '$ven_code', // Group by ven_code
            sku_set: { $addToSet: '$sku_no' }, // Unique SKUs
          },
        },
        {
          // Project to get ven_code and the count of SKUs
          $project: {
            _id: 0,
            ven_code: '$_id',
            sku_count: { $size: '$sku_set' },
            // skus: '$sku_set',
          },
        },
      ];

      const result = await INV.aggregate(aggregationPipeline);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: 'An error occurred while fetching the SKU data.',
      });
    }
  },
  async newArrivalsByDayVendor(req, res) {
    try {
      const { days, vendor } = req.params;

      if (!days || isNaN(days) || vendor == '') {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing "days" or vendor parameter.',
        });
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days, 10));

      const newArrivalDataByVendorDay = await INV.find({
        ven_code: vendor,
        date: { $gte: startDate },
        store_code: 'WS',
      }).select(
        'sku_no store_code class_12 date desc desc2 invoice retail ven_code vndr_style weight '
      );

      // Resolve the status for each document using the static method
      const result = await Promise.all(
        newArrivalDataByVendorDay.map(async (skuData) => {
          const status = await INV.getStatus(skuData.sku_no); // Call the static method
          return { ...skuData.toObject(), status }; // Include the status in the response
        })
      );

      // Extract SKU numbers
      const skuNumbers = result.map((item) => item.sku_no);

      // Fetch online status for the SKUs
      const onlineStatuses = await Web.getAllFromArr(
        null,
        null,
        skuNumbers
      );

      // Prepare the response data
      const resultData = result.map((item) => {
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
      console.error(error);
      res.status(500).json({
        error: 'An error occurred while fetching the SKU data.',
      });
    }
  },
  async reportBySku(req, res) {
    try {
      const data = await INV.find({
        sku_no: {
          $in: req.body.sku,
        },
      })
        .select(
          `
        _id
        uuid
        sku_no
        class_12
        class_34
        date
        desc
        desc2
        loc_qty1
        retail
        store_code
        ven_code
        vndr_style
        weight
        `
        )
        .sort({ sku_no: -1 });

      const result = await Promise.all(
        data.map(async (skuData) => {
          const status = await INV.getStatus(skuData.sku_no); // Call the static method
          return { ...skuData.toObject(), status }; // Include the status in the response
        })
      );

      const uniqueObj = req.body.sku
        .map((sku) => {
          let objectForSku = result.filter(
            (item) => item.sku_no == sku && item.loc_qty1 == 1
          );

          return objectForSku.length > 0
            ? objectForSku[0]
            : result.find((item) => item.sku_no == sku) || null;
        })
        .filter(Boolean);

      // Extract SKU numbers
      const skuNumbers = uniqueObj.map((item) => item.sku_no);

      if (skuNumbers.length > 0) {
        // Fetch online status for the SKUs
        const onlineStatuses = await Web.getAllFromArr(
          null,
          null,
          skuNumbers
        );
        // Prepare the response data
        const resultData = uniqueObj.map((item) => {
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
        res.json(resultData);
      } else {
        res.json(uniqueObj);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: 'An error occurred while fetching the SKU data.',
      });
    }
  },
  async uploadingData(req, res) {
    try {
      // Fetch data from the database based on SKU array
      const data = await INV.find({
        sku_no: {
          $in: req.body.sku,
        },
      })
        .select(
          `
                _id
                uuid
                sku_no
                class_12
                class_34
                date
                desc
                desc2
                loc_qty1
                retail
                store_code
                ven_code
                vndr_style
                weight
                `
        )
        .sort({ sku_no: -1 });

      // Append status to each SKU object
      const result = await Promise.all(
        data.map(async (skuData) => {
          const status = await INV.getStatus(skuData.sku_no); // Call the static method
          return { ...skuData.toObject(), status }; // Include the status in the response
        })
      );

      // Map SKUs to unique objects
      const uniqueObj = req.body.sku
        .map((sku) => {
          const filteredBySku = result.filter(
            (item) => item.sku_no === sku
          );

          const exactMatch = filteredBySku.find(
            (item) => item.loc_qty1 === 1
          );
          return exactMatch || filteredBySku[0] || null;
        })
        .filter(Boolean); // Remove null values

      // Return the response based on context (API or internal call)
      res.json({
        soldOut: uniqueObj.filter(
          (item) => item.status == 'sold out'
        ),
        inStock: uniqueObj.filter(
          (item) => item.status !== 'sold out'
        ),
      });
    } catch (error) {
      console.error(error);

      if (res) {
        res.status(500).json({
          error: 'An error occurred while fetching the SKU data.',
          details: error.message,
        });
      } else {
        throw error;
      }
    }
  },
  async outOfStockItemsOnline(req, res) {
    try {
      // Fetch website live data with specific conditions
      const websiteLiveData = await Web.getLiveSku();

      const websiteLiveSkuCodes = websiteLiveData.map(
        (item) => item.SKUCode
      );


      // Query inventory with SKU codes and exclude items where loc_qty1 is 1
      const vjsDataBySku = await INV.find({
        sku_no: { $in: websiteLiveSkuCodes },
      })
        .select(`sku_no loc_qty1`)
        .lean();

      const vjsDataUniqueObj = websiteLiveSkuCodes
        .map((sku) => {
          const filteredBySku = vjsDataBySku.filter(
            (item) => item.sku_no === sku
          );

          const exactMatch = filteredBySku.find(
            (item) => item.loc_qty1 === 1
          );
          return exactMatch || filteredBySku[0] || null;
        })
        .filter(Boolean); // Remove null values

      const getStatus = await Promise.all(
        vjsDataUniqueObj
          .filter((item) => item.loc_qty1 !== 1)
          .map(async (item) => {
            const status = await INV.getStatus(item.sku_no);
            return item.toObject
              ? { ...item.toObject(), status }
              : { ...item, status };
          })
      );

      const availableSkus = new Set([
        ...getStatus
          .filter((item) => item.status !== 'sold out')
          .map((item) => item.sku_no),
        ...vjsDataUniqueObj
          .filter((item) => item.loc_qty1 == 1)
          .map((item) => item.sku_no),
      ]);

      const result = websiteLiveSkuCodes.filter(
        (sku) => !availableSkus.has(sku)
      );

      res.json(result);
    } catch (error) {
      console.error('Error in outOfStockItemsOnline:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
