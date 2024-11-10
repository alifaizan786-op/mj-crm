const router = require('express').Router();
const {
  createUser,
  login,
} = require('../../controllers/User-controller');

// /api/user/
router.route('/').post(createUser);

// /api/user/login
router.route('/login').post(login);

module.exports = router;
