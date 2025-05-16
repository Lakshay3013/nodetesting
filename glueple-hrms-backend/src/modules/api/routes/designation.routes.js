const express = require('express');
const validate = require('../../../middlewares/validate');
const designationValidation = require('../validation/designation.validation');
const designationController = require('../controller/designation.controller');
const isAuthenticated = require('../../../middlewares/auth');
const checkPermission = require('../../../middlewares/webAuth');

const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.post('/create-designation', validate(designationValidation.createDesignation), designationController.createDesignation);
router.get('/get-designation-by-department', validate(designationValidation.getDesignation), designationController.getDesignation);
router.get('/get-all-designation', validate(designationValidation.getAllDesignation), designationController.getAllDesignation);
router.put('/update-designation', validate(designationValidation.updateDesignation), designationController.updateDesignation);
router.delete('/delete-designation', validate(designationValidation.deleteDesignation), designationController.deleteDesignation);
router.get('/get-graphical-hierarchy', designationController.getGraphHierarchy);
router.get('/get-team-hierarchy', designationController.getTeamData);

module.exports = router;