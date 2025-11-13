const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// API-POST-Login: 用户登录接口
router.post('/login', authController.login);

// API-POST-SendVerificationCode: 发送短信验证码接口
router.post('/send-verification-code', authController.sendVerificationCode);

// API-POST-VerifyLogin: 短信验证登录接口
router.post('/verify-login', authController.verifyLogin);

// API-GET-HomePage: 获取首页内容接口
router.get('/homepage', authController.getHomePage);

// API-GET-ForgotPassword: 忘记密码页面接口
router.get('/forgot-password', authController.getForgotPassword);

module.exports = router;
