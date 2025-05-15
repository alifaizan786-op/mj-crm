const { Schema, model } = require('mongoose');

const SupplyLedgerSchema = new Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  item: {
    type: Schema.Types.ObjectId,
    ref: 'SupplyInfo',
  },
  note: {
    type: String,
  },
  to: {
    type: String,
  },
  from: {
    type: String,
  },
  quantity: {
    type: Number,
  },
  requestedBy: {
    type: String,
  },
  fulfilledBy: {
    type: String,
  },
  status: {
    type: String,
    enum: ['requested', 'fulfilled', 'cancelled'],
    default: 'requested',
  },
});

const SupplyLedger = model(
  'SupplyLedger',
  SupplyLedgerSchema,
  'SupplyLedger'
);

module.exports = SupplyLedger;
