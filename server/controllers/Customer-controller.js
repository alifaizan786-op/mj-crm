const { CUSTOMER } = require('../models');

module.exports = {
  async createCustomer(req, res) {
    try {
      const newCustomer = await CUSTOMER.create(req.body);
      res.status(200).json(newCustomer);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async getAllCustomers(req, res) {
    try {
      const allCustomers = await CUSTOMER.find({});
      res.status(200).json(allCustomers);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async getCustomerById(req, res) {
    try {
      const { id } = req.params;
      const customer = await CUSTOMER.findById(id);

      if (!customer) {
        return res.status(404).json({ error: 'Customer Not Found' });
      }

      res.status(200).json(customer);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async updateCustomerById(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedCustomer = await CUSTOMER.findByIdAndUpdate(
        id,
        { ...updates, $inc: { __v: 1 } },
        { new: true, runValidators: true }
      );

      if (!updatedCustomer) {
        return res.status(404).json({ error: 'Customer Not Found' });
      }

      res.status(200).json(updatedCustomer);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async deleteCustomerById(req, res) {
    try {
      const { id } = req.params;

      const deactivatedCustomer = await CUSTOMER.findByIdAndUpdate(
        id,
        { inactive: true },
        { new: true, runValidators: true }
      );

      if (!deactivatedCustomer) {
        return res.status(404).json({ error: 'Customer Not Found' });
      }

      res.status(200).json({
        message: 'Customer Deactivated Successfully',
        customer: deactivatedCustomer,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async searchCustomer(req, res) {
    try {
      const { query } = req.body;

      if (!query || query.trim() === '') {
        return res
          .status(400)
          .json({ error: 'Search query is required.' });
      }

      const regex = new RegExp(query, 'i'); // Case-insensitive regex for the search
      const searchConditions = [
        { last: { $regex: regex } },
        { first: { $regex: regex } },
        { customer: { $regex: regex } },
        { title1: { $regex: regex } },
        { address: { $regex: regex } },
        { address2: { $regex: regex } },
        { city: { $regex: regex } },
        { state: { $regex: regex } },
        { zip: { $regex: regex } },
        { country: { $regex: regex } },
        { home: { $regex: regex } },
        { work: { $regex: regex } },
        { mobile: { $regex: regex } },
        { spouse: { $regex: regex } },
        { email: { $regex: regex } },
        { emailspous: { $regex: regex } },
        { store_code: { $regex: regex } },
      ];

      const results = await CUSTOMER.find({ $or: searchConditions });

      if (results.length === 0) {
        return res
          .status(404)
          .json({ message: 'No matching records found.' });
      }

      res.status(200).json(results);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
  async filterCustomer(req, res) {
    try {
      const {
        ytd_purch,
        store_code,
        city,
        state,
        py_purch,
        purchvisit,
        last_purch,
        date_added,
      } = req.body;

      const query = {};

      // Filter by ytd_purch (min and max range)
      if (ytd_purch?.min !== undefined || ytd_purch?.max !== undefined) {
        query.ytd_purch = {};
        if (ytd_purch.min !== undefined) query.ytd_purch.$gte = ytd_purch.min;
        if (ytd_purch.max !== undefined) query.ytd_purch.$lte = ytd_purch.max;
      }

      // Filter by store_code (array of values)
      if (store_code?.length) {
        query.store_code = { $in: store_code };
      }

      // Filter by city (array of values)
      if (city?.length) {
        query.city = { $in: city };
      }

      // Filter by state (array of values)
      if (state?.length) {
        query.state = { $in: state };
      }

      // Filter by py_purch (min and max range)
      if (py_purch?.min !== undefined || py_purch?.max !== undefined) {
        query.py_purch = {};
        if (py_purch.min !== undefined) query.py_purch.$gte = py_purch.min;
        if (py_purch.max !== undefined) query.py_purch.$lte = py_purch.max;
      }

      // Filter by purchvisit (min and max range)
      if (purchvisit?.min !== undefined || purchvisit?.max !== undefined) {
        query.purchvisit = {};
        if (purchvisit.min !== undefined) query.purchvisit.$gte = purchvisit.min;
        if (purchvisit.max !== undefined) query.purchvisit.$lte = purchvisit.max;
      }

      // Filter by last_purch (date range)
      if (last_purch?.min || last_purch?.max) {
        query.last_purch = {};
        if (last_purch.min) query.last_purch.$gte = new Date(last_purch.min);
        if (last_purch.max) query.last_purch.$lte = new Date(last_purch.max);
      }

      // Filter by date_added (date range)
      if (date_added?.min || date_added?.max) {
        query.date_added = {};
        if (date_added.min) query.date_added.$gte = new Date(date_added.min);
        if (date_added.max) query.date_added.$lte = new Date(date_added.max);
      }

      // Query the database with the constructed filters
      const results = await CUSTOMER.find(query);

      if (!results.length) {
        return res.status(404).json({ message: 'No matching records found.' });
      }

      res.status(200).json(results);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};
