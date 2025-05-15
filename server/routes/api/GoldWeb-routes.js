const router = require('express').Router();
const {
  getGoldWeb,
  createGoldWeb,
} = require('../../controllers/GoldWeb-controller');

// /api/goldweb
router
  .route('/')
  .get(getGoldWeb)
  .post(createGoldWeb);

module.exports = router;
