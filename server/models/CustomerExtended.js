// CustomerExtended.js

const { Schema, model } = require('mongoose');

const LinkedAccountSchema = new Schema({
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  AccountId: {
    type: Schema.Types.ObjectId,
    ref: 'CUSTOMER',
    required: true,
  },
  Account_Id: {
    type: String,
    required: true,
  },
  dateLinked: {
    type: Date,
    default: Date.now,
  },
});

const LinkedWebAccountSchema = new Schema({
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  AccountId: {
    type: Schema.Types.ObjectId,
    ref: 'CUSTOMER',
    required: true,
  },
  Account_Id: {
    type: String,
    required: true,
  },
  dateLinked: {
    type: Date,
    default: Date.now,
  },
});

const contactSchema = new Schema({
  type: {
    type: String,
    enum: [
      'Work Phone',
      'Home Phone',
      'Mobile Phone',
      'Email',
      'Work Email',
      'Spouse Phone',
      'Spouse Email',
    ],
    default: 'Mobile Phone',
    required: true,
  },
  value: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        // Validate based on type
        if (this.type.includes('Phone')) {
          return /^\+?[0-9]{7,15}$/.test(v); // Phone number validation
        } else if (this.type.includes('Email')) {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v); // Email validation
        }
        return false;
      },
      message: (props) =>
        `${props.value} is not a valid ${props.instance.type}`,
    },
  },
  primary: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const followerSchema = new Schema({
  follower: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dateFollowed: {
    type: Date,
    default: Date.now,
  },
});

const CustomerExtendedSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    Contact: [contactSchema],
    LinkedAccounts: [LinkedAccountSchema],
    LinkedWebAccounts: [LinkedWebAccountSchema],
    followers: [followerSchema],
  },
  {
    optimisticConcurrency: true,
    collation: { locale: 'en', strength: 2 },
  }
);

const CustomerExtended = model(
  'CustomerExtended',
  CustomerExtendedSchema,
  'CustomerExtended'
);

module.exports = CustomerExtended;
