const express = require('express');
const validate = require('../../../middlewares/validate');
const leavesValidation = require('../validation/leaves.validation');
const leavesController = require('../controller/leaves.controller');
const isAuthenticated = require('../../../middlewares/auth');
const checkPermission = require('../../../middlewares/webAuth');
const { is } = require('express/lib/request');

const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.post('/add-leave-type', validate(leavesValidation.addLeaveType), leavesController.addLeaveType);
router.get('/get-leave-type', validate(leavesValidation.getLeaveType), leavesController.getLeaveType);
router.put('/update-leave-type', validate(leavesValidation.updateLeaveType), leavesController.updateLeaveType);
router.delete('/delete-leave-type', validate(leavesValidation.deleteLeaveType), leavesController.deleteLeaveType);
router.post('/add-leave-setting', validate(leavesValidation.addLeaveSetting), leavesController.addLeaveSetting);
router.get('/get-all-leave-setting', validate(leavesValidation.getAllLeaveSetting), leavesController.getAllLeaveSetting);
router.get('/get-leave-setting-by-leave-id', validate(leavesValidation.getLeaveSetting), leavesController.getLeaveSetting);
router.put('/update-leave-setting', validate(leavesValidation.updateLeaveSetting), leavesController.updateLeaveSetting);
router.delete('/delete-leave-setting', validate(leavesValidation.deleteLeaveType), leavesController.deleteLeaveSetting);
router.get('/get-leave-constants', leavesController.getLeaveConstantData);
router.get("/get-leave-type-list", leavesController.getLeaveTypeList);
router.get("/filtered-leave-balance-data", validate(leavesValidation.getFilteredLeaveBalanceData), leavesController.getFilteredLeaveBalanceData);

router.post('/apply-leave',  validate(leavesValidation.applyLeave), leavesController.applyLeave);
router.post('/sandwich-leaves-dates', validate(leavesValidation.sandwichLeaveDates), leavesController.sandwichLeaveDates);
router.get('/get-leave-balance',  leavesController.getLeaveBalance);
router.post('/add-leave-balance', leavesController.addLeaveBalance);
router.get('/get-employee-applied-leave',  leavesController.getEmpAppliedLeaveRequest);
router.post('/approve-reject-leave',  validate(leavesValidation.approveRejectLeave),leavesController.approveRejectLeave);
router.get('/cancel-Leave', validate(leavesValidation.cancelLeave),leavesController.cancelLeave)
router.get('/get-employee-approvel-leave',  leavesController.getEmpAppliedLeaveApprovel)
router.get('/get-all-employee-leave',  validate(leavesValidation.getAllEmployeeLeave), leavesController.getAllEmployeeLeave)
router.get('/get-leave-progress', leavesController.getLeaveApprovalProgress)
router.post("/check-leave-encashment-formula", leavesController.checkLeaveEncashmentFormula);
router.post('/credit-debit-leave',validate(leavesValidation.creditDebitLeave),leavesController.creditDebitLeave);
router.get('/get-credit-debit-leave',validate(leavesValidation.getCreditDebitLeave), leavesController.getCreditDebitLeave);
router.get('/get-leave-today', leavesController.getLeaveToday);
router.get('/get-employee-leave', leavesController.getEmployeeLeave);

module.exports = router;