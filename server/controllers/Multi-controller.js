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
      let query = [];
      for (let key in req.query) {
        if (req.query[key].includes('+')) {
          query.push({ [key]: req.query[key].split('+').join(' ') });
        } else {
          query.push({ [key]: req.query[key] });
        }
      }

      let data;
      if (query.length > 1) {
        data = await Multi.find({ $and: query }).select('-__v -_id');
      } else {
        data = await Multi.find(query[0]).select('-__v -_id');
      }
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
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
