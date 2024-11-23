const router = require('express').Router();

const userRoutes = require('./User-routes');
const userRoutes_Routes = require('./UserRoutes-routes');


// /api/user
router.use('/user', userRoutes);

// /api/userRoutes
router.use('/userRoutes', userRoutes_Routes);



module.exports = router;
