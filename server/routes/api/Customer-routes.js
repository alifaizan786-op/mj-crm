const router = require('express').Router();
const {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomerById,
  deleteCustomerById,
  searchCustomer,
  filterCustomer,
} = require('../../controllers/Customer-controller');

// Define /api/customer/search before /api/customer/:id to avoid conflicts
router.route('/search').post(searchCustomer);

// Define /api/customer/filter before /api/customer/:id to avoid conflicts
router.route('/filter').post(filterCustomer);

// /api/customer/
router.route('/').get(getAllCustomers).post(createCustomer);

// /api/customer/:id
router
  .route('/:id')
  .get(getCustomerById)
  .put(updateCustomerById)
  .delete(deleteCustomerById);

module.exports = router;
