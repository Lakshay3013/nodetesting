const express = require('express');
const validate = require('../../../middlewares/validate');
const approvalManagementValidation = require('../validation/approvalManagement.validation');
const approvalManagementController = require('../controller/approvalManagement.controller');
const isAuthenticated = require('../../../middlewares/auth');
const checkPermission = require('../../../middlewares/webAuth');

const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.post('/create-approval-hierarchy', validate(approvalManagementValidation.createHierarchy), approvalManagementController.createHierarchy);
router.get('/get-hierarchy', validate(approvalManagementValidation.getHierarchy), approvalManagementController.getHierarchy);
router.put('/update-hierarchy', approvalManagementController.updateHierarchy)
router.delete('/delete-hierarchy', validate(approvalManagementValidation.deleteHierarchy), approvalManagementController.deleteHierarchy)

module.exports = router;