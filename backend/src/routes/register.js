/**
 * 注册相关路由
 * 源文件：backend/src/routes/register.js
 * 测试文件：backend/test/routes/register.test.js
 */

const express = require('express');
const router = express.Router();
const registerController = require('../controllers/registerController');

const routes = [
  { method: 'post', path: '/validate-username', handler: registerController.validateUsername },
  { method: 'post', path: '/validate-password', handler: registerController.validatePassword },
  { method: 'post', path: '/validate-name', handler: registerController.validateName },
  { method: 'post', path: '/validate-idcard', handler: registerController.validateIdCard },
  { method: 'post', path: '/validate-email', handler: registerController.validateEmail },
  { method: 'post', path: '/validate-phone', handler: registerController.validatePhone },
  { method: 'post', path: '/', handler: registerController.register },
  { method: 'post', path: '/send-verification-code', handler: registerController.sendRegistrationVerificationCode },
  { method: 'post', path: '/complete', handler: registerController.completeRegistration },
  { method: 'get', path: '/service-terms', handler: registerController.getServiceTerms },
  { method: 'get', path: '/privacy-policy', handler: registerController.getPrivacyPolicy },
];

routes.forEach(({ method, path, handler }) => {
  router[method](path, handler);
});

module.exports = router;
