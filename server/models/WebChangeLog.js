const { Schema, model } = require('mongoose');

const ChangeEntrySchema = new Schema(
  {
    fieldName: { type: String, required: true },
    oldValue: { type: Schema.Types.Mixed }, // Can be string, number, boolean, etc.
    newValue: { type: Schema.Types.Mixed },
    source: { type: String, required: true }, // 'bulk_pricing', 'manual_edit', 'api_update', etc.
    message: { type: String }, // Optional message for context, errors, etc.
  },
  { _id: false }
);

const WebChangeLogSchema = new Schema(
  {
    timestamp: { type: Date, default: Date.now, index: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    destination: { type: String, required: true, index: true }, // 'shopify', 'internal_db', 'external_api', etc.
    id: { type: String, required: true, index: true }, // SKU, product_id, user_id, etc.
    changes: [ChangeEntrySchema],
  },
  {
    timestamps: false, // We're using our own timestamp
    // Add compound indexes for common queries
    index: { destination: 1, id: 1, timestamp: -1 },
    index: { user: 1, timestamp: -1 },
  }
);

// Static method to log any field changes for any destination/id
WebChangeLogSchema.statics.logChanges = async function (
  userId,
  destination,
  id,
  changes
) {
  return await this.create({
    user: userId, // Now expects ObjectId
    destination,
    id,
    changes: Array.isArray(changes) ? changes : [changes],
  });
};

// Static method specifically for Shopify SKU changes (convenience method)
WebChangeLogSchema.statics.logShopifySkuChange = async function (
  userId,
  sku,
  changes
) {
  return await this.logChanges(userId, 'shopify', sku, changes);
};

// Static method for price changes (convenience method)
WebChangeLogSchema.statics.logPriceChange = async function (
  userId,
  destination,
  id,
  oldPrice,
  newPrice,
  source = 'price_update'
) {
  return await this.logChanges(userId, destination, id, {
    fieldName: 'price',
    oldValue: oldPrice,
    newValue: newPrice,
    source,
  });
};

// Instance method to get a readable summary (handles both populated and non-populated user)
WebChangeLogSchema.methods.getSummary = function () {
  let userName = 'Unknown User';


  if (this.user) {
    if (typeof this.user === 'object' && this.user._id) {
      // User is populated
      userName = this.user.employeeId || 'Unknown User';
    } else {
      // User is just an ObjectId
      userName = this.user.toString();
    }
  }

  const changesList = this.changes
    .map((change) => {
      const baseChange = `${change.fieldName}: ${change.oldValue} → ${change.newValue} (${change.source})`;
      return change.message
        ? `${baseChange} - ${change.message}`
        : baseChange;
    })
    .join(', ');

  return `[${this.timestamp.toISOString()}] ${userName} changed ${
    this.destination
  }:${this.id}: ${changesList}`;
};

const WebChangeLog = model(
  'WebChangeLog',
  WebChangeLogSchema,
  'WebChangeLog'
);

module.exports = WebChangeLog;
