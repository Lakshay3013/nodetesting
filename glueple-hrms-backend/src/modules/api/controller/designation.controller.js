const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const {designationService, employeeService} = require('../services');
const { successResponse, errorResponse } = require('../../../helpers');
const { messages } = require('../../../config/constants.js');
const { getSessionData } = require('../utils/appHelper.js');

const getDesignation = catchAsync(async (req, res) => {
  const {department_id} = req.query;
  let filter = department_id == undefined ? {is_active: true, deleted_at: {$eq: null}} :{department_id: department_id, is_active: true, deleted_at: {$eq: null}}
  const designationData = await designationService.queryDesignationByFilter(filter);
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, designationData,  httpStatus.OK);
});

const getAllDesignation = catchAsync(async (req, res) => {
  const designationData = await designationService.queryDesignation({}, req.query);
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, designationData,  httpStatus.OK);
});

const createDesignation = catchAsync(async (req, res) => {
  const user = getSessionData(req);
  req.body['created_by'] = user?.id;
  const designationData = await designationService.createDesignation(req.body);
  return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, designationData,  httpStatus.OK);
});

const updateDesignation = catchAsync(async (req, res) => {
  const designationData = await designationService.updateDesignation({_id: req.body._id}, req.body);
  return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, designationData,  httpStatus.OK);
});

const deleteDesignation = catchAsync(async (req, res) => {
  const getEmployeeOfDesignation = await employeeService.getSingleUser({designation_id: req.body._id},{});
  if(getEmployeeOfDesignation && getEmployeeOfDesignation?.status){
    const designationData = await designationService.updateDesignation({_id: req.body._id}, {deleted_at: new Date()});
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, designationData,  httpStatus.OK);
  }else{
    const designationData = await designationService.deleteDesignation({_id: req.body._id});
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, designationData,  httpStatus.OK);
  }
});

const getGraphHierarchy = catchAsync(async (req, res) => {
  const designationData = await designationService.getGraphicalData();
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, designationData,  httpStatus.OK);
});

const getTeamData = catchAsync(async (req, res) => {
  const designationData = await designationService.getTeamData();
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, designationData,  httpStatus.OK);
});

const getDesignationList = catchAsync(async (req, res) => {
  const designationData = await designationService.getDesignationList({});
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, designationData,  httpStatus.OK);
});


module.exports = {
  getDesignation,
  getAllDesignation,
  createDesignation,
  updateDesignation,
  deleteDesignation,
  getGraphHierarchy,
  getTeamData,
};