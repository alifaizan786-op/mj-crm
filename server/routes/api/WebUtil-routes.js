const router = require('express').Router();
const {
  createSitemap,
} = require('../../controllers/WebUtil-controller');

// /api/webUtil/sitemap
router.route('/sitemap').post(createSitemap);

module.exports = router;
