const path = require('path');
const fs = require('fs');
const dataset = require('../services/trainDatasetService');

function loadTraeFallback() {
  const dataPath = path.resolve(process.cwd(), '.trae', 'documents', '2-车票查询与筛选', '车次信息.json');
  try {
    const raw = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function toResultItem(t) {
  const route = t.route || {};
  const fares = t.fares || {};
  const durationMin = route.planned_duration_min;
  const duration = typeof durationMin === 'number' ? `${Math.floor(durationMin / 60)}小时${durationMin % 60}分` : '';
  const businessSeat = 18;
  const firstClassSeat = 80;
  const secondClassSeat = 200;
  const softSleeperSeat = 40;
  const hardSleeperSeat = 60;
  return {
    id: t.train_no,
    trainNumber: t.train_no,
    departure: route.origin,
    arrival: route.destination,
    departureTime: route.departure_time,
    arrivalTime: route.arrival_time,
    duration,
    businessSeat,
    firstClassSeat,
    secondClassSeat,
    businessPrice: fares.business || 0,
    firstClassPrice: fares.first_class || 0,
    secondClassPrice: fares.second_class || 0,
    softSleeperSeat,
    hardSleeperSeat,
    softSleeperPrice: fares.soft_sleeper || 0,
    hardSleeperPrice: fares.hard_sleeper || 0,
  };
}

class TrainController {
  async searchTrains(req, res) {
    try {
      const { from, to, date, highspeed } = req.query;
      if (!from || !to || !date) {
        return res.status(400).json({ success: false, message: '缺少必要参数：from、to、date' });
      }
      let list = [];
      try {
        const ds = await dataset.search({ from, to, highspeed });
        if (Array.isArray(ds) && ds.length) {
          list = ds.map(toResultItem);
        }
      } catch (_) {}
      if (!list.length) {
        const data = loadTraeFallback();
        list = data.filter((t) => {
          const origin = t.route?.origin;
          const destination = t.route?.destination;
          const matchBasic = origin === from && destination === to;
          if (!matchBasic) return false;
          if (highspeed === '1') {
            return t.train_type && (t.train_type.includes('高速') || t.train_no.startsWith('G'));
          }
          return true;
        }).map(toResultItem);
      }
      return res.status(200).json({ success: true, trains: list });
    } catch (error) {
      return res.status(500).json({ success: false, message: '查询失败' });
    }
  }

  async getTrainDetail(req, res) {
    try {
      const { trainNo } = req.params;
      const data = loadTraeFallback();
      const item = data.find((t) => t.train_no === trainNo);
      if (!item) {
        return res.status(404).json({ success: false, message: '车次不存在' });
      }
      return res.status(200).json({ success: true, train: item });
    } catch (error) {
      return res.status(500).json({ success: false, message: '获取详情失败' });
    }
  }
}

module.exports = new TrainController();