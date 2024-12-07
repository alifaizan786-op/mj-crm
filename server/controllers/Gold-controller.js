// controllers/goldPriceController.js
const axios = require('axios');
require('dotenv').config();
const { Gold } = require('../models/');

const API_URL =
  'https://live-metal-prices.p.rapidapi.com/v1/latest/XAU,XAG,PA,PL,GBP,USD/USD';
const API_HEADERS = {
  'X-RapidAPI-Key': process.env.GOLD_API_KEY,
  'X-RapidAPI-Host': 'live-metal-prices.p.rapidapi.com',
};

const getGoldPrice = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: API_HEADERS,
    });
    return response.data;
  } catch (error) {
    throw new Error('Error fetching gold price from API');
  }
};

const getGoldPriceFromDatabase = async (date) => {
  try {
    const goldPrice = await Gold.find({ date });
    return goldPrice;
  } catch (error) {
    console.log(error);
    throw new Error('Error fetching gold price from database');
  }
};

const saveGoldPriceToDatabase = async (date, prices) => {
  try {
    const goldPrice = new Gold({
      date,
      prices,
    });
    await goldPrice.save();
  } catch (error) {
    throw new Error('Error saving gold price to database');
  }
};

const getLatestGoldPriceFromDatabase = async () => {
  try {
    const latestGoldPrice = await Gold.findOne().sort({ date: -1 }); // Get the most recent entry
    return latestGoldPrice;
  } catch (error) {
    console.log(error);
    throw new Error(
      'Error fetching the latest gold price from database'
    );
  }
};

const getGoldPriceHandler = async (req, res) => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
  const todayString = today.toDateString();

  try {
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // If today is Saturday or Sunday
      const latestGoldPrice = await getLatestGoldPriceFromDatabase();

      if (latestGoldPrice) {
        res.json(latestGoldPrice);
        return;
      } else {
        res.status(404).json({
          error: 'No gold price data available in the database',
        });
        return;
      }
    }

    // For weekdays, proceed as usual
    const goldPriceFromDB = await getGoldPriceFromDatabase(
      todayString
    );

    if (goldPriceFromDB.length > 0) {
      res.json(goldPriceFromDB);
    } else {
      const goldPriceFromAPI = await getGoldPrice();
      console.log('goldPriceFromAPI', goldPriceFromAPI);
      await saveGoldPriceToDatabase(todayString, goldPriceFromAPI);
      res.json({ date: todayString, prices: goldPriceFromAPI });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getGoldPriceHandler };
