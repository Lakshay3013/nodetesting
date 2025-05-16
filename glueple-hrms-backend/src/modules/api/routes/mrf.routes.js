const express = require('express');
const validate = require('../../../middlewares/validate');
const mrfValidation = require('../validation/mrf.validation');
const mrfController = require('../controller/mrf.controller');
const isAuthenticated = require('../../../middlewares/auth');
const checkPermission = require('../../../middlewares/webAuth');

const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.post('/create-update-mrf', mrfController.createUpdateMRF);
router.post('/submit-draft-mrf', validate(mrfValidation.submitDraftMRF), mrfController.submitDraftMRF);
router.get('/all-mrf', validate(mrfValidation.getAllMRF), mrfController.getAllMRF);
router.get('/get-mrf-by-id', validate(mrfValidation.getMRFById), mrfController.getMRFById);
router.post('/approve-reject-mrf', validate(mrfValidation.approveRejectMRF), mrfController.approveRejectMRF);
router.get("/get-mrf-for-approval", validate(mrfValidation.getMRFForApproval), mrfController.getMRFForApproval);
router.post("/assign-mrf-to-recruiter", validate(mrfValidation.assignMRFToRecruiter), mrfController.assignMRFToRecruiter);
router.post("/change-account-status", validate(mrfValidation.changeMRFStatus), mrfController.changeMRFStatus);
router.post("/ijp-referral", validate(mrfValidation.ijpReferral), mrfController.ijpReferral);
router.get("/get-interviewer-list", validate(mrfValidation.getInterviewerList),mrfController.getInterviewerList);
router.get('/get-mrf-dashboard-and-hierarchy', mrfController.mrfDashboardAndHierarchy);

module.exports = router;