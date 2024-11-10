const router = require('express').Router();
const apiRoutes = require('./api');
const path = require('path');
const express = require('express');

router.use('/api', apiRoutes);

module.exports = router;