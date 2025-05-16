const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const config = require('../../../config/config.js');
const {qualificationsService} = require('../services/index.js');
const { successResponse, errorResponse } = require('../../../helpers/index.js');
const { messages } = require('../../../config/constants.js');
const { getSessionData } = require('../utils/appHelper.js');

const getQualificationData = catchAsync(async (req, res) => {
    const qualificationData = await qualificationsService.queryQualificationByFilter({deleted_at: {$eq: null}});
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, qualificationData,  httpStatus.OK);
});

const getQualificationByParentId = catchAsync(async (req, res) => {
  let data = {};
  if(req.query.parent_id){
    data['parent_id'] = req.query.parent_id;
  }
  data['deleted_at'] = {$eq: null};
  const qualificationData = await qualificationsService.queryQualification(data, req.query);
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, qualificationData,  httpStatus.OK);
});

const saveQualificationData = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    req.body['created_by'] = user?.id;
    const qualificationData = await qualificationsService.addQualification(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, qualificationData,  httpStatus.OK);
});

const updateQualification = catchAsync(async (req, res) => {
  const qualificationData = await qualificationsService.updateQualification({_id: req.body._id}, req.body);
  return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, qualificationData,  httpStatus.OK);
});

const deleteQualification = catchAsync(async (req, res) => {
  const qualificationData = await qualificationsService.updateQualification({_id: req.body._id}, {deleted_at: new Date()});
  return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, qualificationData,  httpStatus.OK);
});

module.exports = {
  getQualificationData,
  saveQualificationData,
  getQualificationByParentId,
  updateQualification,
  deleteQualification,
};