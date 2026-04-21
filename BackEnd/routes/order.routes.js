const express = require('express');
const router = express.Router();

const { checkout, getOrders ,getOrderById,updateOrderStatus} = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/checkout', authMiddleware, checkout);
router.get('/', authMiddleware, getOrders);
router.get('/:id', authMiddleware, getOrderById);
router.put('/:id/status', authMiddleware, updateOrderStatus);

module.exports = router;