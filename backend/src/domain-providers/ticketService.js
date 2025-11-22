class TicketService {
  availability({ trainNo, date, seatType }) {
    const base = String(trainNo || '').length + String(date || '').length + String(seatType || '').length
    const seed = (base % 17) + 3
    const count = (seed * 7) % 50
    return { available: count, seatType: String(seatType || '') || 'secondClass' }
  }
}

module.exports = new TicketService()