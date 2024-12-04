const router = require('express').Router();

const userRoutes = require('./User-routes');
const userRoutes_Routes = require('./UserRoutes-routes');
const userLogs_Routes = require('./UserLogs-routes');
const clientForm_Routes = require('./ClientForm-routes');
const quotes_Routes = require('./Quotes-routes');
const gold_Routes = require('./Gold-routes');
const customer_Routes = require('./Customer-routes');
const Inv_Routes = require('./Inv-routes');
const Web_Routes = require('./Web-routes');

// /api/user
router.use('/user', userRoutes);

// /api/userRoutes
router.use('/userRoutes', userRoutes_Routes);

// /api/userlogs
router.use('/userlogs', userLogs_Routes);

// /api/ClientForm
router.use('/ClientForm', clientForm_Routes);

// /api/Gold
router.use('/Gold', gold_Routes);

// /api/quotes
router.use('/quotes', quotes_Routes);

// /api/customer
router.use('/customer', customer_Routes);

// /api/website
router.use('/website', Web_Routes);

// /api/inventory
router.use('/inventory', Inv_Routes);

module.exports = router;
