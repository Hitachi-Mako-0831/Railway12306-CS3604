const dbService = require('../../../src/domain-providers/dbService')
const bcrypt = require('bcryptjs')

class RegistrationDbService {
  async findUserByUsername(username) {
    const user = await dbService.get('SELECT * FROM users WHERE username = ?', [username])
    return user || null
  }

  async findUserByIdCardNumber(idCardType, idCardNumber) {
    const user = await dbService.get('SELECT * FROM users WHERE id_card_type = ? AND id_card_number = ?', [idCardType, idCardNumber])
    return user || null
  }

  async findUserByPhone(phone) {
    const user = await dbService.get('SELECT * FROM users WHERE phone = ?', [phone])
    return user || null
  }

  async findUserByEmail(email) {
    if (!email) return null
    const user = await dbService.get('SELECT * FROM users WHERE email = ?', [email])
    return user || null
  }

  async createUser(userData) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10)
      const result = await dbService.run(
        `INSERT INTO users (
          username, password, name, email, phone,
          id_card_type, id_card_number, discount_type,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          userData.username,
          hashedPassword,
          userData.name,
          userData.email || null,
          userData.phone,
          userData.idCardType || userData.id_card_type,
          userData.idCardNumber || userData.id_card_number,
          userData.discountType || userData.discount_type,
        ]
      )
      return result.lastID
    } catch (error) {
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        if (error.message.includes('users.username')) throw new Error('该用户名已被注册')
        if (error.message.includes('users.phone')) throw new Error('该手机号已被注册')
        if (error.message.includes('users.email')) throw new Error('该邮箱已被注册')
        if (error.message.includes('users.id_card_number')) throw new Error('该证件号已被注册')
        throw new Error('该账号信息已被注册')
      }
      throw error
    }
  }

  async createEmailVerificationCode(email) {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000)
    await dbService.run(
      `INSERT INTO email_verification_codes (email, code, created_at, expires_at, sent_status, sent_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [email, code, now.toISOString(), expiresAt.toISOString(), 'sent', now.toISOString()]
    )
    return { email, code, created_at: now.toISOString(), expires_at: expiresAt.toISOString(), sent_status: 'sent', sent_at: now.toISOString() }
  }

  async verifyEmailCode(email, code) {
    const record = await dbService.get(
      `SELECT * FROM email_verification_codes WHERE email = ? AND code = ? AND used = 0 ORDER BY created_at DESC LIMIT 1`,
      [email, code]
    )
    if (!record) return false
    const now = new Date()
    const expiresAt = new Date(record.expires_at)
    if (now > expiresAt) return false
    await dbService.run('UPDATE email_verification_codes SET used = 1 WHERE id = ?', [record.id])
    return true
  }

  async createSmsVerificationCode(phone) {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000)
    await dbService.run(
      `INSERT INTO verification_codes (phone, code, created_at, expires_at, sent_status, sent_at) VALUES (?, ?, ?, ?, 'sent', ?)`,
      [phone, code, now.toISOString(), expiresAt.toISOString(), now.toISOString()]
    )
    return code
  }

  async verifySmsCode(phone, code) {
    const validCode = await dbService.get(
      `SELECT * FROM verification_codes WHERE phone = ? AND used = 0 AND datetime(expires_at) > datetime('now') ORDER BY created_at DESC LIMIT 1`,
      [phone]
    )
    if (!validCode) return { success: false, error: '验证码校验失败！' }
    if (validCode.code !== code) return { success: false, error: '很抱歉，您输入的短信验证码有误。' }
    const now = new Date()
    const expiresAt = new Date(validCode.expires_at)
    if (now > expiresAt) return { success: false, error: '很抱歉，您输入的短信验证码有误。' }
    await dbService.run('UPDATE verification_codes SET used = 1 WHERE id = ?', [validCode.id])
    return { success: true }
  }
}

module.exports = new RegistrationDbService()