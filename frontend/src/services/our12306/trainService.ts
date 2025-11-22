export async function searchTrains(departureStation: string, arrivalStation: string, departureDate: string, trainTypes?: string[]) {
  try {
    const highspeed = trainTypes && trainTypes.length ? '1' : undefined
    const params = new URLSearchParams()
    params.set('from', departureStation)
    params.set('to', arrivalStation)
    params.set('date', departureDate)
    if (highspeed === '1') params.set('highspeed', '1')
    const res = await fetch(`/api/trains/search?${params.toString()}`)
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message || '查询失败') }
    const data = await res.json()
    const trains = (data.trains || []).map((t: any) => {
      const durStr = String(t.duration || '')
      const match = durStr.match(/(\d+)小时(\d+)分/)
      const durationMin = match ? (Number(match[1]) * 60 + Number(match[2])) : 0
      return {
        trainNo: String(t.trainNumber || t.trainNo || ''),
        departureStation: String(t.departure || ''),
        arrivalStation: String(t.arrival || ''),
        departureTime: String(t.departureTime || ''),
        arrivalTime: String(t.arrivalTime || ''),
        departureDate: departureDate,
        duration: durationMin,
        availableSeats: {
          '商务座': Number(t.businessSeat ?? 0),
          '一等座': Number(t.firstClassSeat ?? 0),
          '二等座': Number(t.secondClassSeat ?? 0),
          '软卧': Number(t.softSleeperSeat ?? 0),
          '硬卧': Number(t.hardSleeperSeat ?? 0),
        },
      }
    })
    return { success: true, trains, timestamp: Date.now() }
  } catch (e: any) {
    return { success: false, error: e.message || '查询失败，请稍后重试', trains: [] }
  }
}

export async function getAvailableDates() {
  try {
    const res = await fetch('/api/trains/available-dates')
    const data = await res.json()
    return { success: true, availableDates: data.dates || [], currentDate: new Date().toISOString().split('T')[0] }
  } catch (e: any) {
    return { success: false, error: e.message || '获取可选日期失败', availableDates: [], currentDate: new Date().toISOString().split('T')[0] }
  }
}