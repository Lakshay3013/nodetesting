const express = require('express');
const validate = require('../../../middlewares/validate');
const userValidation = require('../../view/validation/user.validation');
const userController = require('../../admin/controller/user.controller');
const {isAdminAuthenticated} = require('../../../middlewares/auth');

const router = express.Router();

router.post('/login', validate(userValidation.login), userController.login);
router.post('/register', validate(userValidation.createAdmin), userController.createAdmin);
// router.get('/getProfile',isAdminAuthenticated, userController.getProfile);

module.exports = router;