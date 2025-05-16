const express = require('express');
const validate = require('../../../middlewares/validate');
const candidateValidation = require('../validation/candidate.validation');
const candidateController = require('../controller/candidate.controller');
const isAuthenticated = require('../../../middlewares/auth');
const { uploadCandidateResume } = require('../../../middlewares/multer');
const checkPermission = require('../../../middlewares/webAuth');

const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.post('/create-candidate', validate(candidateValidation.createCandidate), candidateController.createCandidate);
router.post("/resume-parser", uploadCandidateResume.single("file"), candidateController.resumeParser);
router.get("/all-candidates", validate(candidateValidation.getAllCandidates), candidateController.getAllCandidates);
router.get("/candidates-by-mrf-id", validate(candidateValidation.getCandidatesByMRFId), candidateController.getCandidatesByMRFId);
router.get("/selected-candidates", validate(candidateValidation.selectedCandidates), candidateController.selectedCandidates);
router.put("/update-candidate-details", validate(candidateValidation.updateCandidateDetails), candidateController.updateCandidateDetails);
router.post("/candidate-dropout", validate(candidateValidation.candidateDropout), candidateController.candidateDropout);
router.post("/send-credentials-mail", validate(candidateValidation.sendCredentialsMail), candidateController.sendCredentialsMail);

module.exports = router;