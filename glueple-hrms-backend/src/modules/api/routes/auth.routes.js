const express = require('express');
const validate = require('../../../middlewares/validate');
const authValidation = require('../validation/auth.validation');
const authController = require('../controller/auth.controller');
const isAuthenticated = require('../../../middlewares/auth');

const router = express.Router();

router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', authController.logout);
router.get('/check-session-status', authController.checkSessionStatus);
router.put('/reset-password', isAuthenticated, validate(authValidation.resetPassword), authController.resetPassword);
router.put('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);
router.post("/send-otp", validate(authValidation.sendOtp), authController.sendOtp);
router.get("/verify-otp", validate(authValidation.verifyOtp), authController.verifyOtp);
router.put('/forgot-password-for-admin',validate(authValidation.forgotPasswordForAdmin),authController.forgotPasswordForAdmin);


module.exports = router;