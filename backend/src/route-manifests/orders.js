const express = require('express');
const orderController = require('../request-handlers/orderController');

const router = express.Router();

// 创建订单
router.post('/', orderController.createOrder);

// 获取订单列表（可选）
router.get('/', orderController.listOrders);

// 获取订单详情
router.get('/:orderId', orderController.getOrderDetail);

// 确认订单
router.post('/:orderId/confirm', orderController.confirmOrder);

// 订单页面数据
router.get('/new/data', orderController.newOrderData);

module.exports = router;