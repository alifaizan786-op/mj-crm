const router = require('express').Router();
const {
  getAndRenameImage,
  sendRenameImage,
  resizeImage,
  convertImage,
} = require('../../controllers/Image-controller');

// Resize an image based on query parameters (e.g., /api/image?sku=123&type=web&size=medium)
router.route('/').get(resizeImage);

// Rename and download image (e.g., /api/image/oldImage.jpg/to/newImage.jpg)
router
  .route('/:curImageName/to/:newImageName')
  .get(getAndRenameImage);

// Download renamed image (e.g., /api/image/newImage.jpg)
router.route('/:imageName').get(sendRenameImage);

// Convert image format (e.g., POST /api/image/convert with JSON body)
router.route('/convert').post(convertImage);

module.exports = router;
