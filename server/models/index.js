// Models For Data From VJS
const INV = require('./INV');
const SARECORD = require('./SARECORD');
const CUSTOMER = require('./CUSTOMER');

// Models For Web
const Sizing = require('./Sizing');
const Multi = require('./Multi');

// Models For In Showroom Data
const Gold = require('./Gold');
const ClientForm = require('./ClientForm');

//Models For App
const User = require('./User');
const UserRoutes = require('./UserRoutes');
const UserLogs = require('./UserLog');
const Quotes = require('./Quotes');
const Attributes = require('./Attributes');
const CustomerExtended = require('./CustomerExtended');

// Models For MalaniJewelers 3.0
const GoldWeb = require('./GoldWeb');
const PricingPolicy = require('./PricingPolicy');
const WebInv = require('./WebInv');
const WebChangeLog = require('./WebChangeLog');

module.exports = {
  // Models For Data From VJS
  INV,
  SARECORD,
  CUSTOMER,

  // Models For Web
  Sizing,
  Multi,

  // Models For In Showroom Data
  Gold,
  ClientForm,

  //Models For App
  User,
  UserRoutes,
  UserLogs,
  Quotes,
  Attributes,
  CustomerExtended,

  // Models For MalaniJewelers 3.0
  GoldWeb,
  PricingPolicy,
  WebInv,
  WebChangeLog
};
