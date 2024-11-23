const router = require('express').Router();

const userRoutes = require('./User-routes');
const userRoutes_Routes = require('./UserRoutes-routes');
const utilityRoutes = require('./Utility-routes');

// /api/user
router.use('/user', userRoutes);

// /api/userRoutes
router.use('/userRoutes', userRoutes_Routes);

// /api/utility
router.use('/utility', utilityRoutes);

module.exports = router;
