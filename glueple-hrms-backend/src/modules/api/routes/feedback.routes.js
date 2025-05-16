const express = require('express');
const validate = require('../../../middlewares/validate');
const feedbackValidation =require('../validation/feedback.validation')
const feedbackController =require('../controller/feedback.controller')
const isAuthenticated = require('../../../middlewares/auth');
const checkPermission = require('../../../middlewares/webAuth');

const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.post('/create-feedback-team',validate(feedbackValidation.createFeedbackTeam), feedbackController.createFeedbackTeam)
router.get('/get-all-feedback-teams', feedbackController.getAllFeedbackTeams)
router.post('/create-feedback',validate(feedbackValidation.createFeedback), feedbackController.createFeedback)
router.get('/given-feedback', feedbackController.givenFeedback)
router.get('/get-received-feedback-on-filter', feedbackController.getReceivedFeedbackOnFilter)
router.get('/get-feedback-dashboard-data', feedbackController.getFeedbackDashboardData)

module.exports = router;