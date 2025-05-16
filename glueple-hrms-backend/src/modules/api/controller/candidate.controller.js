const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const { 
    candidateService,
    mrfService,
 } = require('../services');
const { successResponse, errorResponse } = require('../../../helpers');
const { messages, autoIncrementId } = require('../../../config/constants.js');
const { getSessionData, getServiceResFormat } = require('../utils/appHelper.js');
const axoisHelper = require("../../../helpers/axois.js");

const createCandidate = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    const maximumId = await candidateService.getLastData('auto_id');
    req.body['auto_id'] = maximumId?.status ? parseFloat(maximumId?.data?.auto_id) + 1 : autoIncrementId?.start;
    req.body['created_by'] = user?.id;
    const candidateData = await candidateService.createCandidate(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, candidateData, httpStatus.OK);
});

const resumeParser = catchAsync(async (req, res) => {
    const response = getServiceResFormat()
    const file = req.file;
    const resumeData = await axoisHelper.resumeParser(file);
    response.data = resumeData
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK);
});

const getAllCandidates = catchAsync(async (req, res) => {
    const candidateData = await candidateService.queryCandidate({}, req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, candidateData, httpStatus.OK);
});

const getCandidatesByMRFId = catchAsync(async (req, res) => {
    const candidateData = await candidateService.queryCandidate({ mrf_id: req.query.mrf_id }, req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, candidateData, httpStatus.OK);
});

const selectedCandidates = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    const candidateData = await candidateService.queryCandidate({ created_by: user?.id, final_selection: true }, req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, candidateData, httpStatus.OK);
});

const updateCandidateDetails = catchAsync(async (req, res) => {
    const candidateData = await candidateService.updateCandidate({ _id: req.body._id}, {$set: req.body});
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, candidateData, httpStatus.OK);
});

const candidateDropout = catchAsync(async (req, res) => {
    const candidateData = await candidateService.updateCandidate({ _id: req.body._id}, {$set:
        {offer_letter_status: 'pending'}
    });
    if(candidateData?.status){
        const mrfId = candidateData && candidateData?.data ? candidateData?.data?.mrf_id : '';
        if(mrfId){
            await mrfService.updateMRF({_id: mrfId}, {$set: {mrf_status: 'open'}});
        }
    }
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, candidateData, httpStatus.OK);
});

const sendCredentialsMail = catchAsync(async (req, res) => {
    const candidateData = await candidateService.updateCandidate({ _id: req.body._id}, {$set:
        {offer_letter_status: 'send'}
    });
    //add mail template to send credentials
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, candidateData, httpStatus.OK);
});

module.exports = {
    createCandidate,
    resumeParser,
    getAllCandidates,
    getCandidatesByMRFId,
    selectedCandidates,
    updateCandidateDetails,
    candidateDropout,
    sendCredentialsMail,
};