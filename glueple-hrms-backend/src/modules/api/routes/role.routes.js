const express = require('express');
const roleController = require('../controller/role.controller');
const roleValidation = require('../validation/role.validation')
const isAuthenticated = require('../../../middlewares/auth');
const checkPermission = require('../../../middlewares/webAuth');
const validate = require('../../../middlewares/validate');

const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.get('/get-role-list', roleController.getAllRoles);
router.post('/create-role',validate(roleValidation.createRoles), roleController.createRoles);
router.get('/get-all-roles',validate(roleValidation.getRoleList), roleController.getRoleList);
router.put('/update-role',validate(roleValidation.updateRole), roleController.updateRole);
router.delete('/delete-role',validate(roleValidation.deleteRole), roleController.deleteRole);
router.post('/assign-role', roleController.assignRole)

module.exports = router;