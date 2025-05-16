const express = require('express');
const validate = require('../../../middlewares/validate');
const financialYearValidation = require('../validation/financialYear.validation');
const financialYearController = require('../controller/financialYear.controller');
const isAuthenticated = require('../../../middlewares/auth');
const checkPermission = require('../../../middlewares/webAuth');

const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.post('/add-financial-year', validate(financialYearValidation.addFinancialYear), financialYearController.addFinancialYear);
router.get('/get-all-financial-year', validate(financialYearValidation.getAllFinancialYear), financialYearController.getAllFinancialYear);
router.put('/update-financial-year', validate(financialYearValidation.updateFinancialYear), financialYearController.updateFinancialYear);
router.get('/get-financial-year-list',  financialYearController.getFinancialYearList);
router.get('/get-financial-year-wise-month', financialYearController.getFinancialYearWiseMonth)

module.exports = router;