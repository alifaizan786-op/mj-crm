const router = require('express').Router();

const {
  createClient,

  todaysData,
  last30DaysData,
} = require('../../controllers/ClientForm-controller');

// /api/ClientForm/georgia | /api/ClientForm/texas | /api/ClientForm/florida
router.route('/:store').post(createClient);

// /api/ClientForm/today/georgia | /api/ClientForm/today/texas | /api/ClientForm/today/florida
router.route('/today/:store').get(todaysData);

// /api/ClientForm/month/georgia | /api/ClientForm/month/texas | /api/ClientForm/month/florida
router.route('/month/:store').get(last30DaysData);

module.exports = router;
