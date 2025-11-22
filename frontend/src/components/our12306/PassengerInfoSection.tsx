import React from 'react'

type Props = {
  passengers: any[]
  onPassengerSelect: (id: string, selected: boolean) => void
  onSearchPassenger: (kw: string) => void
  availableSeatTypes: string[]
  defaultSeatType: string
  selectedPassengers: string[]
  purchaseInfo: any[]
  onSeatTypeChange: (index: number, seatType: string) => void
  onTicketTypeChange: (index: number, ticketType: string) => void
  onDeleteRow: (index: number) => void
  fareInfo: any
}

const PassengerInfoSection: React.FC<Props> = ({ passengers, onPassengerSelect, availableSeatTypes, defaultSeatType, selectedPassengers, purchaseInfo, onSeatTypeChange, onTicketTypeChange, onDeleteRow }) => {
  return (
    <section style={{ padding: 16 }}>
      <h3>乘车人</h3>
      <div>
        {passengers.length === 0 && <div>暂无乘客</div>}
        {passengers.map((p) => (
          <label key={p.id} style={{ display: 'block' }}>
            <input type="checkbox" checked={selectedPassengers.includes(p.id)} onChange={(e) => onPassengerSelect(p.id, e.target.checked)} /> {p.name}
          </label>
        ))}
      </div>
      <h4>购票信息</h4>
      <table>
        <thead><tr><th>乘客</th><th>票种</th><th>席别</th><th>操作</th></tr></thead>
        <tbody>
          {purchaseInfo.map((info, idx) => (
            <tr key={idx}>
              <td>{info.passenger?.name || '-'}</td>
              <td>
                <select value={info.ticketType} onChange={(e) => onTicketTypeChange(idx, e.target.value)}>
                  <option value="成人票">成人票</option>
                  <option value="学生票">学生票</option>
                </select>
              </td>
              <td>
                <select value={info.seatType || defaultSeatType} onChange={(e) => onSeatTypeChange(idx, e.target.value)}>
                  {availableSeatTypes.length ? availableSeatTypes.map((t) => (<option key={t} value={t}>{t}</option>)) : <option value={defaultSeatType}>{defaultSeatType}</option>}
                </select>
              </td>
              <td><button onClick={() => onDeleteRow(idx)}>删除</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default PassengerInfoSection