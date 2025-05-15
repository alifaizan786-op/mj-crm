const { Schema, model } = require('mongoose');
const PricingPolicy = require('./PricingPolicy');

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

// After saving GoldWeb -> update all PricingPolicy of type 'PerGram'
goldWebSchema.post('save', async function () {
  const latestGoldRate = this;

  // Update all PricingPolicies with Type 'PerGram'
  const pricingPolicies = await PricingPolicy.find({
    Type: 'PerGram',
  });

  const bulkOps = pricingPolicies.map((policy) => {
    const MarginPergram = +(
      policy.BaseMargin - policy.DiscountOnMargin
    ).toFixed(2);

    return {
      updateOne: {
        filter: { _id: policy._id },
        update: {
          MarginPergram: MarginPergram,
          Base22KtRate: +(
            latestGoldRate.Base22KtRate + MarginPergram
          ).toFixed(2),
          Base21KtRate: +(
            latestGoldRate.Base21KtRate + MarginPergram
          ).toFixed(2),
          Base18KtRate: +(
            latestGoldRate.Base18KtRate + MarginPergram
          ).toFixed(2),
        },
      },
    };
  });

  if (bulkOps.length > 0) {
    await PricingPolicy.bulkWrite(bulkOps);
    console.log(
      `Updated ${bulkOps.length} PricingPolicy documents after GoldWeb update.`
    );
  }
});

const GoldWeb = model('GoldWeb', goldWebSchema, 'GoldWeb');

module.exports = GoldWeb;
