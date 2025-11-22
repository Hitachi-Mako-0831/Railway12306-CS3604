import { Routes, Route, useLocation } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import TrainListPage from './pages/TrainListPage'
import OrderPage from './pages/OrderPage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import PassengerManagementPage from './pages/PassengerManagementPage'
import TopNavigation from './components/TopNavigation'
import MainNavigation from './components/MainNavigation'
import BottomNavigation from './components/BottomNavigation'
import './App.css'

function App() {
  const location = useLocation()
  const isLogin = location.pathname === '/login'
  const isTrains = location.pathname === '/trains'
  return (
    <div className="App">
      <TopNavigation showWelcomeLogin={isLogin || isTrains} />
      <MainNavigation />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/trains" element={<TrainListPage />} />
        <Route path="/orders" element={<OrderPage />} />
        <Route path="/orders/history" element={<OrderHistoryPage />} />
        <Route path="/passengers" element={<PassengerManagementPage />} />
      </Routes>
      <BottomNavigation />
    </div>
  )
}

export default App
