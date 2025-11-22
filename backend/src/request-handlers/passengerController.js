const passengerService = require('../domain-providers/passengerService')

class PassengerController {
  async list(req, res) {
    try {
      const userId = Number(req.query.userId || req.body.userId)
      if (!userId) return res.status(400).json({ success: false, message: '缺少用户标识' })
      const rows = await passengerService.list(userId)
      return res.status(200).json({ success: true, passengers: rows })
    } catch {
      return res.status(500).json({ success: false, message: '获取乘客失败' })
    }
  }

  async search(req, res) {
    try {
      const userId = Number(req.query.userId || req.body.userId)
      const q = String(req.query.q || '')
      if (!userId) return res.status(400).json({ success: false, message: '缺少用户标识' })
      const rows = await passengerService.search(userId, q)
      return res.status(200).json({ success: true, passengers: rows })
    } catch {
      return res.status(500).json({ success: false, message: '搜索失败' })
    }
  }

  async add(req, res) {
    try {
      const userId = Number(req.body.userId)
      const result = await passengerService.add(userId, req.body || {})
      if (!result.success) return res.status(400).json(result)
      return res.status(201).json(result)
    } catch {
      return res.status(500).json({ success: false, message: '添加失败' })
    }
  }

  async update(req, res) {
    try {
      const userId = Number(req.body.userId)
      const id = Number(req.params.id)
      const result = await passengerService.update(userId, id, req.body || {})
      if (!result.success) return res.status(403).json(result)
      return res.status(200).json(result)
    } catch {
      return res.status(500).json({ success: false, message: '更新失败' })
    }
  }

  async remove(req, res) {
    try {
      const userId = Number(req.query.userId || req.body.userId)
      const id = Number(req.params.id)
      const result = await passengerService.remove(userId, id)
      if (!result.success) return res.status(403).json(result)
      return res.status(200).json(result)
    } catch {
      return res.status(500).json({ success: false, message: '删除失败' })
    }
  }
}

module.exports = new PassengerController()