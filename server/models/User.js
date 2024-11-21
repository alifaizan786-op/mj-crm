const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
  firstName: {
    type: String,
    require: true,
  },
  lastName: {
    type: String,
    require: true,
  },
  employeeId: {
    type: String,
    require: true,
  },
  department: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
    minlength: 5,
  },
  active: {
    type: Boolean,
    default: true,
    require: true,
  },
  views: [String], // Example: ['/Client/LookUp', '/Client/Reports/Anniversary']
  permissions: [String], // Example: ['view_users', 'edit_sales']
});

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
