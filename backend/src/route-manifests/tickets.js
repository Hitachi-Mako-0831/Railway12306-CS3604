const express = require('express')
const ticketService = require('../domain-providers/ticketService')

const router = express.Router()

router.get('/availability', (req, res) => {
  const { trainNo, date, seatType } = req.query
  const r = ticketService.availability({ trainNo, date, seatType })
  res.status(200).json({ success: true, ...r })
})

module.exports = router