const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const {approvalManagementService} = require('../services');
const { successResponse, errorResponse } = require('../../../helpers');
const { messages } = require('../../../config/constants.js');
const { getSessionData } = require('../utils/appHelper.js');

const createHierarchy = catchAsync(async (req, res) => {
  const user = getSessionData(req);
  req.body['created_by'] = user?.id;
  const hierarchyData = await approvalManagementService.addApprovalHierarchy(req.body);
  return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, hierarchyData,  httpStatus.OK);
});


const getHierarchy = catchAsync(async (req, res) => {
    const hierarchyData = await approvalManagementService.queryHierarchy({}, req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, hierarchyData,  httpStatus.OK);
  });

  const updateHierarchy = catchAsync(async(req,res)=>{
    const update = await approvalManagementService.updateHierarchy({_id:req.body._id}, req.body);
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA,update,httpStatus.OK);

  });

 const deleteHierarchy = catchAsync(async(req, res)=>{
  const checkHierarchy = await approvalManagementService.querySingleHierarchy({_id:req.body._id})
  if(!checkHierarchy.status){
    return errorResponse(req, res, messages.alert.Data_NOT_FOUND, httpStatus.BAD_REQUEST);
  }
  const deleteQuery = await approvalManagementService.deleteHierarchy({_id:req.body._id})
  return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, deleteQuery,  httpStatus.OK);
 })

module.exports = {
  createHierarchy,
  getHierarchy,
  updateHierarchy,
  deleteHierarchy
};