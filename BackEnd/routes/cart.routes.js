const express = require('express');
const router = express.Router();
const { addToCart ,getCart, updateCart,removeFromCart} = require('../controllers/cart.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/add', authMiddleware, addToCart);
router.get('/', authMiddleware, getCart);
router.put('/update', authMiddleware, updateCart);
router.delete('/remove', authMiddleware, removeFromCart);


module.exports = router;