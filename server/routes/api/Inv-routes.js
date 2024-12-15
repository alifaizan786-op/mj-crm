const router = require('express').Router();
const {
  getOneSku,
  openToBuy,
  openToBuyByMajorCode,
  reportBuilder,
} = require('../../controllers/Inv-controller');

// /api/inventory/sku/47-04971
router.route('/sku/:sku').get(getOneSku);

// /api/reports/inventory/opentobuy/ATL/1
router
  .route('/reports/opentobuy/:store/:majorCode')
  .get(openToBuyByMajorCode);

// /api/inventory/opentobuy/ATL
router.route('/reports/opentobuy/:store').get(openToBuy);

// /api/inventory/reports/reportBuilder
router.route('/reports/reportBuilder/').post(reportBuilder);

module.exports = router;
