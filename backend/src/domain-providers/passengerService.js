const passengerDb = require('./passengerDbService')

class PassengerService {
  async list(userId) {
    return passengerDb.listByUser(userId)
  }

  async search(userId, q) {
    const key = String(q || '').trim()
    if (!key) return passengerDb.listByUser(userId)
    return passengerDb.searchByUser(userId, key)
  }

  async add(userId, data) {
    const name = String(data.name || '').trim()
    if (!userId || !name) return { success: false, error: '缺少必要参数' }
    const created = await passengerDb.create({
      user_id: userId,
      name,
      phone: data.phone,
      id_card_type: data.id_card_type,
      id_card_number: data.id_card_number,
      discount_type: data.discount_type,
    })
    const row = await passengerDb.getByIdOwned(created.id, userId)
    return { success: true, passenger: row }
  }

  async update(userId, id, data) {
    const own = await passengerDb.getByIdOwned(id, userId)
    if (!own) return { success: false, error: '无权限或乘客不存在' }
    await passengerDb.update(id, userId, {
      name: data.name ?? own.name,
      phone: data.phone ?? own.phone,
      id_card_type: data.id_card_type ?? own.id_card_type,
      id_card_number: data.id_card_number ?? own.id_card_number,
      discount_type: data.discount_type ?? own.discount_type,
    })
    const row = await passengerDb.getByIdOwned(id, userId)
    return { success: true, passenger: row }
  }

  async remove(userId, id) {
    const own = await passengerDb.getByIdOwned(id, userId)
    if (!own) return { success: false, error: '无权限或乘客不存在' }
    await passengerDb.remove(id, userId)
    return { success: true }
  }
}

module.exports = new PassengerService()