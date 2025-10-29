const router = require('express').Router();
const {
  getPricingPolicy,
  createPricingPolicy,
  getByClassCode,
  updateById,
  deleteById,
  getLogs,
  getLogFile,
} = require('../../controllers/PricingPolicy-controller');

// /api/pricingpolicy/logs
router.route('/logs').get(getLogs);

// /api/pricingpolicy
router.route('/').get(getPricingPolicy).post(createPricingPolicy);

// /api/pricingpolicy/classcode/:classcode
router.route('/classcode/:classcode').get(getByClassCode);

// /api/pricingpolicy/logs/:fileName
router.route('/logs/:fileName').get(getLogFile);

// /api/pricingpolicy/:id
router
  .route('/:id')
  .put(updateById)
  .patch(updateById)
  .delete(deleteById);

module.exports = router;
