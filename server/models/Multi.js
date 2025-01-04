const { Schema, model } = require('mongoose');

const multi = new Schema(
  {
    dateCreated: {
      type: Date,
      default: Date.now,
    },
    multiCode: {
      type: String,
      unique: true,
      required: true,
    },
    OldMultiCode: {
      type: String,
      unique: true,
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
    isDeleted: {
      type: Boolean,
      default: false,
    },
    finishCode: {
      type: String,
      required: true,
    },
    totalSku: {
      type: Number,
      default: 0,
      required: true,
    },
    HiddenSku: {
      type: Number,
      default: 0,
      required: true,
    },
    AvailableSku: {
      type: Number,
      default: 0,
      required: true,
    },
    image: [
      {
        type: String,
      },
    ],
  },
  { strict: false }
);

const Multi = model('Multi', multi, 'Multi');

module.exports = Multi;
