const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const { permissionService } = require('../services');
const { successResponse, errorResponse } = require('../../../helpers');
const { messages, permissionConstant } = require('../../../config/constants.js');
const { getSessionData, getServiceResFormat } = require('../utils/appHelper.js');

const createPermission = catchAsync(async (req, res) => {
  const permissionData = await permissionService.createPermission(req.body);
  return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, permissionData, httpStatus.OK);
});

const addAccessRoute = catchAsync(async (req, res) => {
  const { collection_id, permission_ids, permission_for } = req.body;
  const permissionData = await permissionService.addAccessRoute({ collection_id: collection_id }, { permission_ids: permission_ids, permission_for: permission_for });
  return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, permissionData, httpStatus.OK);
});

const getAllRoutes = catchAsync(async (req, res) => {
  const permissionData = await permissionService.queryPermission({}, req.query);
  return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, permissionData, httpStatus.OK);
});

const getRoutesPermission = catchAsync(async (req, res) => {
  const user = getSessionData(req);
  const permissionData = await permissionService.getRoutesPermission(user);
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, permissionData, httpStatus.OK);
});

const getMenuPermission = catchAsync(async (req, res) => {
  const user = getSessionData(req);
  const permissionData =await permissionService.getMenuPermission({permission_type:'menu'})
  // const permissionData = await permissionService.getMenuSubmenuPermission(user);
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, permissionData, httpStatus.OK);
});

const getMenuRoutesPermission = catchAsync(async (req, res) => {
  const user = getSessionData(req);
  const permissionData = await permissionService.getUserPermission(user);
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, permissionData, httpStatus.OK);
});

const getPermissionConstant = catchAsync(async (req, res) => {
  const response = getServiceResFormat();
  response.data = permissionConstant;
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK);
});

const getCategoryWisePermission = catchAsync(async (req, res) => {
  const permissionData = await permissionService.getCategoryWisePermission({});
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, permissionData, httpStatus.OK);
});

const updatePermission = catchAsync(async (req, res) => {
  const { user_id, role_id, permission_ids } = req.body;
  let permissionData = null;
  if (user_id) {
    permissionData = await permissionService.addAccessRoute({ collection_id: user_id, permission_for: 'employees' }, { permission_ids: permission_ids, permission_for: 'employees', collection_id: user_id });
  } else {
    permissionData = await permissionService.addAccessRoute({ collection_id: role_id, permission_for: 'roles' }, { permission_ids: permission_ids, permission_for: 'roles', collection_id: role_id });
  }
  return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, permissionData, httpStatus.OK);
});

const getRoleOrUserWisePermission = catchAsync(async (req, res) => {
  const { user_id, role_id } = req.query;
  let permissionData = null;
  if (user_id) {
    permissionData = await permissionService.getAccessRouteData({ collection_id: user_id, permission_for: 'employees' });
  } else if(!permissionData || !permissionData?.status) {
    permissionData = await permissionService.getAccessRouteData({ collection_id: role_id, permission_for: 'roles' });
  }
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, permissionData, httpStatus.OK);
});

const getUserPermission = catchAsync(async(req, res)=>{

});

module.exports = {
  createPermission,
  addAccessRoute,
  getAllRoutes,
  getRoutesPermission,
  getMenuPermission,
  getMenuRoutesPermission,
  getPermissionConstant,
  getCategoryWisePermission,
  updatePermission,
  getRoleOrUserWisePermission,
};