const router = require('express').Router();
const {
  addQuote,
  getAllQuotes,
  getQuoteById,
  updateQuote,
  deleteQuote,
  getRandomQuotes,
} = require('../../controllers/Quotes-Controller'); // Adjust the path as needed

// /api/quotes/
router.route('/').get(getAllQuotes).post(addQuote);

// /api/quotes/random/:count
router.route('/random/:count').get(getRandomQuotes);

// /api/quotes/:id
router
  .route('/:id')
  .get(getQuoteById)
  .put(updateQuote)
  .delete(deleteQuote);

module.exports = router;
