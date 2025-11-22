const crypto = require('crypto');
const db = require('../domain-providers/dbService');
const path = require('path');
const fs = require('fs');

function loadTrainData() {
  const dataPath = path.resolve(process.cwd(), '.trae', 'documents', '2-车票查询与筛选', '车次信息.json');
  try {
    const raw = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function priceFor(trainNo, seatType) {
  const data = loadTrainData();
  const t = data.find((x) => x.train_no === trainNo);
  if (!t) return 0;
  const fares = t.fares || {};
  switch (seatType) {
    case 'business': return fares.business || 0;
    case 'firstClass': return fares.first_class || 0;
    case 'secondClass': return fares.second_class || 0;
    case 'softSleeper': return fares.soft_sleeper || 0;
    case 'hardSleeper': return fares.hard_sleeper || 0;
    default: return 0;
  }
}

class OrderController {
  async createOrder(req, res) {
    try {
      const { trainNo, origin, destination, date, seatType, quantity, passengerNames } = req.body;
      if (!trainNo || !origin || !destination || !date || !seatType || !quantity) {
        return res.status(400).json({ success: false, message: '缺少必要参数' });
      }
      const qty = Number(quantity);
      if (!Number.isFinite(qty) || qty < 1 || qty > 5) {
        return res.status(400).json({ success: false, message: '票数必须在1-5之间' });
      }
      const unitPrice = priceFor(trainNo, seatType);
      const totalPrice = unitPrice * qty;
      const orderNumber = crypto.randomBytes(6).toString('hex').toUpperCase();

      await db.run(
        `CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_number TEXT UNIQUE,
          train_no TEXT,
          origin TEXT,
          destination TEXT,
          departure_date TEXT,
          seat_type TEXT,
          quantity INTEGER,
          total_price REAL,
          status TEXT DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
      );

      await db.run(
        `CREATE TABLE IF NOT EXISTS order_passengers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER,
          name TEXT,
          seat_type TEXT,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        )`
      );

      const result = await db.run(
        `INSERT INTO orders (order_number, train_no, origin, destination, departure_date, seat_type, quantity, total_price)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderNumber, trainNo, origin, destination, date, seatType, qty, totalPrice]
      );

      const orderId = result.lastID;
      const names = Array.isArray(passengerNames) ? passengerNames.slice(0, qty) : [];
      for (const name of names) {
        await db.run(
          `INSERT INTO order_passengers (order_id, name, seat_type) VALUES (?, ?, ?)`,
          [orderId, name, seatType]
        );
      }

      return res.status(201).json({ success: true, orderId, orderNumber, status: 'pending', totalPrice });
    } catch (error) {
      return res.status(500).json({ success: false, message: '创建订单失败' });
    }
  }

  async listOrders(req, res) {
    try {
      const rows = await db.all(`SELECT * FROM orders ORDER BY created_at DESC`);
      return res.status(200).json({ success: true, orders: rows });
    } catch (error) {
      return res.status(500).json({ success: false, message: '获取订单列表失败' });
    }
  }

  async getOrderDetail(req, res) {
    try {
      const { orderId } = req.params;
      const order = await db.get(`SELECT * FROM orders WHERE id = ?`, [orderId]);
      if (!order) return res.status(404).json({ success: false, message: '订单不存在' });
      const passengers = await db.all(`SELECT * FROM order_passengers WHERE order_id = ?`, [orderId]);
      return res.status(200).json({ success: true, order: { ...order, passengers } });
    } catch (error) {
      return res.status(500).json({ success: false, message: '获取订单详情失败' });
    }
  }

  async confirmOrder(req, res) {
    try {
      const { orderId } = req.params
      const found = await db.get('SELECT * FROM orders WHERE id = ?', [orderId])
      if (!found) return res.status(404).json({ success: false, message: '订单不存在' })
      await db.run('UPDATE orders SET status = ? WHERE id = ?', ['confirmed', orderId])
      const passengers = await db.all('SELECT * FROM order_passengers WHERE order_id = ?', [orderId])
      return res.status(200).json({ success: true, order: { ...found, status: 'confirmed', passengers } })
    } catch (error) {
      return res.status(500).json({ success: false, message: '确认订单失败' })
    }
  }

  async newOrderData(req, res) {
    try {
      const { trainNo, origin, destination, date } = req.query
      if (!trainNo || !origin || !destination || !date) {
        return res.status(400).json({ success: false, message: '缺少必要参数' })
      }
      const unitPrice = priceFor(String(trainNo), 'secondClass')
      return res.status(200).json({ success: true, data: { trainNo, origin, destination, date, unitPrice } })
    } catch (error) {
      return res.status(500).json({ success: false, message: '获取订单数据失败' })
    }
  }
}

module.exports = new OrderController();