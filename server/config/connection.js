const mongoose = require('mongoose');
const sql = require('mssql');
require('dotenv').config();

mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Mj-CRM'
);

const connection = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  server: process.env.SQL_IP,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

module.exports = {
  MalaniCRM: mongoose.connection,
  MalaniWEB: sql.connect(connection),
};
