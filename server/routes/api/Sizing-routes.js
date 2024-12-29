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
} = require('../../controllers/Sizing-controller');

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
