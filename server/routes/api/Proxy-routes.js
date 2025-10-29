const router = require('express').Router();
const {
  getGoldPrice,
  addToWishList,
  removeFromWishlist,
  proxyUpdateViewCount,
  getClientCoupons,
  goldPriceApi,
} = require('../../controllers/Proxy-controller');

// Inline middleware to verify allowed domains
const verifyDomain = (req, res, next) => {
  const allowedDomains = [
    'https://malanijewelers.myshopify.com',
    'https://malanijeweler.com',
    'https://www.malanijeweler.com',
    'https://malanijewelers.com',
    'https://www.malanijewelers.com',
  ];

  const origin = req.get('origin') || req.get('referer') || '';

  const isAllowed = allowedDomains.some((domain) =>
    origin.startsWith(domain)
  );

  if (!isAllowed) {
    return res
      .status(403)
      .json({ error: 'Forbidden: Unauthorized domain' });
  }

  next();
};

router.route('/gold-price-api').post(verifyDomain, goldPriceApi);

router.route('/goldPrice').get(
  // verifyDomain,
  getGoldPrice
);

// /api/proxy/wishlist/add
// {
//     "customerId":"gid://shopify/Customer/9058296299803",
//     "productId":"gid://shopify/Product/9891531227419"
// }
router.route('/wishlist/add').post(
  // verifyDomain,
  addToWishList
);

// /api/proxy/wishlist/remove
// {
//     "customerId":"gid://shopify/Customer/9058296299803",
//     "productId":"gid://shopify/Product/9891531227419"
// }
router.route('/wishlist/remove').post(
  // verifyDomain,
  removeFromWishlist
);

// /api/proxy/product/view_count/9891560292635
router.route('/product/view_count/:productId').post(
  // verifyDomain,
  proxyUpdateViewCount
);

// /api/proxy/client/coupons
router.route('/client/coupons').get(getClientCoupons);

module.exports = router;
