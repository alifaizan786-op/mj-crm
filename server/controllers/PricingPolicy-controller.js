const { PricingPolicy } = require('../models/');
const path = require('path');
const fs = require('fs'); // For existsSync, createReadStream, etc.
const fsPromises = require('fs').promises; // If you need async fs operations elsewhere

module.exports = {
  async getPricingPolicy(req, res) {
    try {
      const pricingPolicy = await PricingPolicy.find()
        .populate('UpdatedBy', 'employeeId')
        .sort({
          Classcode: 1,
          Vendor: 1,
          FromMonths: 1,
        });

      res.status(200).json(pricingPolicy);
    } catch (error) {
      console.error('Error fetching pricing policy:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async createPricingPolicy(req, res) {
    try {
      const newPolicy = await PricingPolicy.create(req.body);
      res.status(201).json(newPolicy);
    } catch (error) {
      console.error('Error creating pricing policy:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getByClassCode(req, res) {
    try {
      const { classcode } = req.params;
      const policies = await PricingPolicy.find({
        Classcode: classcode,
      });
      if (!policies.length) {
        return res.status(404).json({
          error: 'No pricing policies found for this Classcode',
        });
      }
      res.status(200).json(policies);
    } catch (error) {
      console.error('Error fetching by Classcode:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async updateById(req, res) {
    try {
      const { id } = req.params;
      const policy = await PricingPolicy.findById(id);
      if (!policy) {
        return res
          .status(404)
          .json({ error: 'PricingPolicy not found' });
      }

      // Apply updates to document (merge req.body into policy)
      Object.keys(req.body).forEach((key) => {
        policy[key] = req.body[key];
      });

      // Now save, which triggers pre('save') and updates UpdateDate
      await policy.save();

      res.status(200).json(policy);
    } catch (error) {
      console.error('Error updating pricing policy:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async deleteById(req, res) {
    try {
      const { id } = req.params;
      const deletedPolicy = await PricingPolicy.findByIdAndDelete(id);
      if (!deletedPolicy) {
        return res
          .status(404)
          .json({ error: 'PricingPolicy not found' });
      }
      res
        .status(200)
        .json({ message: 'PricingPolicy deleted successfully' });
    } catch (error) {
      console.error('Error deleting pricing policy:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getLogs(req, res) {
    try {
      const logsDir = path.resolve('./logs');
      const files = await fsPromises.readdir(logsDir);

      res.json({
        logs: files.filter((file) => file.startsWith('priceRefresh')),
      });
    } catch (error) {
      console.log(error);
      res.json({ error });
    }
  },

  async getLogFile(req, res) {
    try {
      const fileName = req.params.fileName;

      if (!fileName) {
        return res
          .status(400)
          .json({ error: 'File name is required' });
      }

      const logsDir = path.resolve('./logs');
      const filePath = path.join(logsDir, fileName);

      // Security Check: Prevent Path Traversal Attack (../etc/passwd)
      if (!filePath.startsWith(logsDir)) {
        return res.status(400).json({ error: 'Invalid file path' });
      }

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Send file as response
      res.sendFile(filePath);
    } catch (error) {
      console.error('Error fetching log file:', error);
      res.status(500).json({ error: 'Failed to fetch log file' });
    }
  },
};
