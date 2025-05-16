const express = require('express');
const validate = require('../../../middlewares/validate');
const emailTemplateValidation = require('../validation/emailTemplate.validation');
const emailTemplateController = require('../controller/emailTemplate.controller');
const isAuthenticated = require('../../../middlewares/auth');
const { uploadTemplateImage } = require('../../../middlewares/multer');

const router = express.Router();

router.post('/create-email-template', isAuthenticated, validate(emailTemplateValidation.createTemplate), emailTemplateController.createTempate);
router.get('/get-email-template', isAuthenticated, validate(emailTemplateValidation.getEmailTeamplate), emailTemplateController.getEmailTemplate)
router.post('/create-email-type', isAuthenticated, validate(emailTemplateValidation.createEmailType), emailTemplateController.createEmailType);
router.get('/get-email-type', isAuthenticated, validate(emailTemplateValidation.getEmailType), emailTemplateController.getEmailtype);
router.post('/update-email-template', isAuthenticated, validate(emailTemplateValidation.UpdateEmailTemplate), emailTemplateController.updateEmailTemplate);
router.delete('/delete-email-template', isAuthenticated, validate(emailTemplateValidation.deletemailTemplate), emailTemplateController.deleteEmailTemplate)
router.post('/add-template-image',uploadTemplateImage.single('upload'),emailTemplateController.AddTemplate)
router.delete('/remove-template-image',validate(emailTemplateValidation.removeTemplateImage), emailTemplateController.removeTemplateImage)
router.post('/add-action-template', isAuthenticated, validate(emailTemplateValidation.emailTemplateAction), emailTemplateController.AddActionTempate)
router.get('/get-action-template', isAuthenticated,validate(emailTemplateValidation.getActionTemplate), emailTemplateController.getActionTemaplate)
router.post('/update-action',isAuthenticated, validate(emailTemplateValidation.UpdateemailTemplateAction),emailTemplateController.updateActionTemplate)
router.delete('/delete-Action',isAuthenticated,validate(emailTemplateValidation.deleteActionTemplate),emailTemplateController.deleteActionTemplate)
router.get('/get-action-type', isAuthenticated, validate(emailTemplateValidation.getEmailActionType),emailTemplateController.getEmailActionType)
router.post('/AddActionType',validate(emailTemplateValidation.AddAction), emailTemplateController.AddActionType)

//update use put, 
module.exports = router;