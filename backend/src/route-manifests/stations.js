const express = require('express')
const stationService = require('../domain-providers/stationService')

const router = express.Router()

router.get('/', (req, res) => {
  const list = stationService.list()
  res.status(200).json({ success: true, stations: list })
})

router.get('/validate', (req, res) => {
  const { name } = req.query
  const r = stationService.validate(name)
  res.status(200).json({ success: true, valid: r.valid })
})

module.exports = router