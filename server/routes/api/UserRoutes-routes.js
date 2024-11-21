const router = require('express').Router();
const {
  createRoute,
  getAllRoutes,
  getRoutesByPaths,
  updateRoutes,
  deleteRoutes,
} = require('../../controllers/UserRoutes-controller');

// /api/userRoutes/
router.route('/').get(getAllRoutes).post(createRoute);

// /api/userRoutes/:id
router.route('/:id').put(updateRoutes).delete(deleteRoutes);

// /api/userRoutes/:id
router.route('/paths').get(getRoutesByPaths);

module.exports = router;
