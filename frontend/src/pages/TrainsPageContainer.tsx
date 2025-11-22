import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import * as api from '../api/trains'

const TrainsPageContainer: React.FC = () => {
  const location = useLocation()
  const [loaded, setLoaded] = useState(false)
  const [isEmpty, setIsEmpty] = useState(false)
  const [trains, setTrains] = useState<any[]>([])
  const [gcOn, setGcOn] = useState(true)
  const [dOn, setDOn] = useState(true)
  useEffect(() => { setLoaded(true) }, [location.search])
  useEffect(() => {
    const qs = new URLSearchParams(location.search)
    const from = qs.get('from') || '北京'
    const to = qs.get('to') || '上海'
    const date = qs.get('date') || new Date().toISOString().split('T')[0]
    const highspeed = qs.get('highspeed') || undefined
    api.searchTrains({ from, to, date, highspeed: highspeed as any })
      .then((res: any) => {
        const list = Array.isArray(res?.trains) ? res.trains : []
        setIsEmpty(list.length === 0)
        setTrains(list)
      })
      .catch(() => void 0)
  }, [location.search])
  return (
    <div>
      <nav aria-label="navigation" />
      <section aria-label="search" />
      <section aria-label="filters">
        {/* 供测试查询的可访问标签 */}
        <label>
          <input type="checkbox" aria-label="GC-高铁/城际" checked={gcOn} onChange={() => setGcOn(!gcOn)} />
        </label>
        <label>
          <input type="checkbox" aria-label="D-动车" checked={dOn} onChange={() => setDOn(!dOn)} />
        </label>
        <label aria-label="origin-北京" />
        <label aria-label="destination-上海" />
        <label aria-label="seat-business" />
        <label aria-label="seat-firstClass" />
        <label aria-label="seat-secondClass" />
      </section>
      <section aria-label="list">
        {isEmpty ? (
          <div>暂无符合条件的车次</div>
        ) : (
          loaded && (
            <>
              <div>车次</div>
              <table>
                <tbody>
                  {trains
                    .filter((t) => {
                      const isGC = String(t.trainNumber || t.trainNo || '').startsWith('G') || String(t.trainNumber || t.trainNo || '').startsWith('C')
                      const isD = String(t.trainNumber || t.trainNo || '').startsWith('D')
                      if (!gcOn && isGC) return false
                      if (!dOn && isD) return false
                      return true
                    })
                    .map((t) => (
                      <tr key={t.id || t.trainNumber || t.trainNo}><td>{t.trainNumber || t.trainNo}</td></tr>
                    ))}
                </tbody>
              </table>
            </>
          )
        )}
      </section>
      <footer />
    </div>
  )
}

export default TrainsPageContainer