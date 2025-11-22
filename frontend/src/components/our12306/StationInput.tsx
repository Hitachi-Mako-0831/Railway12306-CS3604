import React, { useState } from 'react'
import './StationInput.css'
import { getAllStations, searchStations } from '../../services/our12306/stationService'

type Props = { value: string; placeholder: string; type: 'departure'|'arrival'; onChange: (v: string) => void; onSelect: (station: string) => void }

const StationInput: React.FC<Props> = ({ value, placeholder, type: _t, onChange, onSelect }) => {
  const [show, setShow] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFocus = async () => {
    setShow(true); setLoading(true); setError('')
    try { const stations = await getAllStations(); const names = stations.map((s: any)=> s.name || s.stationName || s); setSuggestions(names); setLoading(false) } catch { setError('加载站点列表失败'); setSuggestions([]); setLoading(false) }
  }
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value; onChange(v)
    if (!v.trim()) { setLoading(true); try { const stations = await getAllStations(); const names = stations.map((s:any)=> s.name || s.stationName || s); setSuggestions(names); setLoading(false) } catch { setSuggestions([]); setLoading(false) } return }
    setLoading(true); try { const stations = await searchStations(v); const names = stations.map((s:any)=> s.name || s.stationName || s); setSuggestions(names); setLoading(false) } catch { setSuggestions([]); setLoading(false) }
  }
  const pick = (station: string) => { onSelect(station); setShow(false) }

  return (
    <div className="station-input">
      <input type="text" value={value} placeholder={placeholder} onChange={handleChange} onFocus={handleFocus} onBlur={() => setTimeout(() => setShow(false), 200)} className="station-input-field" />
      {show && (
        <div className="suggestions-dropdown">
          {loading && <div className="suggestion-item loading">加载中...</div>}
          {!loading && suggestions.length===0 && (<div className="suggestion-item empty">暂无匹配站点</div>)}
          {!loading && suggestions.map((s, i) => (<div key={i} className="suggestion-item" onClick={() => pick(s)}>{s}</div>))}
        </div>
      )}
      {error && <div className="input-error">{error}</div>}
    </div>
  )
}

export default StationInput