const express = require('express');
const validate = require('../../../middlewares/validate');
const isAuthenticated = require('../../../middlewares/auth');
const checkPermission = require('../../../middlewares/webAuth');
const performanceManagementController = require('../controller/performanceManagement.controller');
const performanceManagementValidation = require('../validation/performanceManagement.validation')

const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.post('/create-kra', validate(performanceManagementValidation.createKra), performanceManagementController.createKra);
router.get('/get-kra-details', validate(performanceManagementValidation.getKraDetails), performanceManagementController.getKraDetails);
router.put('/update-kra-detail', validate(performanceManagementValidation.updateKraDetail), performanceManagementController.updateKraDetail);
router.delete('/delete-kra-detail',validate(performanceManagementValidation.deleteKraDetail), performanceManagementController.deleteKraDetail);

router.post('/create-kra-parameter', performanceManagementController.createKraParameter);
router.get('/get-kra-parameter', performanceManagementController.getKraParameter);
router.put('/update-kra-parameter', performanceManagementController.updateKraParameter);
router.delete('/delete-kra-parameter', performanceManagementController.deleteKraParameter);

router.post('/create-kpi', performanceManagementController.createKPiDetails);
router.get('/get-kpi-details', performanceManagementController.getKpiDetails);
router.put('/update-kpi-detail', performanceManagementController.updateKpiDetail);
router.delete('/delete-kpi-detail', performanceManagementController.deleteKpiDetail)

router.get('/get-all-kra-details', performanceManagementController.getAllKraDetails);
router.get('/get-all-kra-parameter-details', performanceManagementController.getAllKraParameterDetails);
router.get('/get-all-kpi-details', performanceManagementController.getAllKpiDetails);
router.post('/create-kra-rating-type-for-department', performanceManagementController.createKraRatingTypeForDepartment);
router.get('/get-kra-rating-type-for-department', performanceManagementController.getKraRatingTypeForDepartment);
router.get('/get-all-kra-rating-type-for-department', performanceManagementController.getAllKraRatingTypeForDepartment);
router.put('/update-kra-rating-type-for-department', performanceManagementController.updateKraRatingTypeDepartment);
router.delete('/delete-kra-rating-type-for-department', performanceManagementController.deleteKraRatingTypeForDepartment);

router.post('/create-self-rating-permission', validate(performanceManagementValidation.createSelfRatingPermission),performanceManagementController.createSelfRatingPermission);
router.get('/get-self-rating-permission', performanceManagementController.getSelfRatingPermission);
router.get('/get-all-self-rating-permission', performanceManagementController.getAllSelfRatingPermission);
router.put('/update-self-rating-permission', performanceManagementController.updateSelfRatingPermission);
router.delete('/delete-self-rating-permission', performanceManagementController.deleteSelfRatingPermission);

router.post('/assign-kra', performanceManagementController.assignKra);
router.get('/get-assign-kra', performanceManagementController.getAllAssignKra);
router.get('/get-all-assign-kra', performanceManagementController.getAllAssignKra);
router.put('/update-assign-kra', performanceManagementController.updateAssignKra);
router.delete('/delete-assign-kra', performanceManagementController.deleteAssignKra);
router.get('/get-employee-by-kra', performanceManagementController.getEmployeeByKra);
router.post('/give-rating', validate(performanceManagementValidation.giveRating),performanceManagementController.giveRating);
router.post('/update-employee-rating-duration',performanceManagementController.updateEmployeeRatingDuration);
router.get('/get-kra-details-by-employee', performanceManagementController.getKraDetailsByEmployee);
router.get('/get-given-rating',validate(performanceManagementValidation.getGivenRating), performanceManagementController.getGivenRating);
router.get('/get-rating-wise-employee', performanceManagementController.getRatingWiseEmployee);
router.get('/get-average-rating', validate(performanceManagementValidation.getAverageRating), performanceManagementController.getAverageRating);


module.exports = router;