module.exports = {
  common: {
    serverError: '服务器错误',
  },
  session: {
    invalid: '会话无效或已过期',
  },
  login: {
    missingIdentifier: '用户名/邮箱/手机号不能为空',
    missingPassword: '密码不能为空',
    passwordTooShort: '密码长度不能少于6位',
    pendingVerification: '请进行短信验证',
    success: '登录成功',
  },
  sms: {
    codeSent: '验证码已发送',
    tooFrequent: '请求验证码过于频繁，请稍后再试！',
    invalidCode: '很抱歉，您输入的短信验证码有误。',
  },
  register: {
    fillAll: '请填写完整信息！',
    passwordMismatch: '确认密码与密码不一致！',
    termsRequired: '请确认服务条款！',
  },
}
