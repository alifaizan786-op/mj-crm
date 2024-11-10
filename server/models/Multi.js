const { Schema, model } = require('mongoose');

const multi = new Schema({
  multiCode: {
    type: String,
    unique: true,
    required: true,
  },
  vendorCode: {
    type: String,
    required: true,
  },
  majorCode: {
    type: String,
    required: true,
  },
  colorCode: {
    type: String,
    required: true,
  },
  finishCode: {
    type: String,
    required: true,
  },
  image: [
    {
      type: String,
    },
  ],
});

const Multi = model('Multi', multi, 'Multi');

module.exports = Multi;
