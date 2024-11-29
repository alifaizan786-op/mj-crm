const { Schema, model } = require('mongoose');

const userLogs = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      require: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    body: {
      type: String,
      require: true,
    },
  },
  { strict: false }
);

const UserLogs = model('UserLogs', userLogs, 'UserLogs');

module.exports = UserLogs;
