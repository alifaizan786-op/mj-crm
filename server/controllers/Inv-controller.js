const { INV } = require('../models');

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
};
