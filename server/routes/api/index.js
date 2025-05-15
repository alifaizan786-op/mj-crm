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
const Attribute_Routes = require('./Attribute-routes');
const Multi_Routes = require('./Multi-routes');
const Image_Routes = require('./Image-routes');
const Sizing_Routes = require('./Sizing-routes');
const WebUtil_Routes = require('./WebUtil-routes');
const GoldWeb_Routes = require('./GoldWeb-routes');

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

// /api/attribute
router.use('/attribute', Attribute_Routes);

// /api/multi
router.use('/multi', Multi_Routes);

// /api/image
router.use('/image', Image_Routes);

// /api/sizing
router.use('/sizing', Sizing_Routes);

// /api/webUtil
router.use('/webUtil', WebUtil_Routes);

// /api/goldweb
router.use('/goldweb', GoldWeb_Routes);

module.exports = router;
