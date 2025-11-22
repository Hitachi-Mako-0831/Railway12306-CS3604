import React from 'react'
import './MainNavigation.css'

const MainNavigation: React.FC = () => {
  return (
    <nav className="main-navigation">
      <div className="nav-container">
        {/* 变更说明：为保持来源项目视觉与类名，附加 nav-hd/item 类并添加下拉三角图标 */}
        <a href="/" className="nav-item nav-hd">首页</a>
        <a href="/trains" className="nav-item nav-hd item">车票 <i className="hdr-icon hdr-down"></i></a>
        <a href="/group-service" className="nav-item nav-hd item">团购服务 <i className="hdr-icon hdr-down"></i></a>
        <a href="/member-service" className="nav-item nav-hd item">会员服务 <i className="hdr-icon hdr-down"></i></a>
        <a href="/station-service" className="nav-item nav-hd item">站车服务 <i className="hdr-icon hdr-down"></i></a>
        <a href="/business-service" className="nav-item nav-hd item">商旅服务 <i className="hdr-icon hdr-down"></i></a>
        <a href="/travel-guide" className="nav-item nav-hd item">出行指南 <i className="hdr-icon hdr-down"></i></a>
        <a href="/info-query" className="nav-item nav-hd item">信息查询 <i className="hdr-icon hdr-down"></i></a>
      </div>
    </nav>
  )
}

export default MainNavigation

