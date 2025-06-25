// webInv-routes.js
const router = require('express').Router();
const {
getChangeLogs
} = require('../../controllers/WebChangeLog-controller.js');
const { authMiddleware } = require('../../utils/auth');


// /api/webchangelog/
router.get('/', getChangeLogs);


module.exports = router;
