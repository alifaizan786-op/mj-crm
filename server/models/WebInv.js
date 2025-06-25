const { Schema, model } = require('mongoose');

const WebInvSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true, index: true },
    variantId: { type: String, required: true },
    productId: { type: String, required: true },
    title: String,
    vendor: String,
    classcode: Number,
    grossWeight: Number,
    entryDate: Date,
    tag_price: Number,
    autoUpdatePrice: Boolean,
    gold_karat: String,
    currentPrice: Number, // Add this field
  },
  { timestamps: true }
);

const WebInv = model('WebInv', WebInvSchema, 'WebInv');

module.exports = WebInv;
