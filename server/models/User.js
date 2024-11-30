const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 5,
    },
    active: {
      type: Boolean,
      default: true,
      required: true,
    },
    region: { type: String, default: true, required: true },
    title: { type: String, default: true, required: true },
    views: [String], // Example: ['/Client/LookUp', '/Client/Reports/Anniversary']
    permissions: [String], // Example: ['view_users', 'edit_sales']
    bookmarks: {
      type: [
        {
          sortOrder: { type: Number, required: true },
          title: { type: String, required: true },
          link: { type: String, required: true },
          image: { type: String }, // Optional, can be null or undefined
          folder: { type: String }, // Optional, can be null or undefined
        },
      ],
      default: [
        {
          sortOrder: 0,
          title: 'Daily Price Sheet',
          link: 'https://docs.google.com/spreadsheets/d/1xXXpql0yZZetnhJhgXsrhFDoX3BP-5Bn0JSB6jCc_eE/edit#gid=0',
          image:
            'https://ssl.gstatic.com/docs/spreadsheets/spreadsheets_2023q4.ico',
        },
        {
          sortOrder: 1,
          title: 'Mj Plus Home',
          link: 'http://173.14.213.113:8081/mj/default.aspx',
        },
        {
          sortOrder: 2,
          title: 'Malani Jewelers.com',
          link: 'https://malanijewelers.com/',
          image:
            'https://malanijewelers.com/images/apple-icon-114x114.png',
        },
        {
          sortOrder: 3,
          title: 'Website Gateway',
          link: 'https://malanij.com/eadmin/index.html#/quickSearch',
          image: 'https://malanij.com/eadmin/assets/images/logo.png',
        },
      ],
    },
  },
  { optimisticConcurrency: true }
);

userSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

userSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = model('User', userSchema, 'User');

module.exports = User;
