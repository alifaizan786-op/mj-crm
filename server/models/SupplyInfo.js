const { Schema, model } = require('mongoose');

const SupplyInfoSchema = new Schema({
  vendor: {
    type: String,
    required: true,
  },
  usage: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Int32,
    required: true,
  },
  width: {
    type: Number,
  },
  length: {
    type: Number,
  },
  width: {
    type: Number,
  },
});

const SupplyInfo = model(
  'SupplyInfo',
  SupplyInfoSchema,
  'SupplyInfo'
);

module.exports = SupplyInfo;
