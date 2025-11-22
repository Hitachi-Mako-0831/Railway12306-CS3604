const express = require('express');
const trainController = require('../request-handlers/trainController');

const router = express.Router();

// 车票查询
router.get('/search', trainController.searchTrains);

// 获取车次详情
router.get('/:trainNo/detail', trainController.getTrainDetail);

// 获取可售日期
router.get('/available-dates', trainController.getAvailableDates);

module.exports = router;