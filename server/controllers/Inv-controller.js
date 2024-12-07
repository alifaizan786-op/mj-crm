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
      res
        .status(500)
        .json({
          error: 'An error occurred while fetching the SKU data.',
        });
    }
  },
};
