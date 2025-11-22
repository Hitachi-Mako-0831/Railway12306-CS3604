import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './TrainListTopBar.css'

type Props = {
  isLoggedIn: boolean
  username?: string
  onLogout?: () => void
  onMy12306Click?: () => void
}

const TrainListTopBar: React.FC<Props> = ({ isLoggedIn, username, onLogout, onMy12306Click }) => {
  const navigate = useNavigate()
  const [searchText, setSearchText] = React.useState('')

  const handleLogoClick = () => navigate('/')
  const handleSearch = () => { if (searchText.trim()) console.log('搜索:', searchText) }
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') handleSearch() }
  const handleLogout = () => {
    if (onLogout) onLogout()
    else { localStorage.removeItem('authToken'); localStorage.removeItem('username'); navigate('/login') }
  }
  const handleMyClick = (e: React.MouseEvent<HTMLAnchorElement>) => { e.preventDefault(); onMy12306Click?.() }

  return (
    <div className="train-list-top-bar">
      <div className="train-list-top-container">
        <div className="train-list-logo-section" onClick={handleLogoClick}>
          <img src="/images/logo.png" alt="中国铁路12306" className="train-list-logo-image" />
          <div className="train-list-logo-text">
            <div className="train-list-logo-chinese">中国铁路12306</div>
            <div className="train-list-logo-english">12306 CHINA RAILWAY</div>
          </div>
        </div>
        <div className="train-list-search-box">
          <input type="text" className="train-list-search-input" placeholder="搜索车票、餐饮、常旅客、相关规章" value={searchText} onChange={(e) => setSearchText(e.target.value)} onKeyPress={handleSearchKeyPress} />
          <button className="train-list-search-button" onClick={handleSearch}>
            <img src="/images/search.svg" alt="搜索" className="search-icon" />
          </button>
        </div>
        <div className="train-list-top-links">
          <a href="#" className="train-list-top-link">无障碍</a>
          <a href="#" className="train-list-top-link">敬老版</a>
          <a href="#" className="train-list-top-link">English</a>
          <a href="#" className="train-list-top-link" onClick={handleMyClick}>我的12306</a>
          {!isLoggedIn ? (
            <>
              <span className="train-list-welcome-text">您好，请<Link to="/login" className="train-list-auth-link">登录</Link></span>
              <Link to="/register" className="train-list-auth-link">注册</Link>
            </>
          ) : (
            <>
              <span className="train-list-welcome-text">您好，</span>
              <span className="train-list-username">{username}</span>
              <span className="train-list-divider">|</span>
              <button className="train-list-logout-button" onClick={handleLogout}>退出</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TrainListTopBar