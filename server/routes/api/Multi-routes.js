const router = require('express').Router();
const {
  getAllMulti,
  getOneMulti,
  createMulti,
  updateMulti,
  getMultiByQuery,
  deleteMulti,
  bulkMultiCode,
} = require('../../controllers/Multi-controller');

router.route('/bulkMultiCode').post(bulkMultiCode);

router.route('/query').get(getMultiByQuery);

router
  .route('/:multiCode')
  .get(getOneMulti)
  .delete(deleteMulti)
  .put(updateMulti);

router.route('/').get(getAllMulti).post(createMulti);

module.exports = router;
