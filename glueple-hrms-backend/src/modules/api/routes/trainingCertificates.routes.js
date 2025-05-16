const express = require('express');
const validate = require('../../../middlewares/validate');
const trainingCertificatesValidation = require('../validation/trainingCertificates.validation');
const trainingCertificatesController = require('../controller/trainingCertificates.controller');
const isAuthenticated = require('../../../middlewares/auth');
const checkPermission = require('../../../middlewares/webAuth');

const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.post('/add-training-certificates', validate(trainingCertificatesValidation.addTrainingCertificates), trainingCertificatesController.saveTrainingCertificates);
router.get('/get-training-certificates', trainingCertificatesController.getTrainingCertificates);
router.get('/get-all-training-certificates', validate(trainingCertificatesValidation.getTrainingCertificates), trainingCertificatesController.getAllTrainingCertificates);
router.put('/update-training-certificates', validate(trainingCertificatesValidation.updateTrainingCertificates), trainingCertificatesController.updateTrainingCertificates);
router.delete('/delete-training-certificates', validate(trainingCertificatesValidation.deleteTrainingCertificates), trainingCertificatesController.deleteTrainingCertificates);

module.exports = router;