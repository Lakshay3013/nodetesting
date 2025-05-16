const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const config = require('../../../config/config.js');
const {trainingCertificatesService} = require('../services/index.js');
const { successResponse, errorResponse } = require('../../../helpers/index.js');
const { messages } = require('../../../config/constants.js');
const { getSessionData } = require('../utils/appHelper.js');

const getTrainingCertificates = catchAsync(async (req, res) => {
    const trainingCertificateData = await trainingCertificatesService.queryTrainingCertificatesByFilter({is_active: true, deleted_at: {$eq: null}});
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, trainingCertificateData,  httpStatus.OK);
});

const getAllTrainingCertificates = catchAsync(async (req, res) => {
  const trainingCertificateData = await trainingCertificatesService.queryTrainingCertificates({deleted_at: {$eq: null}}, req.query);
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, trainingCertificateData,  httpStatus.OK);
});

const saveTrainingCertificates = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    req.body['created_by'] = user?.id;
    const trainingCertificateData = await trainingCertificatesService.addTrainingCertificates(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, trainingCertificateData,  httpStatus.OK);
});

const updateTrainingCertificates = catchAsync(async (req, res) => {
  const trainingCertificateData = await trainingCertificatesService.updateTrainingCertificates({_id: req.body._id}, req.body);
  return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, trainingCertificateData,  httpStatus.OK);
});

const deleteTrainingCertificates = catchAsync(async (req, res) => {
  const trainingCertificateData = await trainingCertificatesService.updateTrainingCertificates({_id: req.body._id}, {deleted_at: new Date()});
  return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, trainingCertificateData,  httpStatus.OK);
});

module.exports = {
  getTrainingCertificates,
  getAllTrainingCertificates,
  saveTrainingCertificates,
  updateTrainingCertificates,
  deleteTrainingCertificates,
};