const express = require('express');
const validate = require('../../../middlewares/validate');
const employeeController = require('../../employee/controller/employee');
const isAuthenticated = require('../../../middlewares/auth');

const router = express.Router();
router.get('/getProfile', isAuthenticated, employeeController.getProfile);


module.exports = router;