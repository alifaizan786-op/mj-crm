const router = require('express').Router();

const userRoutes = require('./User-routes');

// /api/user
router.use('/user', userRoutes);

module.exports = router;
