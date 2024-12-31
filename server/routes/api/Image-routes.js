const router = require('express').Router();
const {
  getAndRenameImage,
  sendRenameImage,
  resizeImage,
} = require('../../controllers/Image-controller');

// /api/image
router.route('/').get(resizeImage);

// /api/image
router
  .route('/:curImageName/to/:newImageName')
  .get(getAndRenameImage);

router.route('/:imageName').get(sendRenameImage);

module.exports = router;
