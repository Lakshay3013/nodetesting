const express = require('express');
const validate = require('../../../middlewares/validate');
const permissionValidation = require('../validation/permission.validation');
const permissionController = require('../controller/permission.controller');
const isAuthenticated = require('../../../middlewares/auth');
const checkPermission = require('../../../middlewares/webAuth');

const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.post('/create-permission', validate(permissionValidation.createPermission), permissionController.createPermission);
router.post('/add-access-route', validate(permissionValidation.addAccessRoute), permissionController.addAccessRoute);
router.get('/get-all-routes', validate(permissionValidation.getAllRoutes), permissionController.getAllRoutes);
router.get('/get-routes-permission', permissionController.getRoutesPermission);
router.get('/get-menu-permission', permissionController.getMenuPermission);
router.get('/get-menu-routes-permission', permissionController.getMenuRoutesPermission);
router.get('/get-permission-constant', permissionController.getPermissionConstant);
router.get('/get-category-wise-permission', permissionController.getCategoryWisePermission);
router.post('/update-permission', validate(permissionValidation.updatePermission), permissionController.updatePermission);
router.get('/get-role-user-wise-permission', validate(permissionValidation.getRoleOrUserWisePermission), permissionController.getRoleOrUserWisePermission);

module.exports = router;