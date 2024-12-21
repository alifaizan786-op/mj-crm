const {
  downloadImage,
  formatSkuToImage,
} = require('../utils/ImageHandler');
const sharp = require('sharp');
const fetch = require('node-fetch');

const path = require('path');

module.exports = {
  async getAndRenameImage(req, res) {
    try {
      let imageUrl = `https://www.malanijewelers.com/TransactionImages/Styles/Large/${req.params.curImageName}`;
      let imageName = req.params.newImageName;

      console.log(imageUrl, imageName);

      await downloadImage(imageUrl, imageName);

      res.send(req.params.newImageName);
    } catch (error) {
      console.error(error); // Log the error for debugging purposes
      res.status(500).send('Unsuccessful');
    }
  },
  sendRenameImage(req, res) {
    res.setHeader(
      'Content-disposition',
      `attachment; filename=${req.params.imageName}`
    );
    res.setHeader('Content-Type', 'image/jpg');
    res.download(
      path.join(__dirname, `../images/${req.params.imageName}`)
    );
  },
  async resizeImage(req, res) {
    const { sku, type, size, imageName } = req.query;

    try {
      let imageUrl;

      // Determine the image URL based on the query parameters
      if (imageName) {
        // Use the provided imageName directly
        if (type.toLowerCase() === 'js') {
          imageUrl = `https://mjplusweb.com/Images/JS/${imageName}`;
        } else if (type.toLowerCase() === 'web') {
          imageUrl = `https://www.malanijewelers.com/TransactionImages/Styles/${size}/${imageName}`;
        }
      } else {
        // Use the formatted SKU if imageName is not provided
        if (type.toLowerCase() === 'js') {
          imageUrl = `https://mjplusweb.com/Images/JS/${formatSkuToImage(
            sku
          )}.jpg`;
        } else if (type.toLowerCase() === 'web') {
          imageUrl = `https://www.malanijewelers.com/TransactionImages/Styles/${size}/${formatSkuToImage(
            sku
          )}.jpg`;
        }
      }

      // Fetch the image
      const response = await fetch(imageUrl);
      const buffer = await response.buffer();

      // Set width based on the size parameter
      const width =
        size === 'small' ? 300 : size === 'medium' ? 500 : 1200;

      // Resize the image and convert it to WebP format
      const resizedImage = await sharp(buffer)
        .resize({
          width,
          fit: 'contain', // Ensures the image fits within the specified dimensions
        })
        .toFormat('webp') // Convert the image to WebP format
        .toBuffer();

      // Send the resized WebP image
      res.set('Content-Type', 'image/webp'); // Set the content type for WebP
      res.send(resizedImage);
    } catch (error) {
      // If an error occurs, send the default image instead
      const defaultImageResponse = await fetch(
        'https://www.malanijewelers.com/Images/ImageNotAvailable.jpg'
      );
      const defaultImageBuffer = await defaultImageResponse.buffer();
      res.set('Content-Type', 'image/jpeg'); // Default image remains JPEG
      res.send(defaultImageBuffer);
    }
  },
};
