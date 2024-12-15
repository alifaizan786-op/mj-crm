const { Attributes } = require('../models');

module.exports = {
  // Get all attributes
  async getAllAttributes(req, res) {
    try {
      const allAttributes = await Attributes.find({});
      res.status(200).json(allAttributes);
    } catch (error) {
      console.error('Error fetching attributes:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // Get a single attribute by Title
  async getAttributeByTitle(req, res) {
    try {
      const { title } = req.params;
      const attribute = await Attributes.findOne({ title });
      if (!attribute) {
        return res.status(404).json({ error: 'Attribute not found' });
      }
      res.status(200).json(attribute);
    } catch (error) {
      console.error('Error fetching attribute by title:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // Create a new attribute
  async createAttribute(req, res) {
    try {
      const { title, prices } = req.body;
      const newAttribute = new Attributes({ title, prices });
      await newAttribute.save();
      res.status(201).json(newAttribute);
    } catch (error) {
      console.error('Error creating attribute:', error);
      res.status(400).json({ error: 'Bad Request' });
    }
  },

  // Update an existing attribute by ID
  async updateAttribute(req, res) {
    try {
      const { id } = req.params;
      const { title, prices } = req.body;
      const updatedAttribute = await Attributes.findByIdAndUpdate(
        id,
        { title, prices },
        { new: true, runValidators: true }
      );
      if (!updatedAttribute) {
        return res.status(404).json({ error: 'Attribute not found' });
      }
      res.status(200).json(updatedAttribute);
    } catch (error) {
      console.error('Error updating attribute:', error);
      res.status(400).json({ error: 'Bad Request' });
    }
  },

  // Delete an attribute by ID
  async deleteAttribute(req, res) {
    try {
      const { id } = req.params;
      const deletedAttribute = await Attributes.findByIdAndDelete(id);
      if (!deletedAttribute) {
        return res.status(404).json({ error: 'Attribute not found' });
      }
      res
        .status(200)
        .json({ message: 'Attribute deleted successfully' });
    } catch (error) {
      console.error('Error deleting attribute:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};
