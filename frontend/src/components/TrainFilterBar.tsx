import React, { useState } from 'react'
import '../styles/trains.css'

type Props = {
  options?: { types?: string[]; origins?: string[]; destinations?: string[]; seatTypes?: string[] }
  value?: { types?: string[]; origins?: string[]; destinations?: string[]; seatTypes?: string[] }
  onChange?: (v: { types?: string[]; origins?: string[]; destinations?: string[]; seatTypes?: string[] }) => void
}

const TrainFilterBar: React.FC<Props> = ({ options, value, onChange }) => {
  const types = options?.types || ['GC', 'D']
  const selectedTypes = new Set(value?.types || [])
  const selectedOrigins = new Set(value?.origins || [])
  const selectedDestinations = new Set(value?.destinations || [])
  const selectedSeatTypes = new Set(value?.seatTypes || [])
  const toggleTypes = (key: string) => {
    const next = new Set(selectedTypes)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    onChange?.({ types: Array.from(next) })
  }
  const toggleOrigins = (key: string) => {
    const next = new Set(selectedOrigins)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    onChange?.({ origins: Array.from(next) })
  }
  const toggleDestinations = (key: string) => {
    const next = new Set(selectedDestinations)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    onChange?.({ destinations: Array.from(next) })
  }
  const toggleSeatTypes = (key: string) => {
    const next = new Set(selectedSeatTypes)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    onChange?.({ seatTypes: Array.from(next) })
  }
  const [collapsed, setCollapsed] = useState<{ [k: string]: boolean }>({ types: false, origins: false, destinations: false, seatTypes: false })
  const toggleCollapse = (key: 'types' | 'origins' | 'destinations' | 'seatTypes') => {
    setCollapsed((p) => ({ ...p, [key]: !p[key] }))
  }
  return (
    <div className="trains-filter">
      <div className="filter-group">
        <div className="filter-title">
          <span>车次类型</span>
          <button className="collapse-btn" onClick={() => toggleCollapse('types')}>{collapsed.types ? '展开' : '收起'}</button>
        </div>
        {!collapsed.types && <div className="filter-items">
          {types.includes('GC') && (
            <label className="filter-item"><input type="checkbox" aria-label="GC-高铁/城际" checked={selectedTypes.has('GC')} onChange={() => toggleTypes('GC')} />GC-高铁/城际</label>
          )}
          {types.includes('D') && (
            <label className="filter-item"><input type="checkbox" aria-label="D-动车" checked={selectedTypes.has('D')} onChange={() => toggleTypes('D')} />D-动车</label>
          )}
        </div>}
      </div>
      <div className="filter-group">
        <div className="filter-title">
          <span>出发车站</span>
          <button className="collapse-btn" onClick={() => toggleCollapse('origins')}>{collapsed.origins ? '展开' : '收起'}</button>
        </div>
        {!collapsed.origins && <div className="filter-items">
          {(options?.origins || []).map((o) => (
            <label key={`o-${o}`} className="filter-item"><input type="checkbox" aria-label={`origin-${o}`} checked={selectedOrigins.has(o)} onChange={() => toggleOrigins(o)} />{o}</label>
          ))}
        </div>}
      </div>
      <div className="filter-group">
        <div className="filter-title">
          <span>到达车站</span>
          <button className="collapse-btn" onClick={() => toggleCollapse('destinations')}>{collapsed.destinations ? '展开' : '收起'}</button>
        </div>
        {!collapsed.destinations && <div className="filter-items">
          {(options?.destinations || []).map((d) => (
            <label key={`d-${d}`} className="filter-item"><input type="checkbox" aria-label={`destination-${d}`} checked={selectedDestinations.has(d)} onChange={() => toggleDestinations(d)} />{d}</label>
          ))}
        </div>}
      </div>
      <div className="filter-group">
        <div className="filter-title">
          <span>车次席别</span>
          <button className="collapse-btn" onClick={() => toggleCollapse('seatTypes')}>{collapsed.seatTypes ? '展开' : '收起'}</button>
        </div>
        {!collapsed.seatTypes && <div className="filter-items">
          {(options?.seatTypes || []).map((s) => (
            <label key={`s-${s}`} className="filter-item"><input type="checkbox" aria-label={`seat-${s}`} checked={selectedSeatTypes.has(s)} onChange={() => toggleSeatTypes(s)} />{s}</label>
          ))}
        </div>}
      </div>
    </div>
  )
}

export default TrainFilterBar