const express = require('express');
const router = express.Router();
const { aiSearch } = require('../controllers/ai.controller.js');

router.post('/search', aiSearch);

module.exports = router;