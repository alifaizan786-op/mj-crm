const router = require('express').Router();
const {
  emptySizing,
  bulkInsertSizing,
  findAllSizing,
  findSizing,
  createSizing,
  pendingUpload,
  pendingUploadSku,
  getSkuByDate,
  updateSizing,
  getSkuByMultiCode,
} = require('../../controllers/Sizing-controller');

// /api/sizing/101-04875
router.route('/updateSku/:SKUCode').put(updateSizing);

// /api/sizing/multiCode/400-00497-BLJ-Y-Y
router.route('/multiCode/:multiCode').get(getSkuByMultiCode);

// /api/sizing/UploadingData
router.route('/UploadingData').post(findSizing);

// /api/sizing/bulkInsert
router.route('/bulkInsert').post(bulkInsertSizing);

// /api/sizing/getSkuByDate
router.route('/getSkuByDate').get(getSkuByDate);

// /api/sizing/pendingUpload
router.route('/pendingUpload').get(pendingUpload);

// /api/sizing/pendingUploadSku
router.route('/pendingUploadSku').get(pendingUploadSku);

// /api/sizing/
router
  .route('/')
  .get(findAllSizing)
  .post(createSizing)
  .delete(emptySizing);

module.exports = router;
