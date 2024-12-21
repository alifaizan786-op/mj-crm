const { Schema, model } = require('mongoose');

const attributesSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  isDeleted: {
    type: Boolean,
  },
  options: [
    {
      type: Object,
    },
  ],
});

const Attributes = model(
  'Attributes',
  attributesSchema,
  'Attributes'
);

module.exports = Attributes;
