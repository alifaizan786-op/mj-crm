const router = require('express').Router();

const userRoutes = require('./User-routes');
const userRoutes_Routes = require('./UserRoutes-routes');
const userLogs_Routes = require('./UserLogs-routes');
const clientForm_Routes = require('./ClientForm-routes');

// /api/user
router.use('/user', userRoutes);

// /api/userRoutes
router.use('/userRoutes', userRoutes_Routes);

// /api/userlogs
router.use('/userlogs', userLogs_Routes);

// /api/ClientForm
router.use('/ClientForm', clientForm_Routes);

module.exports = router;
