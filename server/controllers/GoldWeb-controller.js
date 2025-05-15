const { GoldWeb } = require('../models/');

module.exports = {
  async getGoldWeb(req, res) {
    try {
      const goldWebData = await GoldWeb.find()
        .sort({ date: -1 })
        .limit(1)
        .populate('UpdatedBy', 'employeeId')
      res.status(200).json(goldWebData);
    } catch (error) {
      console.error('Error fetching GoldWeb data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  async createGoldWeb(req, res) {
    try {
      const { PerOunceRate, UpdatedBy } = req.body;
      const newGoldWeb = await GoldWeb.create({
        PerOunceRate,
        UpdatedBy,
      });
      res.status(201).json(newGoldWeb);
    } catch (error) {
      console.error('Error creating GoldWeb data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};
