const router = require('express').Router();
const {
  getOneSku,
  openToBuy,
} = require('../../controllers/Inv-controller');

// /api/inventory/sku/47-04971
router.route('/sku/:sku').get(getOneSku);

// /api/inventory/opentobuy/ATL
router.route('/opentobuy/:store').get(openToBuy);

module.exports = router;
