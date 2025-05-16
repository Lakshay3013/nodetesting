const express = require('express');
const validate = require('../../../middlewares/validate');
const authValidation = require('../validation/auth.validation');
const authController = require('../../auth/controller/auth');
const isAuthenticated = require('../../../middlewares/auth');

const router = express.Router();

router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', isAuthenticated, authController.logout);

module.exports = router;