// webInv-routes.js
const router = require('express').Router();
const {
  updateSkuPriceByRule,
  syncWebInvFromShopify,
  updatePricesByClasscode,
  getSkuListing,
  getSkuDetails,
  updateSkuDetails,
  PricingWebhook,
  refreshNewArrivals,
  priceRefresh,
} = require('../../controllers/WebInv-controller');
const { authMiddleware } = require('../../utils/auth');

// /api/webInv/PricingWebhook
router.post('/PricingWebhook', PricingWebhook);

// /api/webInv/price-refresh
router.post('/price-refresh', priceRefresh);

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

// /api/webInv/
router.get('/', authMiddleware, getSkuListing);

// ✅ Dynamic route comes LAST
// /api/webInv/:sku
router
  .route('/:sku')
  .get(authMiddleware, getSkuDetails)
  .put(authMiddleware, updateSkuDetails);

module.exports = router;
