const express = require('express');
const commonValidation = require('../validation/common.validation');
const validate=require('../../../middlewares/validate');
const commonController = require('../controller/common');
const {isAuthenticated} = require('../../../middlewares/auth');

const router = express.Router();
router.post('/createSmsTemplate', validate(commonValidation.createSmsTemplate) ,commonController.createSmsTemplate);
router.post('/updateTemplateStatus',validate(commonValidation.updateTemplateStatus) ,commonController.updateTemplateStatus)

module.exports = router;