const router = require('express').Router();
const Web = require('../../controllers/Web-controller');

// Define specific routes first to prevent conflicts with general routes

// /api/website/utils/description/432-01906
router.route('/utils/description/:sku').get(Web.descriptionGenerator);

// /api/website/sku/47-04971
router.route('/sku/:sku').get(Web.getOneSku);

// /api/website/reports/getSkuBySearchDate/10Jan25
router
  .route('/reports/getSkuBySearchDate/:uploadDate')
  .get(Web.getSkuBySearchDate);

// /api/website/reports/outOfStockOnline
router.route('/reports/outOfStockOnline').get(Web.outOfStockOnline);

// /api/website/reports/reportBuilder
router.route('/reports/reportBuilder').post(Web.reportBuilder);

// /api/website/reports/uploadingReport
router.route('/reports/uploadingReport').get(Web.uploadingReport);

// /api/website/reports/opentobuy/1
router.route('/reports/opentobuy/:majorCode').get(Web.getMajorCode);

// /api/website/reports/opentobuy
router.route('/reports/opentobuy').get(Web.openToBuy);

// /api/website/search
router.route('/search').post(Web.getAllFromArr);

module.exports = router;
