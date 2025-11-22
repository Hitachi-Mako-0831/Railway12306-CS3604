import React from 'react'

type Props = { trainInfo: any; fareInfo: any; availableSeats: any }

const TrainInfoSection: React.FC<Props> = ({ trainInfo, fareInfo, availableSeats }) => {
  if (!trainInfo) return null
  return (
    <section style={{ padding: 16 }}>
      <h3>车次信息</h3>
      <div>车次：{trainInfo.trainNo}</div>
      <div>出发：{trainInfo.departureStation} {trainInfo.departureDate}</div>
      <div>到达：{trainInfo.arrivalStation}</div>
      <h4>席位与票价</h4>
      <pre>{JSON.stringify(fareInfo || {}, null, 2)}</pre>
      <h4>余票</h4>
      <pre>{JSON.stringify(availableSeats || {}, null, 2)}</pre>
    </section>
  )
}

export default TrainInfoSection