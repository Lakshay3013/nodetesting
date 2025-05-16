const express = require('express');
const validate = require('../../../middlewares/validate');
const interviewManagementValidation = require('../validation/interviewManagement.validation');
const interviewManagementController = require('../controller/interviewManagement.controller');
const isAuthenticated = require('../../../middlewares/auth');
const checkPermission = require('../../../middlewares/webAuth');

const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.post('/add-update-questions', validate(interviewManagementValidation.createUpdateQuestions), interviewManagementController.createUpdateQuestions);
router.get('/get-question-by-interview-stage', validate(interviewManagementValidation.getQuestionByStage), interviewManagementController.getQuestionByStage);
router.get('/get-interviewer', validate(interviewManagementValidation.getInterviewer), interviewManagementController.getInterviewer);
router.post('/assign-interview', validate(interviewManagementValidation.assignInterview), interviewManagementController.assignInterview);
router.post('/fill-feedback-form', validate(interviewManagementValidation.fillInterviewForm), interviewManagementController.fillInterviewForm);
router.get('/get-assigned-interview', validate(interviewManagementValidation.getAssignedInterview), interviewManagementController.getAssignedInterview);
router.get("/get-interview-details-by-id", validate(interviewManagementValidation.getInterviewDetails), interviewManagementController.getInterviewDetails);

module.exports = router;