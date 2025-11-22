const express = require('express')
const router = express.Router()
const registerController = require('../controllers/registerController')

router.post('/validate-username', registerController.validateUsername)
router.post('/validate-password', registerController.validatePassword)
router.post('/validate-name', registerController.validateName)
router.post('/validate-idcard', registerController.validateIdCard)
router.post('/validate-email', registerController.validateEmail)
router.post('/validate-phone', registerController.validatePhone)
router.post('/', registerController.register)
router.post('/send-verification-code', registerController.sendRegistrationVerificationCode)
router.post('/complete', registerController.completeRegistration)
router.get('/service-terms', registerController.getServiceTerms)
router.get('/privacy-policy', registerController.getPrivacyPolicy)

module.exports = router