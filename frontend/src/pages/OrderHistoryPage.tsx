import React, { useEffect, useState } from 'react'
 
import './OrderHistoryPage.css'

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isLoggedIn = !!localStorage.getItem('authToken')
  const username = isLoggedIn ? (localStorage.getItem('username') || localStorage.getItem('userId') || '用户') : ''

  useEffect(() => {
    const run = async () => {
      setLoading(true); setError('')
      try { const res = await fetch('/api/orders'); const data = await res.json(); setOrders(Array.isArray(data.orders)? data.orders: []) } catch { setError('获取订单列表失败') } finally { setLoading(false) }
    }
    run()
  }, [])

  return (
    <div className="order-history-page">
      <div style={{ padding: 16 }}>
        <h2>我的订单</h2>
        {loading && <div>加载中...</div>}
        {error && <div>{error}</div>}
        {!loading && !error && (
          <table>
            <thead><tr><th>订单号</th><th>车次</th><th>出发</th><th>到达</th><th>日期</th><th>席别</th><th>数量</th><th>总价</th><th>状态</th></tr></thead>
            <tbody>{orders.map((o:any)=>(<tr key={o.id}><td>{o.order_number}</td><td>{o.train_no}</td><td>{o.origin}</td><td>{o.destination}</td><td>{o.departure_date}</td><td>{o.seat_type}</td><td>{o.quantity}</td><td>{o.total_price}</td><td>{o.status}</td></tr>))}</tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default OrderHistoryPage