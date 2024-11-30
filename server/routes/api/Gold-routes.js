const router = require('express').Router();

const {
  getGoldPriceHandler,
} = require('../../controllers/Gold-controller');

router.route('/').get(getGoldPriceHandler);

module.exports = router;
