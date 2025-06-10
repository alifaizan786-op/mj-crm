const { Schema, model } = require("mongoose");

const PricingPolicySchema = new Schema({
  Classcode: { type: Number, required: true },
  ClasscodeDesc: { type: String, required: true },
  Type: {
    type: String,
    required: true,
    enum: ["Discount", "PerGram"],
  },
  Vendor: { type: String },
  FromMonths: { type: Number, required: true },
  ToMonths: { type: Number, required: true },
  BaseMargin: { type: Number },
  DiscountOnMargin: { type: Number, required: true },
  MarginPergram: { type: Number },
  Base22KtRate: { type: Number },
  Base21KtRate: { type: Number },
  Base18KtRate: { type: Number },
  UpdatedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  UpdateDate: { type: Date, default: Date.now },
});

PricingPolicySchema.pre("save", async function (next) {
  this.UpdateDate = Date.now();

  if (this.Type === "PerGram") {
    if (
      typeof this.BaseMargin === "number" &&
      typeof this.DiscountOnMargin === "number"
    ) {
      this.MarginPergram = +(this.BaseMargin - this.DiscountOnMargin).toFixed(
        2
      );
    }

    // Require inside the hook to break circular dependency
    const GoldWeb = require("./GoldWeb");

    const latestGoldRate = await GoldWeb.findOne().sort({ date: -1 }).lean();

    if (latestGoldRate) {
      this.Base22KtRate = +(
        latestGoldRate.Base22KtRate + this.MarginPergram
      ).toFixed(2);
      this.Base21KtRate = +(
        latestGoldRate.Base21KtRate + this.MarginPergram
      ).toFixed(2);
      this.Base18KtRate = +(
        latestGoldRate.Base18KtRate + this.MarginPergram
      ).toFixed(2);
    }
  }

  next();
});

const PricingPolicy = model(
  "PricingPolicy",
  PricingPolicySchema,
  "PricingPolicy"
);

module.exports = PricingPolicy;
