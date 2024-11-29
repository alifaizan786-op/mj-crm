const router = require('express').Router();
const {
  getAllUserLogs,
  getUserLogsByUserId,
  getUserLogsByLogId,
  createLog,
  updateLogById,
  deleteLogById,
} = require('../../controllers/UserLog-controller');

// /api/userlogs/
router.route('/').get(getAllUserLogs).post(createLog);

// /api/userlogs/user/:userId
router.route('/user/:userId').get(getUserLogsByUserId);

// /api/userlogs/:logId
router
  .route('/:logId')
  .get(getUserLogsByLogId)
  .put(updateLogById)
  .delete(deleteLogById);

module.exports = router;
