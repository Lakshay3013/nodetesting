const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const config = require('../../../config/config.js');
const { shortLeaveConfigurationService } = require('../services/index.js');
const { successResponse, errorResponse } = require('../../../helpers/index.js');
const { messages, shortLeaveConstants } = require('../../../config/constants.js');
const { getSessionData, getServiceResFormat } = require('../utils/appHelper.js');


const createConfiguration = catchAsync(async (req, res) => {
  const user = getSessionData(req);
  req.body['created_by'] = user?.id;
  const configurationData = await shortLeaveConfigurationService.createConfiguration(req.body);
  return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, configurationData, httpStatus.OK);
});

const updateConfiguration = catchAsync(async (req, res) => {
  const configurationData = await shortLeaveConfigurationService.updateConfiguration({ _id: req.body._id }, req.body );
  return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, configurationData, httpStatus.OK);
});

const deleteConfiguration = catchAsync(async (req, res) => {
  const configurationData = await shortLeaveConfigurationService.updateConfiguration({ _id: req.body._id }, {deleted_at: new Date()  });
  return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, configurationData, httpStatus.OK);
});

const getAllConfigurations = catchAsync(async (req, res) => {
  const configurationData = await shortLeaveConfigurationService.getAllConfigurations({deleted_at: {$eq: null}}, req.query);
  return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, configurationData, httpStatus.OK);
});

const getConfigurationConstantData = catchAsync(async (req, res) => {
  const response = getServiceResFormat();
  response.data = shortLeaveConstants;
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response,  httpStatus.OK);
});


module.exports = {
  createConfiguration,
  updateConfiguration,
  deleteConfiguration,
  getAllConfigurations,
  getConfigurationConstantData,
};