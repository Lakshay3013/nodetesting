const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const { 
    interviewManagementService,
    candidateService,
} = require('../services');
const { successResponse, errorResponse } = require('../../../helpers');
const { messages } = require('../../../config/constants.js');
const { getSessionData } = require('../utils/appHelper.js');

const createUpdateQuestions = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    req.body['created_by'] = user?.id;
    const interviewQuestionData = await interviewManagementService.addUpdateInterviewQuestions(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, interviewQuestionData, httpStatus.OK);
});

const getQuestionByStage = catchAsync(async (req, res) => {
    const filter = Object.hasOwn(req.query, 'is_active') ? { interview_stage: req.query.interview_stage, is_active: req.query.is_active } : { interview_stage: req.query.interview_stage };
    const interviewQuestionData = await interviewManagementService.queryInterviewQuestions(filter, req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, interviewQuestionData, httpStatus.OK);
});

const getInterviewer = catchAsync(async (req, res) => {
    const interviewerData = await interviewManagementService.queryInterviewer(req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, interviewerData, httpStatus.OK);
});

const assignInterview = catchAsync(async (req, res) => {
    let interviewData = req.body.interview_details || [];
    for (let i = 0; i < interviewData?.length; i++) {
        interviewData[i]["interview_assigned"] = true;
        interviewData[i]['candidate_id'] = req.body.candidate_id;
        if (interviewData[i]?.interview_status == 'pending') {
            await interviewManagementService.addUpdateInterviewer(interviewData[i], interviewData[i]?._id);
        }
    }
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, interviewData, httpStatus.OK);
});

const fillInterviewForm = catchAsync(async (req, res) => {
    const {_id, interview_status, feedback_form} = req.body;
    const interviewData = await interviewManagementService.updateInterviewerData({ _id: _id, interview_status: 'pending' }, {
        $set: {
            interview_status: interview_status,
            feedback_form: feedback_form || {}
        }
    });
    const candidateId = interviewData?.status && interviewData?.data ? interviewData?.data?.candidate_id : '';
    if(candidateId && interview_status == 'approved'){
        const getPendingInterviewerData = await interviewManagementService.queryInterviewerData({candidate_id: candidateId, interview_status: 'pending'});
        if(getPendingInterviewerData?.status == false){
            await candidateService.updateCandidate({_id: candidateId}, {$set: {final_selection: true}});
        }
    }
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, interviewData, httpStatus.OK);
});

const getAssignedInterview = catchAsync(async (req, res) => {
    const {query_type, interview_status} = req.query;
    const user = getSessionData(req);
    let pipeline = [];
    let filters = {
        interviewer: user?.id,
        candidate_id: {$ne: null}
    }
    if(query_type == 'candidate'){
        pipeline = [{ 
            "$match": 
            {
                offer_letter_status: 'accepted',
            }
        }];
    }else{
        if(!interview_status){
            return errorResponse(req, res, messages.alert.INTERVIEW_STATUS, httpStatus.BAD_REQUEST);
        }
        filters['interview_status'] = interview_status;
    }
    const interviewerData = await interviewManagementService.queryInterviewerDataWithPagination(filters, req.query, pipeline);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, interviewerData, httpStatus.OK);
});

const getInterviewDetails = catchAsync(async (req, res) => {
    const interviewerData = await interviewManagementService.getFullInterviewDetails({_id: req.query._id});
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, interviewerData, httpStatus.OK);
});


module.exports = {
    createUpdateQuestions,
    getQuestionByStage,
    getInterviewer,
    assignInterview,
    fillInterviewForm,
    getAssignedInterview,
    getInterviewDetails,
};