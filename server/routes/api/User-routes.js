const router = require('express').Router();
const {
  createUser,
  login,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} = require('../../controllers/User-controller');

// /api/user/
router.route('/').get(getAllUsers).post(createUser);

// /api/user/login
router.route('/login').post(login);

// /api/user/:id
router
  .route('/:id')
  .get(getUserById)
  .put(updateUserById)
  .delete(deleteUserById);

module.exports = router;
