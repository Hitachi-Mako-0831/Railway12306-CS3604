import React, { useEffect, useState } from 'react'
import '../styles/trains.css'

type Props = {
  value?: { from?: string; to?: string; date?: string }
  onChange?: (v: { from?: string; to?: string; date?: string }) => void
  onSearch?: () => void
}

const TrainSearchBar: React.FC<Props> = ({ value, onChange, onSearch }) => {
  const [from, setFrom] = useState(value?.from || '')
  const [to, setTo] = useState(value?.to || '')
  const [date, setDate] = useState(value?.date || '')
  const [fromErr, setFromErr] = useState('')
  const [toErr, setToErr] = useState('')

  useEffect(() => {
    if (!date) {
      const today = new Date()
      const yyyy = today.getFullYear()
      const mm = String(today.getMonth() + 1).padStart(2, '0')
      const dd = String(today.getDate()).padStart(2, '0')
      setDate(`${yyyy}-${mm}-${dd}`)
    }
  }, [date])

  const submit = () => {
    setFromErr('')
    setToErr('')
    if (!from) setFromErr('请输入出发地')
    if (!to) setToErr('请输入到达地')
    onChange?.({ from, to, date })
    onSearch?.()
  }

  return (
    <div className="search-bar">
      <div className="search-type">
        <label className="radio"><input type="radio" name="ticketType" defaultChecked aria-label="普通" />普通</label>
        <label className="radio"><input type="radio" name="ticketType" aria-label="学生" />学生</label>
      </div>
      <div className="search-field">
        <span className="search-label">出发地</span>
        <input className="search-input" placeholder="简拼/全拼/汉字" value={from} onChange={(e) => { const v = e.target.value; setFrom(v); if (v) setFromErr('') }} />
        {fromErr && <div className="error-text">{fromErr}</div>}
      </div>
      <div className="search-field">
        <span className="search-label">到达地</span>
        <input className="search-input" placeholder="到达站" value={to} onChange={(e) => { const v = e.target.value; setTo(v); if (v) setToErr('') }} />
        {toErr && <div className="error-text">{toErr}</div>}
      </div>
      <div className="search-field">
        <span className="search-label">出发日期</span>
        <input className="search-input" placeholder="YYYY-MM-DD" value={date} readOnly />
      </div>
      <div className="search-action">
        <button className="search-button" onClick={submit}>查询</button>
      </div>
    </div>
  )
}

export default TrainSearchBar