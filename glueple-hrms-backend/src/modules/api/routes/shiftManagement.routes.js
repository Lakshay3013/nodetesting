const express = require('express');
const validate = require('../../../middlewares/validate');
const shiftManagementValidation = require('../validation/shiftManagement.validation')
const shiftManagementController = require('../controller/shiftManagement.controller')
const isAuthenticated = require('../../../middlewares/auth');

const router = express.Router();

router.post('/create-shift', isAuthenticated, validate(shiftManagementValidation.createShift), shiftManagementController.createShift);
router.get('/get-shift', isAuthenticated, validate(shiftManagementValidation.getShift), shiftManagementController.getAllShift);
router.get('/get-shift-by-id', isAuthenticated, validate(shiftManagementValidation.getShiftById),shiftManagementController.getShiftById);
router.put('/update-shift', isAuthenticated, validate(shiftManagementValidation.UpdateShift), shiftManagementController.updateShift);
router.delete('/delete-shift', isAuthenticated, validate(shiftManagementValidation.deleteShift),shiftManagementController.deleteShift);
router.post('/create-shift-configuration', isAuthenticated, validate(shiftManagementValidation.createShiftConfiguration),shiftManagementController.createShiftConfiguration);
// router.get('/get-shift-configuration-by-shiftid',isAuthenticated, validate(shiftManagementValidation.getShiftConfigurationByShiftId),shiftManagementController.getShiftConfigurationByShiftId);
router.post('/shift-assign', isAuthenticated, validate(shiftManagementValidation.shiftAssign),shiftManagementController.shiftAssign);
router.post('/add-week-off', isAuthenticated, validate(shiftManagementValidation.addWeekOff),shiftManagementController.addWeekOff);
router.get('/get-employee-by-shiftId', isAuthenticated, validate(shiftManagementValidation.getEmployeeByShiftId), shiftManagementController.getEmployeeByShiftId);
router.post('/add-shift-calendar', isAuthenticated, validate(shiftManagementValidation.AddCalendar),shiftManagementController.addCalendar);
router.put('/update-shift-calendar', isAuthenticated, validate(shiftManagementValidation.updateCalendar), shiftManagementController.updateShiftCalendar);
router.get('/get-shift-calendar', isAuthenticated, validate(shiftManagementValidation.getCalendar),shiftManagementController.getAllShiftCalendar);
router.delete('/delete-shift-calendar', isAuthenticated, validate(shiftManagementValidation.deleteCalendar),shiftManagementController.deleteShiftCalendar);
router.get('/get-all-shift-details', isAuthenticated, validate(shiftManagementValidation.getAllShiftDetails),shiftManagementController.getAllShiftDetails);
router.delete('/employee-delete-shift', isAuthenticated, validate(shiftManagementValidation.deleteEmployeeInShift), shiftManagementController.deleteEmployeeInShift) ;
router.get('/active-or-inactive', isAuthenticated, validate(shiftManagementValidation.isActiveOrInActive), shiftManagementController.isActiveOrInActive);
router.get('/get-employee-shift-details', isAuthenticated, validate(shiftManagementValidation.getEmployeeShiftDetailsById), shiftManagementController.getEmployeeShiftDetailsById);
router.get('/download-shift-sample', isAuthenticated,shiftManagementController.downloadSample)
router.post('/upload-shift-month-wise', isAuthenticated, shiftManagementController.uploadShiftMonthWise)


module.exports = router;