const { Schema, model } = require('mongoose');

const goldWebSchema = new Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  PerOunceRate: {
    type: Number,
    required: true,
  },
  Base22KtRate: {
    type: Number,
    required: false, // Will be auto-calculated
  },
  Base21KtRate: {
    type: Number,
    required: false, // Will be auto-calculated
  },
  Base18KtRate: {
    type: Number,
    required: false, // Will be auto-calculated
  },
  UpdatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

// Pre-save middleware to calculate rates
goldWebSchema.pre('save', function (next) {
  const OUNCE_TO_GRAM = 31.1035;

  // Example calculation formulas:
  // (You can change the formulas to match your actual business logic)
  const baseRatePerGram = this.PerOunceRate / OUNCE_TO_GRAM;

  this.Base22KtRate = +(baseRatePerGram * (22 / 24)).toFixed(2);
  this.Base21KtRate = +(baseRatePerGram * (21 / 24)).toFixed(2);
  this.Base18KtRate = +(baseRatePerGram * (18 / 24)).toFixed(2);

  next();
});

const GoldWeb = model('GoldWeb', goldWebSchema, 'GoldWeb');

module.exports = GoldWeb;
