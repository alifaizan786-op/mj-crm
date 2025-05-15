const CustomerExtended = require('../models/CustomerExtended');

module.exports = {
  // Get all customer extended records
  async getAllCustomers(req, res) {
    try {
      const customers = await CustomerExtended.find();
      res.status(200).json(customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // Get a single customer by ID
  async getCustomerById(req, res) {
    try {
      const { id } = req.params;
      const customer = await CustomerExtended.findById(id);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      res.status(200).json(customer);
    } catch (error) {
      console.error('Error fetching customer by ID:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // Create a new customer
  async createCustomer(req, res) {
    try {
      const {
        firstName,
        lastName,
        Contact,
        LinkedAccounts,
        LinkedWebAccounts,
        followers,
      } = req.body;

      const newCustomer = await CustomerExtended.create({
        firstName,
        lastName,
        Contact,
        LinkedAccounts,
        LinkedWebAccounts,
        followers,
      });

      res.status(201).json(newCustomer);
    } catch (error) {
      console.error('Error creating customer:', error);
      res.status(400).json({ error: 'Bad Request' });
    }
  },

  // Update an existing customer by ID
  async updateCustomer(req, res) {
    try {
      const { id } = req.params;
      const {
        firstName,
        lastName,
        Contact,
        LinkedAccounts,
        LinkedWebAccounts,
        followers,
      } = req.body;
      const updatedCustomer =
        await CustomerExtended.findByIdAndUpdate(
          id,
          {
            firstName,
            lastName,
            Contact,
            LinkedAccounts,
            LinkedWebAccounts,
            followers,
          },
          { new: true, runValidators: true }
        );
      if (!updatedCustomer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      res.status(200).json(updatedCustomer);
    } catch (error) {
      console.error('Error updating customer:', error);
      res.status(400).json({ error: 'Bad Request' });
    }
  },

  // Delete a customer by ID (soft delete)
  async deleteCustomer(req, res) {
    try {
      const { id } = req.params;
      const deletedCustomer =
        await CustomerExtended.findByIdAndUpdate(
          id,
          { isDeleted: true },
          { new: true }
        );
      if (!deletedCustomer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      res.status(200).json({
        message: 'Customer marked as deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting customer:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};
