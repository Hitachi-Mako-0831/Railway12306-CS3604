const express = require('express');
const trainController = require('../controllers/trainController');

const router = express.Router();

// 车票查询
router.get('/search', trainController.searchTrains);

// 获取车次详情
router.get('/:trainNo/detail', trainController.getTrainDetail);

module.exports = router;