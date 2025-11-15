import client from './client'

export async function createOrder(payload: {
  trainNo: string
  origin: string
  destination: string
  date: string
  seatType: 'business' | 'firstClass' | 'secondClass'
  quantity: number
  passengerNames?: string[]
}) {
  const res = await client.post('/api/orders', payload)
  return res.data
}

export async function listOrders() {
  const res = await client.get('/api/orders')
  return res.data
}

export async function getOrderDetail(orderId: number) {
  const res = await client.get(`/api/orders/${orderId}`)
  return res.data
}