const { Schema, model } = require('mongoose');

const goldPriceSchema = new Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  prices: {
    type: Object,
    required: true,
  },
});

const Gold = model('Gold', goldPriceSchema, 'Gold');

module.exports = Gold;
