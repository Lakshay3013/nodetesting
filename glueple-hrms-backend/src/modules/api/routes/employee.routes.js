const express = require('express');
const validate = require('../../../middlewares/validate');
const employeeValidation = require('../validation/employee.validation');
const employeeController = require('../controller/employee.controller');
const isAuthenticated = require('../../../middlewares/auth');
const checkPermission = require('../../../middlewares/webAuth');
const { bulkUploadEmployee,uploadProfile } = require('../../../middlewares/multer');

const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.get('/get-profile', validate(employeeValidation.getProfile), employeeController.getProfile);
router.post('/get-employee-by-ids', validate(employeeValidation.getEmployeeByIds), employeeController.getEmployeeByIds);
router.get("/get-employee-for-reporting-manager", employeeController.getEmployeeForReportingManager);
router.post('/create-employee', isAuthenticated, validate(employeeValidation.createEmployee), employeeController.createEmployee);
router.post('/aadhaar-verify-by-employee', employeeController.aadhaarVerifiedByEmployee);
router.get('/get-all-employee', isAuthenticated,employeeController.getAllEmployee)
router.post('/get-all-employee-list',isAuthenticated, employeeController.getAllEmployeeList)
router.get("/get-user-on-role", validate(employeeValidation.getUserOnRole), employeeController.getUserOnRole);
router.put('/update-employee-details', employeeController.updateEmployeeDetails);
router.post('/bulk-upload-employee',bulkUploadEmployee.single("file"),employeeController.bulkUploadEmployee);
router.post('/upload-profile', uploadProfile.single("file"),employeeController.updateProfile)
router.get('/generate-employee-id', employeeController.generateEmployeeId)

module.exports = router;