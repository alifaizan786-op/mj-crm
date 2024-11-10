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

const Client = model('Client', client, 'Client');

module.exports = Client;
