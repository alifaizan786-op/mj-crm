const router = require('express').Router();
const Web = require('../../controllers/Web-controller');

// Define specific routes first to prevent conflicts with general routes

// /api/website/utils/description/
router.route('/utils/description/').post(Web.descriptionGenerator);

// /api/website/client/
router.route('/client/').post(Web.clientSearch);

// /api/website/sku/47-04971
router.route('/sku/:sku').get(Web.getOneSku);

// /api/website/reports/multiCode/62-00877-AU-Y-TT
router.route('/reports/multiCode/:MultiCode').get(Web.getSkuByMultiCode);

// /api/website/reports/getSkuBySearchDate/10Jan25
router.route('/reports/getSkuBySearchDate/:uploadDate').get(Web.getSkuBySearchDate);

// /api/website/reports/hiddenButInstock
router.route('/reports/hiddenButInstock').get(Web.hiddenButInstock);

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
