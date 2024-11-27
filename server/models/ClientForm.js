const { Schema, model } = require('mongoose');

const client = new Schema(
  {
    FirstName: {
      type: String,
    },
    LastName: {
      type: String,
    },
  },
  { strict: false }
);

const ClientForm = model('ClientForm', client, 'ClientForm');

module.exports = ClientForm;
