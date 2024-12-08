const router = require('express').Router();
const Web = require('../../controllers/Web-controller');

// /api/website/sku/47-04971
router.route('/sku/:sku').get(Web.getOneSku);

// /api/website/report/opentobuy
router.route('/reports/opentobuy').get(Web.openToBuy);

module.exports = router;
