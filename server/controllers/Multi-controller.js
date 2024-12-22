const { Multi } = require('../models');

module.exports = {
  // Get All Sku
  async getAllMulti(req, res) {
    try {
      const data = await Multi.find({ isDeleted: null })
        .select('-__v -_id')
        .sort({ _id: -1 });
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  },

  async getOneMulti(req, res) {
    try {
      const data = await Multi.findOne({
        multiCode: req.params.multiCode,
      }).select('-__v -_id');
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  },

  async getMultiByQuery(req, res) {
    try {
      // Validate and build the query dynamically
      let query = [];
      console.log(req.query);

      for (let key in req.query) {
        const value = req.query[key];

        if (value) {
          // Handle '+' replacements and add the condition
          const formattedValue = value.includes('+')
            ? value.split('+').join(' ')
            : value;
          query.push({ [key]: formattedValue });
        }
      }

      // Ensure query has at least one valid condition
      if (query.length === 0) {
        return res
          .status(400)
          .json({ message: 'No valid query parameters provided.' });
      }

      // Query the database
      const data = await Multi.find({ $and: query }).select(
        '-__v -_id'
      );

      res.json(data);
    } catch (err) {
      console.error('Error in getMultiByQuery:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async createMulti(req, res) {
    try {
      const data = await Multi.create(req.body);
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  },

  async updateMulti(req, res) {
    try {
      const data = await Multi.findOneAndUpdate(
        { multiCode: req.params.multiCode },
        req.body,
        {
          new: true,
        }
      );
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  },

  async deleteMulti(req, res) {
    try {
      const data = await Multi.findOneAndUpdate(
        { multiCode: req.params.multiCode },
        { $set: { isDeleted: true } },
        { new: true }
      );

      if (data) {
        res.json(data);
      } else {
        res.status(404).json({ message: 'Multi not found' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  },

  async bulkMultiCode(req, res) {
    try {
      console.log(req.body.multiCode);

      const result = await Multi.find({
        multiCode: { $in: req.body.multiCode },
      });

      if (result.length === 0) {
        return res
          .status(404)
          .json({ message: 'No matching documents found' });
      }

      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
