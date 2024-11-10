const { Schema, model } = require('mongoose');

const sizing = new Schema(
  {
    Date: {
      type: Date,
      // Format the date as "07/25/2023" when sending to the client
      get: (date) => date.toLocaleDateString('en-US'),
      // Parse incoming dates in the "07/25/2023" format
      set: (dateString) => new Date(dateString),
    },
    initial: {
      type: String,
    },
    SKUCode: {
      type: String,
    },
  },
  { strict: false }
);

const Sizing = model('Sizing', sizing, 'Sizing');

module.exports = Sizing;
