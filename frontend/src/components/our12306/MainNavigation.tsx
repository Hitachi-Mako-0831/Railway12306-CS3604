import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './MainNavigation.css'

type Props = {
  isLoggedIn: boolean
  onLoginClick: () => void
  onRegisterClick: () => void
  onPersonalCenterClick: () => void
}

const MainNavigation: React.FC<Props> = ({ isLoggedIn: _a, onLoginClick: _b, onRegisterClick: _c, onPersonalCenterClick: _d }) => {
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const isTrainsPage = ['/trains','/orders','/orders/history','/personal-info','/phone-verification','/passengers'].includes(location.pathname)
  return (
    <nav className="main-navigation">
      <div className="nav-container">
        <Link to="/" className={`nav-item ${isHomePage ? 'active' : ''}`}>首页</Link>
        <Link to="/trains" className={`nav-item ${isTrainsPage ? 'active' : ''}`}>车票 <span className="nav-arrow">▼</span></Link>
        <a href="#" className="nav-item">团购服务 <span className="nav-arrow">▼</span></a>
        <a href="#" className="nav-item">会员服务 <span className="nav-arrow">▼</span></a>
        <a href="#" className="nav-item">站车服务 <span className="nav-arrow">▼</span></a>
        <a href="#" className="nav-item">商旅服务 <span className="nav-arrow">▼</span></a>
        <a href="#" className="nav-item">出行指南 <span className="nav-arrow">▼</span></a>
        <a href="#" className="nav-item">信息查询 <span className="nav-arrow">▼</span></a>
      </div>
    </nav>
  )
}

export default MainNavigation