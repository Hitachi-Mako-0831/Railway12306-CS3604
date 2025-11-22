const db = require('./dbService')

class PassengerDbService {
  async listByUser(userId) {
    return db.all('SELECT * FROM passengers WHERE user_id = ? ORDER BY created_at DESC', [userId])
  }

  async searchByUser(userId, q) {
    const like = `%${q}%`
    return db.all(
      'SELECT * FROM passengers WHERE user_id = ? AND (name LIKE ? OR phone LIKE ? OR id_card_number LIKE ?) ORDER BY created_at DESC',
      [userId, like, like, like]
    )
  }

  async getByIdOwned(id, userId) {
    return db.get('SELECT * FROM passengers WHERE id = ? AND user_id = ?', [id, userId])
  }

  async create(payload) {
    const { user_id, name, phone, id_card_type, id_card_number, discount_type } = payload
    const res = await db.run(
      'INSERT INTO passengers (user_id, name, phone, id_card_type, id_card_number, discount_type) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, name, phone || null, id_card_type || null, id_card_number || null, discount_type || null]
    )
    return { id: res.lastID }
  }

  async update(id, userId, payload) {
    const { name, phone, id_card_type, id_card_number, discount_type } = payload
    const res = await db.run(
      'UPDATE passengers SET name = ?, phone = ?, id_card_type = ?, id_card_number = ?, discount_type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [name, phone || null, id_card_type || null, id_card_number || null, discount_type || null, id, userId]
    )
    return { changes: res.changes }
  }

  async remove(id, userId) {
    const res = await db.run('DELETE FROM passengers WHERE id = ? AND user_id = ?', [id, userId])
    return { changes: res.changes }
  }
}

module.exports = new PassengerDbService()