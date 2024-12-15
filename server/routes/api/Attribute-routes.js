const express = require('express');
const {
  getAllAttributes,
  getAttributeByTitle,
  createAttribute,
  updateAttribute,
  deleteAttribute,
} = require('../../controllers/Attribute-controller'); // Updated file name for convention

const router = express.Router();

router.route('/').get(getAllAttributes).post(createAttribute);

router.route('/title/:title').get(getAttributeByTitle);

router.route('/:id').put(updateAttribute).delete(deleteAttribute);

module.exports = router;
