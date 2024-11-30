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

const getGoldPriceHandler = async (req, res) => {
  const today = new Date().toDateString();

  try {
    const goldPriceFromDB = await getGoldPriceFromDatabase(today);

    if (goldPriceFromDB.length > 0) {
      console.log('goldPriceFromDB', goldPriceFromDB);
      res.json(goldPriceFromDB);
    } else {
      const goldPriceFromAPI = await getGoldPrice();
      console.log('goldPriceFromAPI', goldPriceFromAPI);
      await saveGoldPriceToDatabase(today, goldPriceFromAPI);
      res.json({ date: today, prices: goldPriceFromAPI });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getGoldPriceHandler };
