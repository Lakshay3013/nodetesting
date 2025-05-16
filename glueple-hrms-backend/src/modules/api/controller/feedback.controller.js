const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const {
    feedbackService,
} = require('../services');
const { successResponse, errorResponse } = require('../../../helpers');
const { messages } = require('../../../config/constants.js');
const { getSessionData } = require('../utils/appHelper.js');
const { convertDateByMoment, addInMomentDate, dateFormat } = require('../utils/dateTimeHelper.js');
const mongoose = require("mongoose")


const createFeedbackTeam = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    req.body['created_by'] = user?.id;
    const createFeedbackTeamData = await feedbackService.createFeedbackTeam(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, createFeedbackTeamData, httpStatus.OK);
});

const getAllFeedbackTeams = catchAsync(async (req, res) => {
   const  feedbackTeamsData = await feedbackService.getAllFeedbackTeams({});
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, feedbackTeamsData, httpStatus.OK);
});

const createFeedback = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    req.body['created_by'] = user?.id;
    const {feedback_to} =req.body
    let  createFeedbackData 
    for(let i=0;i< feedback_to?.length ;i++){
        req.body["feedback_to"]=mongoose.Types.ObjectId(feedback_to[i])
        createFeedbackData= await feedbackService.createFeedback(req.body);
    }
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, createFeedbackData, httpStatus.OK);
});

const givenFeedback = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    const givenFeedbackData = await feedbackService.givenFeedback({created_by:mongoose.Types.ObjectId(user?.id)});
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, givenFeedbackData, httpStatus.OK);
});


const getReceivedFeedbackOnFilter = catchAsync(async (req, res) => {
    const user = getSessionData(req);
  const {type}=req.query
    let filter ={
        feedback_to:mongoose.Types.ObjectId(user?.id)
    }
    
    const getReceivedFeedbackOnFilterData = await feedbackService.getReceivedFeedbackOnFilter(req.query,filter);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getReceivedFeedbackOnFilterData, httpStatus.OK);
});

const getFeedbackDashboardData = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    const getFeedbackDashboardData = await feedbackService.getFeedbackDashboardData({_id:mongoose.Types.ObjectId(user?.id)});
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getFeedbackDashboardData, httpStatus.OK);
});

module.exports = {
    createFeedbackTeam,
    getAllFeedbackTeams,
    createFeedback,
    givenFeedback,
    getReceivedFeedbackOnFilter,
    getFeedbackDashboardData
};