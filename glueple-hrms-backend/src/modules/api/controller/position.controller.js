const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const {
  positionService,
  employeeService,
} = require('../services');
const { successResponse, errorResponse } = require('../../../helpers');
const { messages } = require('../../../config/constants.js');
const { getSessionData } = require('../utils/appHelper.js');

const getPosition = catchAsync(async (req, res) => {
  const {department_id, designation_id} = req.query;
  const positionData = await positionService.queryPositionByFilter({department_id: department_id, designation_id: designation_id, is_active: true, deleted_at: {$eq: null}});
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, positionData,  httpStatus.OK);
});

const getAllPosition = catchAsync(async (req, res) => {
  const positionData = await positionService.queryPosition({}, req.query);
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, positionData,  httpStatus.OK);
});

const createPosition = catchAsync(async (req, res) => {
  const user = getSessionData(req);
  req.body['created_by'] = user?.id;
  const positionData = await positionService.createPosition(req.body);
  return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, positionData,  httpStatus.OK);
});

const updatePosition = catchAsync(async (req, res) => {
  const positionData = await positionService.updatePosition({_id: req.body._id}, req.body);
  return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, positionData,  httpStatus.OK);
});

const deletePosition = catchAsync(async (req, res) => {
  const getEmployeeOfPosition = await employeeService.getSingleUser({position_id: req.body._id},{});
  if(getEmployeeOfPosition && getEmployeeOfPosition?.status){
    const positionData = await positionService.updatePosition({_id: req.body._id}, {deleted_at: new Date()});
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, positionData,  httpStatus.OK);
  }else{
    const positionData = await positionService.deletePosition({_id: req.body._id});
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, positionData,  httpStatus.OK);
  }
});


module.exports = {
  getPosition,
  getAllPosition,
  createPosition,
  updatePosition,
  deletePosition,
};