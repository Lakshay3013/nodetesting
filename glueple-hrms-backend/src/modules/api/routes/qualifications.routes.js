const express = require('express');
const validate = require('../../../middlewares/validate');
const qualificationsValidation = require('../validation/qualifications.validation');
const qualificationsController = require('../controller/qualifications.controller');
const isAuthenticated = require('../../../middlewares/auth');
const checkPermission = require('../../../middlewares/webAuth');

const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.post('/add-qualification', validate(qualificationsValidation.addQualification), qualificationsController.saveQualificationData);
router.get('/get-qualifications', validate(qualificationsValidation.getQualification), qualificationsController.getQualificationData);
router.get('/get-qualifications-by-parent-id', validate(qualificationsValidation.getQualificationByParentId), qualificationsController.getQualificationByParentId);
router.put('/update-qualification', validate(qualificationsValidation.updateQualification), qualificationsController.updateQualification);
router.delete('/delete-qualification', validate(qualificationsValidation.deleteQualification), qualificationsController.deleteQualification);

module.exports = router;