// webInv-routes.js
const router = require('express').Router();
const {
  updateSkuPriceByRule,
} = require('../../controllers/WebInv-controller');

// Route to update product price
router.post('/update-sku-price', updateSkuPriceByRule);
module.exports = router;
