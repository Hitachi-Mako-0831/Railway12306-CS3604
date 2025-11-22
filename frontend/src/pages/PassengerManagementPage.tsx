import React, { useEffect, useState } from 'react'
import TrainListTopBar from '../components/our12306/TrainListTopBar'
import MainNavigation from '../components/our12306/MainNavigation'
import BottomNavigation from '../components/our12306/BottomNavigation'
import ConfirmModal from '../components/our12306/ConfirmModal'
import SuccessModal from '../components/our12306/ConfirmModal'

const PassengerManagementPage: React.FC = () => {
  const [passengers, setPassengers] = useState<any[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingId, setPendingId] = useState<number | null>(null)
  const isLoggedIn = !!localStorage.getItem('authToken')
  const username = isLoggedIn ? (localStorage.getItem('username') || localStorage.getItem('userId') || '用户') : ''

  const refresh = async () => {
    setLoading(true); setError('')
    try { const res = await fetch('/api/passengers?userId=1'); const data = await res.json(); setPassengers(Array.isArray(data.passengers)? data.passengers: []) } catch { setError('获取乘客列表失败') } finally { setLoading(false) }
  }

  useEffect(() => { refresh() }, [])

  const filtered = passengers.filter((p)=> !q || String(p.name||'').includes(q) || String(p.phone||'').includes(q) || String(p.id_card_number||'').includes(q))

  return (
    <div className="passenger-management-page">
      <TrainListTopBar isLoggedIn={isLoggedIn} username={username} />
      <MainNavigation isLoggedIn={isLoggedIn} onLoginClick={() => {}} onRegisterClick={() => {}} onPersonalCenterClick={() => {}} />
      <div style={{ padding: 16 }}>
        <h2>乘客管理</h2>
        <input placeholder="搜索" value={q} onChange={(e)=>setQ(e.target.value)} />
        <button onClick={refresh}>刷新</button>
        {loading && <div>加载中...</div>}
        {error && <div>{error}</div>}
        {!loading && !error && (
          <table>
            <thead><tr><th>姓名</th><th>手机号</th><th>证件类型</th><th>证件号</th><th>优惠类型</th><th>操作</th></tr></thead>
            <tbody>
              {filtered.map((p:any)=>(
                <tr key={p.id}>
                  <td>{p.name}</td><td>{p.phone}</td><td>{p.id_card_type}</td><td>{p.id_card_number}</td><td>{p.discount_type}</td>
                  <td><button onClick={()=>{ setPendingId(p.id); setShowConfirm(true) }}>删除</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <BottomNavigation />
      {showConfirm && (
        <ConfirmModal isVisible={showConfirm} title="删除确认" message="确定要删除该乘客吗？" confirmText="确定" cancelText="取消" onConfirm={async()=>{ setShowConfirm(false); if(pendingId!=null){ await fetch(`/api/passengers/${pendingId}?userId=1`, { method:'DELETE' }); await refresh() } }} onCancel={()=> setShowConfirm(false)} />
      )}
    </div>
  )
}

export default PassengerManagementPage