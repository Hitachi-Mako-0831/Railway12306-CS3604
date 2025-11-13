const { validationResult } = require('express-validator');
const authService = require('../services/authService');
const messages = require('../constants/messages');

class AuthController {
  /**
   * 账号口令登录入口（语义重写：凭据受理）
   * 内部采用策略选择与早退控制，外部契约保持一致
   */
  async login(req, res) {
    try {
      const { identifier, password } = req.body;

      const missing = [];
      if (!identifier || identifier.trim() === '') missing.push(messages.login.missingIdentifier);
      if (!password || password.trim() === '') missing.push(messages.login.missingPassword);
      if (missing.length) {
        return res.status(400).json({ success: false, errors: missing });
      }

      if (password.length < 6) {
        return res.status(400).json({ success: false, error: messages.login.passwordTooShort });
      }

      const result = await authService.validateCredentials(identifier, password);
      if (!result.success) {
        return res.status(401).json({ success: false, error: result.error });
      }

      const sessionId = await authService.createLoginSession(result.user);
      const token = authService.generateToken({ userId: result.user.id, username: result.user.username, step: 'pending_verification' });

      return res.status(200).json({ success: true, sessionId, token, message: messages.login.pendingVerification });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * 登录短信验证码下发（语义重写：校验关键信息并触发一次性码）
   * 分支采用守卫式早退，避免深层嵌套
   */
  async sendVerificationCode(req, res) {
    try {
      const { phoneNumber, sessionId, idCardLast4 } = req.body;

      if (sessionId && idCardLast4) {
        if (!idCardLast4 || idCardLast4.length !== 4) {
          return res.status(400).json({ success: false, error: '证件号后4位格式不正确' });
        }

        const result = await authService.generateAndSendSmsCode(sessionId, idCardLast4);
        if (result.code === 429) {
          return res.status(429).json({ success: false, error: result.error });
        }
        if (!result.success) {
          return res.status(400).json({ success: false, error: result.error });
        }
        return res.status(200).json({ success: true, message: result.message, verificationCode: result.verificationCode, phone: result.phone });
      }

      if (phoneNumber) {
        if (!authService.validatePhone(phoneNumber)) {
          return res.status(400).json({ success: false, errors: ['请输入有效的手机号'] });
        }

        const registrationDbService = require('../services/registrationDbService');
        const sessionService = require('../services/sessionService');
        const canSend = await sessionService.checkSmsSendFrequency(phoneNumber);
        if (!canSend) {
          return res.status(429).json({ success: false, error: messages.sms.tooFrequent });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await registrationDbService.createSmsVerificationCode(phoneNumber, code);
        console.log(`[SMS] 发送验证码 ${code} 到 ${phoneNumber}`);
        return res.status(200).json({ success: true, message: messages.sms.codeSent });
      }

      return res.status(400).json({ success: false, message: '会话ID不能为空' });
    } catch (error) {
      console.error('Send verification code error:', error);
      return res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * 短信验证码核验并登录（语义重写：双通道校验）
   * 支持会话通道与手机号通道，分支早退保证等价逻辑
   */
  async verifyLogin(req, res) {
    try {
      const { sessionId, verificationCode, phoneNumber } = req.body;

      if (!verificationCode || !/^\d{6}$/.test(verificationCode)) {
        const msg = !verificationCode ? '验证码不能为空' : '验证码必须为6位数字';
        return res.status(400).json({ success: false, errors: [msg] });
      }

      if (sessionId) {
        const result = await authService.verifySmsCode(sessionId, verificationCode);
        if (!result.success) {
          const statusCode = result.error.includes('会话') ? 400 : 401;
          return res.status(statusCode).json({ success: false, error: result.error });
        }
        return res.status(200).json({ success: true, sessionId: result.sessionId, token: result.token, user: result.user, message: messages.login.success });
      }

      if (phoneNumber) {
        const registrationDbService = require('../services/registrationDbService');
        const dbService = require('../services/dbService');
        const verifyResult = await registrationDbService.verifySmsCode(phoneNumber, verificationCode);
        if (!verifyResult.success) {
          return res.status(401).json({ success: false, error: verifyResult.error });
        }

        const user = await dbService.get('SELECT * FROM users WHERE phone = ?', [phoneNumber]);
        if (!user) {
          return res.status(401).json({ success: false, error: '用户不存在' });
        }

        const newSessionId = authService.generateSessionId(user.id);
        const token = authService.generateToken({ userId: user.id, username: user.username, step: 'verified' });
        await dbService.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

        return res.status(200).json({ success: true, sessionId: newSessionId, token, user: { id: user.id, username: user.username, email: user.email, phone: user.phone }, message: messages.login.success });
      }

      return res.status(400).json({ success: false, message: '会话ID或手机号不能为空' });
    } catch (error) {
      console.error('Verify login error:', error);
      return res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  // 获取首页内容
  async getHomePage(req, res) {
    try {
      res.status(200).json({
        success: true,
        content: {
          title: '欢迎使用中国铁路12306',
          features: [
            { id: 1, name: '车票预订', icon: 'train', description: '便捷的车票预订服务' },
            { id: 2, name: '行程管理', icon: 'calendar', description: '个人行程提醒和管理' },
            { id: 3, name: '积分兑换', icon: 'gift', description: '积分兑换车票和礼品' },
            { id: 4, name: '餐饮特产', icon: 'food', description: '列车餐饮和特产预订' }
          ],
          announcements: []
        }
      });
    } catch (error) {
      console.error('Get homepage error:', error);
      res.status(500).json({ 
        success: false, 
        message: '服务器内部错误' 
      });
    }
  }

  // 忘记密码页面
  async getForgotPassword(req, res) {
    try {
      res.status(200).json({
        success: true,
        content: {
          title: '忘记密码',
          instructions: [
            '请输入您注册时使用的手机号或邮箱',
            '我们将发送验证码到您的手机或邮箱',
            '验证成功后可以重置密码'
          ],
          contactInfo: {
            phone: '12306',
            email: 'service@12306.cn'
          }
        }
      });
    } catch (error) {
      console.error('Get forgot password error:', error);
      res.status(500).json({ 
        success: false, 
        message: '服务器内部错误' 
      });
    }
  }
}

module.exports = new AuthController();
