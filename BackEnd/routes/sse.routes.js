// stream.routes.js
const express = require('express');
const router = express.Router();
const { stockStreamHandler } = require('../services/stockStream');

router.get('/stock', stockStreamHandler);

module.exports = router;