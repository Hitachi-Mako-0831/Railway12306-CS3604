import React from 'react'
import '../styles/trains.css'

type Props = {
  data?: any[]
  onBook?: (trainNo: string) => void
}

const headers = ['车次', '出发站', '到达站', '出发时间', '到达时间', '历时', '商务座', '一等座', '二等座', '软卧', '硬卧', '操作']

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
            <td className="cell-seat">{statusSeat(Number(t.businessSeat), Number(t.businessPrice))}</td>
            <td className="cell-seat">{statusSeat(Number(t.firstClassSeat), Number(t.firstClassPrice))}</td>
            <td className="cell-seat">{statusSeat(Number(t.secondClassSeat), Number(t.secondClassPrice))}</td>
            <td className="cell-seat">{statusSeat(Number(t.softSleeperSeat), Number(t.softSleeperPrice))}</td>
            <td className="cell-seat">{statusSeat(Number(t.hardSleeperSeat), Number(t.hardSleeperPrice))}</td>
            <td className="cell-action">
              <button
                className="book-btn"
                onClick={() => onBook?.(String(t.trainNumber))}
                disabled={
                  (Number(t.businessSeat) === 0 && Number(t.firstClassSeat) === 0 && Number(t.secondClassSeat) === 0 && Number(t.softSleeperSeat) === 0 && Number(t.hardSleeperSeat) === 0)
                }
              >预订</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default TrainListTable