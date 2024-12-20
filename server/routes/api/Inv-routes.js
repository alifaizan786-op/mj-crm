const router = require('express').Router();
const {
  getOneSku,
  openToBuy,
  openToBuyByMajorCode,
  reportBuilder,
  newArrivals,
  newArrivalsByDate,
  newArrivalsByVendor,
  newArrivalsByDayVendor,
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

// /api/inventory/reports/newarrivals/vendor/10/SHT
router
  .route('/reports/newarrivals/vendor/:days/:vendor')
  .get(newArrivalsByDayVendor);

// /api/inventory/reports/newarrivals/vendor/10
router
  .route('/reports/newarrivals/vendor/:days')
  .get(newArrivalsByVendor);

// /api/inventory/reports/newarrivals/date/2024-11-20T05:00:00.000Z
router
  .route('/reports/newarrivals/date/:date')
  .get(newArrivalsByDate);

// /api/inventory/reports/newarrivals/90
router.route('/reports/newarrivals/:days').get(newArrivals);

module.exports = router;
