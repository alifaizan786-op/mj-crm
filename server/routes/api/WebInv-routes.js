// webInv-routes.js
const router = require('express').Router();
const {
  updateSkuPriceByRule,
  syncWebInvFromShopify,
  updatePricesByClasscode,

  PricingWebhook,
  refreshNewArrivals,
} = require('../../controllers/WebInv-controller');
const { authMiddleware } = require('../../utils/auth');

// /api/webInv/PricingWebhook
router.post('/PricingWebhook', PricingWebhook);

// /api/webInv/refreshNewArrivals
router.post('/refreshNewArrivals', refreshNewArrivals);


// /api/webInv/update-sku-price
router.post(
  '/update-sku-price',
  authMiddleware,
  updateSkuPriceByRule
);

// /api/webInv/sync
router.post('/sync', authMiddleware, syncWebInvFromShopify);

// /api/webInv/update-prices
router.post(
  '/update-prices',
  authMiddleware,
  updatePricesByClasscode
);


module.exports = router;
