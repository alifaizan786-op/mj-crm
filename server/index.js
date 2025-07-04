const express = require('express');
const { MalaniCRM } = require('./config/connection');
const routes = require('./routes');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');

const PORT = process.env.PORT || 8085;
const app = express();

// Use express-fileupload middleware
app.use(fileUpload());
// app.use(bodyParser({ limit: "50mb" }));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(routes);

// To serve the client folder
app.use(express.static(path.join(__dirname, './public/')));

// To serve the client folder locally
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

// To serve the client folder
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

MalaniCRM.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
  });
});
