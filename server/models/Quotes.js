const { Schema, model } = require('mongoose');

const quotesSchema = new Schema(
  {
    body: {
      type: String,
      required: true,
      unique: true,
    },
    author: {
      type: String,
      required: true,
      index: true,
    },
    tags: {
      type: [String],
      index: true,
    },
    seen: {
      type: Boolean,
      default: false,
    },
    liked: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Quotes = model('Quotes', quotesSchema, 'Quotes');

module.exports = Quotes;
