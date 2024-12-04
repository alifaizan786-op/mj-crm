const router = require('express').Router();
const { getOneSku } = require('../../controllers/Inv-controller');

// /api/inventory/sku/47-04971
router.route('/sku/:sku').get(getOneSku);

module.exports = router;
