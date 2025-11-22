const express = require('express')
const passengerController = require('../request-handlers/passengerController')

const router = express.Router()

router.get('/', passengerController.list)
router.get('/search', passengerController.search)
router.post('/', passengerController.add)
router.put('/:id', passengerController.update)
router.delete('/:id', passengerController.remove)

module.exports = router