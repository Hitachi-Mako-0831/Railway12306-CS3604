const express = require('express');
const orderController = require('../controllers/orderController');

const router = express.Router();

// 创建订单
router.post('/', orderController.createOrder);

// 获取订单列表（可选）
router.get('/', orderController.listOrders);

// 获取订单详情
router.get('/:orderId', orderController.getOrderDetail);

module.exports = router;