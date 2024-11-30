const { Quotes } = require('../models');

module.exports = {
  async addQuote(req, res) {
    try {
      const { body, author, tags } = req.body;
      const newQuote = new Quotes({ body, author, tags });
      await newQuote.save();
      res
        .status(201)
        .json({
          message: 'Quote added successfully',
          quote: newQuote,
        });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getAllQuotes(req, res) {
    try {
      const quotes = await Quotes.find({ deleted: false }); // Filter for non-deleted items
      res.status(200).json(quotes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getQuoteById(req, res) {
    try {
      const { id } = req.params;
      const quote = await Quotes.findOne({ _id: id, deleted: false }); // Filter for non-deleted items
      if (!quote) {
        return res.status(404).json({ message: 'Quote not found' });
      }
      res.status(200).json(quote);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateQuote(req, res) {
    try {
      const { id } = req.params;
      const updatedQuote = await Quotes.findOneAndUpdate(
        { _id: id, deleted: false }, // Ensure the item is not deleted
        req.body,
        { new: true }
      );
      if (!updatedQuote) {
        return res
          .status(404)
          .json({ message: 'Quote not found or deleted' });
      }
      res
        .status(200)
        .json({
          message: 'Quote updated successfully',
          quote: updatedQuote,
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteQuote(req, res) {
    try {
      const { id } = req.params;
      const deletedQuote = await Quotes.findByIdAndUpdate(
        id,
        { deleted: true },
        { new: true }
      );
      if (!deletedQuote) {
        return res.status(404).json({ message: 'Quote not found' });
      }
      res
        .status(200)
        .json({
          message: 'Quote soft deleted successfully',
          quote: deletedQuote,
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getRandomQuotes(req, res) {
    try {
      const { count } = req.params;
      const numberOfQuotes = parseInt(count, 10);

      if (isNaN(numberOfQuotes) || numberOfQuotes <= 0) {
        return res
          .status(400)
          .json({ message: 'Invalid count parameter' });
      }

      // Add filter for non-deleted quotes
      const randomQuotes = await Quotes.aggregate([
        { $match: { deleted: false } }, // Ensure only non-deleted items are considered
        { $sample: { size: numberOfQuotes } },
      ]);

      res.status(200).json(randomQuotes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
