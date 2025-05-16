const express = require('express');
const validate = require('../../../middlewares/validate');
const commonController = require('../controller/common.controller');
const commonValidation = require('../validation/common.validation');
const isAuthenticated = require('../../../middlewares/auth');

const router = express.Router();

// router.use(isAuthenticated);

router.get('/get-app-constants',isAuthenticated, commonController.getAppConstantData);
router.get('/get-date-constant',isAuthenticated, commonController.getDateConstant);
router.get('/get-constant-by-category-subcategory',isAuthenticated, validate(commonValidation.getConstantByCategorySubcategory), commonController.getConstantByCategorySubcategory);
router.get('/get-employee-details-by-excel', commonController.getEmployeeDetailsByExcel)
router.get('/check-in-check-out-machine', commonController.checkInCheckOutMachine)

module.exports = router;