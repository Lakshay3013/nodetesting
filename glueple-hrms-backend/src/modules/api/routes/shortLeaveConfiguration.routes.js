const express = require('express');
const validate = require('../../../middlewares/validate');
const shortLeaveConfigurationValidation = require('../validation/shortLeaveConfiguration.validation');
const shortLeaveConfigurationController = require('../controller/shortLeaveConfiguration.controller');
const isAuthenticated = require('../../../middlewares/auth');
const checkPermission = require('../../../middlewares/webAuth');

const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.post('/create-short-leave-configuration', validate(shortLeaveConfigurationValidation.createConfiguration), shortLeaveConfigurationController.createConfiguration);
router.put('/update-short-leave-configuration', validate(shortLeaveConfigurationValidation.updateConfiguration), shortLeaveConfigurationController.updateConfiguration);
router.delete('/delete-short-leave-configuration', validate(shortLeaveConfigurationValidation.deleteConfiguration), shortLeaveConfigurationController.deleteConfiguration);
router.get('/get-all-short-leave-configuration', validate(shortLeaveConfigurationValidation.getAllConfigurations), shortLeaveConfigurationController.getAllConfigurations);
router.get('/get-configuration-constants', shortLeaveConfigurationController.getConfigurationConstantData);

module.exports = router;