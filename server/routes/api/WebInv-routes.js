// webInv-routes.js
const router = require('express').Router();
const {
  updateSkuPriceByRule,
  syncWebInvFromShopify,
  updatePricesByClasscode,
} = require('../../controllers/WebInv-controller');
const { authMiddleware } = require('../../utils/auth');

// Route to update product price
router.post('/update-sku-price', updateSkuPriceByRule);

// /api/webInv/sync
router.post('/sync', syncWebInvFromShopify);

// / api/webInv/update-prices
router.post(
  '/update-prices',
  authMiddleware,
  updatePricesByClasscode
);

module.exports = router;
