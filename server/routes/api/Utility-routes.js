const router = require('express').Router();
const {
  getFavicon,
} = require('../../controllers/Utility-controller');

// /api/utility/getFavicon
router.route('/getFavicon').get(getFavicon);

module.exports = router;
