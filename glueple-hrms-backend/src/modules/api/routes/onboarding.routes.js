const express = require('express');
const validate = require('../../../middlewares/validate');
const onboardingValidation = require('../validation/onboarding.validation');
const onboardingController = require('../controller/onboarding.controller');
const isAuthenticated = require('../../../middlewares/auth');
const checkPermission = require('../../../middlewares/webAuth');
const { uploadCandidateDocuments } = require('../../../middlewares/multer');

const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.post('/create-onboarding-step', validate(onboardingValidation.createOnboardingStep), onboardingController.createOnboardingStep);
router.get('/get-onboarding-step', validate(onboardingValidation.getOnboardingStep), onboardingController.getOnboardingStep);
router.post('/create-onboarding-step-fields', validate(onboardingValidation.createOnboardingStepFields), onboardingController.createOnboardingStepFields);
router.get('/get-onboarding-step-fields', validate(onboardingValidation.getOnboardingStepFields), onboardingController.getOnboardingStepFields);
router.post("/save-onboarding-details", onboardingController.saveOnboardingDetails);
router.post('/upload-emp-documents', uploadCandidateDocuments.fields([{name: 'aadhar_card',maxCount:1},
    {name: 'aadhar_card_back',maxCount:1},
    {name: 'passport',maxCount:1},
    {name: 'passport_back',maxCount:1},
    {name: 'pancard',maxCount:1},
    {name: 'driving_license',maxCount:1},
    {name: 'resume',maxCount:1},
    {name: 'passport_size_photo',maxCount:1},
    {name: 'secondary_marksheet',maxCount:1},
    {name: 'senior_secondary_marksheet',maxCount:1},
    {name: 'ITI_marksheet',maxCount:1},
    {name: 'diploma_marksheet',maxCount:1},
    {name: 'graduation_marksheet',maxCount:1},
    {name: 'post_graduation_marksheet',maxCount:1},
    {name: 'bank_passbook',maxCount:1},
    {name: 'previous_company_experience_letter',maxCount:1},
    {name: 'previous_company_payslip',maxCount:1},
    {name: 'police_verification',maxCount:1},
    {name: 'medical_certificate',maxCount:1},
    {name: 'bgv_certificate',maxCount:1}]),onboardingController.uploadEmployeeDocument);
router.get('/get-employee-docs', onboardingController.getAllEmployeeDocuments);

module.exports = router;