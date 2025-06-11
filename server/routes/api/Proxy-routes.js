const router = require('express').Router();
const {
  getGoldPrice,
  addToWishList,
  removeFromWishlist,
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

// Route with domain verification middleware
router.route('/goldPrice').get(
  // verifyDomain,
  getGoldPrice
);

router.route('/wishlist/add').post(
  // verifyDomain,
  addToWishList
);
router.route('/wishlist/remove').post(
  // verifyDomain,
  removeFromWishlist
);

module.exports = router;
