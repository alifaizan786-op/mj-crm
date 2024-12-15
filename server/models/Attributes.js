const { Schema, model } = require('mongoose');

const attributesSchema = new Schema({
  title: {
    type: String,
    required: true,
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
