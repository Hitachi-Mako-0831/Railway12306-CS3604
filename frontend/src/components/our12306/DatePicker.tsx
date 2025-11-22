import React, { useState, useEffect, useRef } from 'react'
import './DatePicker.css'

type Props = { value: string; onChange: (date: string) => void; minDate: string; maxDate: string; disabled?: boolean }

const DatePicker: React.FC<Props> = ({ value, onChange, minDate, maxDate, disabled=false }) => {
  const [show, setShow] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const ref = useRef<HTMLDivElement>(null)
  const range = () => { const today = new Date(); today.setHours(0,0,0,0); const min = minDate? new Date(minDate): today; min.setHours(0,0,0,0); const max = maxDate? new Date(maxDate): new Date(today); if(!maxDate){ max.setDate(today.getDate()+13) } max.setHours(0,0,0,0); return {min,max} }
  const fmt = (d: Date) => { const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}` }
  useEffect(()=>{ const handler=(e:MouseEvent)=>{ if(ref.current && !ref.current.contains(e.target as Node)) setShow(false) }; if(show) document.addEventListener('mousedown',handler); return ()=>document.removeEventListener('mousedown',handler) },[show])
  const gen = () => { const y=currentMonth.getFullYear(), m=currentMonth.getMonth(); const firstDay=new Date(y,m,1).getDay(); const daysInMonth=new Date(y,m+1,0).getDate(); const prevDays=new Date(y,m,0).getDate(); const out: any[]=[]; const {min,max}=range(); const selected=value? new Date(value):null; const today=new Date(); today.setHours(0,0,0,0); for(let i=firstDay-1;i>=0;i--){ const d=new Date(y,m-1,prevDays-i); const ds=fmt(d); out.push({date:d,dateStr:ds,day:prevDays-i,isCurrentMonth:false,isSelectable:d>=min && d<=max,isSelected:selected? ds===value:false,isToday: ds===fmt(today)}) } for(let day=1;day<=daysInMonth;day++){ const d=new Date(y,m,day); const ds=fmt(d); out.push({date:d,dateStr:ds,day,isCurrentMonth:true,isSelectable:d>=min && d<=max,isSelected:selected? ds===value:false,isToday: ds===fmt(today)}) } const remaining=42-out.length; for(let day=1;day<=remaining;day++){ const d=new Date(y,m+1,day); const ds=fmt(d); out.push({date:d,dateStr:ds,day,isCurrentMonth:false,isSelectable:d>=min && d<=max,isSelected:selected? ds===value:false,isToday: ds===fmt(today)}) } return out }
  const select = (ds: string, ok: boolean) => { if(ok && !disabled){ onChange(ds); setShow(false) } }
  const prev = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()-1))
  const next = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1))
  const today = () => setCurrentMonth(new Date())
  const days = gen()
  const monthYear = `${currentMonth.getFullYear()}年${currentMonth.getMonth()+1}月`
  const fmtDisplay = (s: string) => { if(!s) return ''; const d=new Date(s); const mm=d.getMonth()+1; const dd=d.getDate(); const w=['周日','周一','周二','周三','周四','周五','周六'][d.getDay()]; return `${mm}月${dd}日 ${w}` }
  return (
    <div className="date-picker" ref={ref}>
      <input type="text" value={fmtDisplay(value)} readOnly disabled={disabled} placeholder="请选择日期" onClick={() => !disabled && setShow(!show)} className={`date-input ${disabled ? 'disabled' : ''}`} />
      <svg className="calendar-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="3" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.5"/><line x1="2" y1="6" x2="14" y2="6" stroke="currentColor" strokeWidth="1.5"/><line x1="5" y1="1" x2="5" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="11" y1="1" x2="11" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
      {show && !disabled && (
        <div className="calendar-dropdown">
          <div className="calendar-header">
            <button className="calendar-nav-btn" onClick={prev} type="button">‹</button>
            <div className="calendar-month-year">{monthYear}</div>
            <button className="calendar-nav-btn" onClick={next} type="button">›</button>
          </div>
          <div className="calendar-weekdays">{['日','一','二','三','四','五','六'].map((d,i)=>(<div key={i} className="calendar-weekday">{d}</div>))}</div>
          <div className="calendar-days">{days.map((info,i)=>(<div key={i} className={`calendar-day ${!info.isCurrentMonth?'other-month':''} ${info.isSelected?'selected':''} ${info.isToday?'today':''} ${info.isSelectable?'selectable':'disabled'}`} onClick={()=>select(info.dateStr, info.isSelectable)}>{info.day}</div>))}</div>
          <div className="calendar-footer"><button className="calendar-today-btn" onClick={today} type="button">今天</button></div>
        </div>
      )}
    </div>
  )
}

export default DatePicker