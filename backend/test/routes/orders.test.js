const request = require('supertest')
const app = require('../../src/app')

describe('Orders API', () => {
  test('should create order', async () => {
    const payload = {
      trainNo: 'G103',
      origin: '北京南',
      destination: '上海虹桥',
      date: '2025-12-01',
      seatType: 'secondClass',
      quantity: 2,
      passengerNames: ['张三', '李四']
    }
    const res = await request(app)
      .post('/api/orders')
      .send(payload)
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body).toHaveProperty('orderNumber')
    expect(res.body).toHaveProperty('orderId')
    expect(res.body.status).toBe('pending')
  })
})