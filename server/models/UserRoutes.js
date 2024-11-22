const { Schema, model } = require('mongoose');

const userRoutesSchema = new Schema({
  name: {
    type: String,
    require: true,
  },
  path: {
    type: String,
    require: true,
    unique: true,
  },
  element: {
    type: String,
    require: true,
  },
  menuItem: {
    type: Boolean,
    require: true,
    default: true,
  },
});

const UserRoutes = model(
  'UserRoutes',
  userRoutesSchema,
  'UserRoutes'
);

module.exports = UserRoutes;
