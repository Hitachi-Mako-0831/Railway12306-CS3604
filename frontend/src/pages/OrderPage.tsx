import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './OrderPage.css'
 
import TrainInfoSection from '../components/our12306/TrainInfoSection'
import PassengerInfoSection from '../components/our12306/PassengerInfoSection'
import OrderSubmitSection from '../components/our12306/OrderSubmitSection'
import WarmTipsSection from '../components/our12306/WarmTipsSection'
 
import OrderConfirmationModal from '../components/our12306/OrderConfirmationModal'
import ConfirmModal from '../components/our12306/ConfirmModal'

const OrderPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation() as any
  const { trainNo, departureStation, arrivalStation, departureDate } = location.state || {}

  const [trainInfo, setTrainInfo] = useState<any>(null)
  const [fareInfo, setFareInfo] = useState<any>(null)
  const [availableSeats, setAvailableSeats] = useState<any>(null)
  const [passengers, setPassengers] = useState<any[]>([])
  const [selectedPassengers, setSelectedPassengers] = useState<string[]>([])
  const [purchaseInfo, setPurchaseInfo] = useState<any[]>([])
  const [defaultSeatType, setDefaultSeatType] = useState<string>('二等座')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorModalMessage, setErrorModalMessage] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('authToken'); setIsLoggedIn(!!token)
    const handler = () => { const t = localStorage.getItem('authToken'); setIsLoggedIn(!!t) }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  useEffect(() => {
    const run = async () => {
      setIsLoading(true); setError('')
      try {
        const resp = await fetch(`/api/orders/new/data?trainNo=${encodeURIComponent(trainNo||'')}&origin=${encodeURIComponent(departureStation||'')}&destination=${encodeURIComponent(arrivalStation||'')}&date=${encodeURIComponent(departureDate||'')}`)
        if (!resp.ok) throw new Error('加载订单页失败')
        const data = await resp.json()
        setTrainInfo({ trainNo, departureStation, arrivalStation, departureDate })
        setFareInfo({ '二等座': { price: data?.data?.unitPrice || 0, available: 50 } })
        setAvailableSeats({ '商务座': 0, '一等座': 0, '二等座': 30, '软卧': 0, '硬卧': 0 })
        setPassengers([])
        setDefaultSeatType('二等座')
        setPurchaseInfo([])
      } catch (e:any) { setError(e.message || '加载订单页失败，请稍后重试') } finally { setIsLoading(false) }
    }
    if (trainNo && departureStation && arrivalStation && departureDate) run(); else setError('缺少必要的车次信息')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainNo, departureStation, arrivalStation, departureDate])

  const handlePassengerSelect = (passengerId: string, selected: boolean) => {
    const passenger = passengers.find((p) => p.id === passengerId); if (!passenger) return
    if (selected) { setSelectedPassengers([...selectedPassengers, passengerId]); setPurchaseInfo([...purchaseInfo, { passenger, ticketType: '成人票', seatType: defaultSeatType }]) }
    else { setSelectedPassengers(selectedPassengers.filter((id) => id !== passengerId)); setPurchaseInfo(purchaseInfo.filter((info) => info.passenger.id !== passengerId)) }
  }
  const handleSeatTypeChange = (index: number, seatType: string) => { const np=[...purchaseInfo]; np[index] = { ...np[index], seatType }; setPurchaseInfo(np) }
  const handleTicketTypeChange = (index: number, ticketType: string) => { const np=[...purchaseInfo]; np[index] = { ...np[index], ticketType }; setPurchaseInfo(np) }
  const handleDeleteRow = (index: number) => { const del=purchaseInfo[index]; setPurchaseInfo(purchaseInfo.filter((_,i)=>i!==index)); setSelectedPassengers(selectedPassengers.filter((id)=> id!==del.passenger.id)) }
  const handleBack = () => { navigate('/trains', { state: { departureStation, arrivalStation, departureDate } }) }

  const handleSubmit = async () => {
    if (selectedPassengers.length === 0) { setErrorModalMessage('请选择乘车人！'); setShowErrorModal(true); return }
    setIsLoading(true); setError('')
    try {
      const token = localStorage.getItem('authToken'); if (!token) { setError('请先登录'); navigate('/login'); return }
      const passengersData = purchaseInfo.map((info) => ({ passengerId: info.passenger?.id || 'p', ticketType: info.ticketType, seatType: info.seatType }))
      const resp = await fetch('/api/orders', { method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ trainNo, origin: departureStation, destination: arrivalStation, date: departureDate, seatType: 'secondClass', quantity: passengersData.length, passengerNames: passengersData.map(()=> '旅客') }) })
      if (!resp.ok) { const err = await resp.json().catch(()=>({})); throw new Error(err.error || '提交订单失败') }
      const data = await resp.json(); setOrderId(String(data.orderId||'')); setShowConfirmModal(true)
    } catch (e:any) { setErrorModalMessage(e.message || '网络忙，请稍后再试。'); setShowErrorModal(true) } finally { setIsLoading(false) }
  }

  const handleConfirmOrder = async () => {}
  const handleNavigateToLogin = () => navigate('/login')
  const handleNavigateToRegister = () => navigate('/register')
  const handleNavigateToPersonalCenter = () => navigate(isLoggedIn ? '/personal-info' : '/login')
  const handleMy12306Click = () => handleNavigateToPersonalCenter()
  const username = isLoggedIn ? (localStorage.getItem('username') || localStorage.getItem('userId') || '用户') : ''

  return (
    <div className="order-page">
      <main className="order-main">
        {isLoading ? (<div className="loading">加载中...</div>) : error ? (<div className="error-message">{error}</div>) : (
          <>
            <TrainInfoSection trainInfo={trainInfo} fareInfo={fareInfo} availableSeats={availableSeats} />
            <PassengerInfoSection passengers={passengers} onPassengerSelect={handlePassengerSelect} onSearchPassenger={() => {}} availableSeatTypes={fareInfo ? Object.keys(fareInfo).filter((k)=> (fareInfo[k].available>0)) : []} defaultSeatType={defaultSeatType} selectedPassengers={selectedPassengers} purchaseInfo={purchaseInfo} onSeatTypeChange={handleSeatTypeChange} onTicketTypeChange={handleTicketTypeChange} onDeleteRow={handleDeleteRow} fareInfo={fareInfo} />
            <OrderSubmitSection onSubmit={handleSubmit} onBack={handleBack} isSubmitting={isLoading} />
            <WarmTipsSection onTermsClick={() => {}} />
          </>
        )}
      </main>
      {showConfirmModal && (
        <OrderConfirmationModal isVisible={showConfirmModal} orderId={orderId} onConfirm={handleConfirmOrder} onBack={() => setShowConfirmModal(false)} onSuccess={() => { navigate('/') }} />
      )}
      {showErrorModal && (
        <ConfirmModal isVisible={showErrorModal} title="提示" message={errorModalMessage} confirmText="确认" cancelText="" onConfirm={() => setShowErrorModal(false)} onCancel={() => setShowErrorModal(false)} />
      )}
    </div>
  )
}

export default OrderPage