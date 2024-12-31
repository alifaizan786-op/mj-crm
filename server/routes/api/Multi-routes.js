const router = require('express').Router();
const {
  getAllMulti,
  getOneMulti,
  createMulti,
  updateMulti,
  getMultiByQuery,
  deleteMulti,
  bulkMultiCode,
  nextMultiCode,
} = require('../../controllers/Multi-controller');

// /api/multi/bulkMultiCode
router.route('/bulkMultiCode').post(bulkMultiCode);

// /api/multi/nextMulti
router.route('/nextMulti').get(nextMultiCode);

// /api/multi/query?vendorCode=EMR&majorCode=5&colorCode=Yellow
router.route('/query').get(getMultiByQuery);

// /api/multi/
router
  .route('/:multiCode')
  .get(getOneMulti)
  .delete(deleteMulti)
  .put(updateMulti);

router.route('/').get(getAllMulti).post(createMulti);

module.exports = router;
