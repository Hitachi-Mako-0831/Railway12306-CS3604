import React from 'react'
import '../styles/trains.css'

type Props = {
  data?: any[]
  onBook?: (trainNo: string) => void
}

const headers = ['车次', '出发站', '到达站', '出发时间', '到达时间', '历时', '商务座', '一等座', '二等座']

const statusSeat = (count: number, price: number) => {
  if (!Number.isFinite(price) || price <= 0) return <span className="seat-status dash">--</span>
  if (!Number.isFinite(count)) return <span className="seat-status dash">--</span>
  if (count === 0) return <span className="seat-status none">无</span>
  if (count >= 20) return <span className="seat-status available">有</span>
  return <span className="seat-status count">{String(count)}</span>
}

const TrainListTable: React.FC<Props> = ({ data = [], onBook }) => {
  return (
    <table className="train-table">
      <thead>
        <tr>
          {headers.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((t) => (
          <tr key={t.id || t.trainNumber}>
            <td className="cell-train">{t.trainNumber}</td>
            <td className="cell-station">{t.departure}</td>
            <td className="cell-station">{t.arrival}</td>
            <td className="cell-time">{t.departureTime}</td>
            <td className="cell-time">{t.arrivalTime}</td>
            <td className="cell-duration">{t.duration}</td>
            <td className="cell-seat">{statusSeat(t.businessSeat, t.businessPrice)}</td>
            <td className="cell-seat">{statusSeat(t.firstClassSeat, t.firstClassPrice)}</td>
            <td className="cell-seat">{statusSeat(t.secondClassSeat, t.secondClassPrice)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default TrainListTable