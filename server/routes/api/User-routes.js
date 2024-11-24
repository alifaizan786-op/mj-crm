const router = require('express').Router();
const {
  createUser,
  login,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  getUserBookmarks,
} = require('../../controllers/User-controller');

// /api/user/
router.route('/').get(getAllUsers).post(createUser);

// /api/user/login
router.route('/login').post(login);

// /api/user/bookmarks/:
router.route('/bookmarks/:id').get(getUserBookmarks);

// /api/user/:id
router
  .route('/:id')
  .get(getUserById)
  .put(updateUserById)
  .delete(deleteUserById);

module.exports = router;
