const httpStatus = require('http-status');
const path = require('path');
const catchAsync = require('../../../helpers/catchAsync.js');
const {
    policyService,
    employeeService,
    roleService,
} = require('../services');
const { successResponse, errorResponse } = require('../../../helpers');
const { messages } = require('../../../config/constants.js');
const { getSessionData } = require('../utils/appHelper.js');
const { mergePDFFiles } = require('../../../helpers/fileHandler');
const  mongoose = require('mongoose');

const createPolicyCategory = catchAsync(async (req, res) => {
  const user = getSessionData(req);
  req.body['created_by'] = user?.id;
  const policyCategoryData = await policyService.createPolicyCategory(req.body);
  return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, policyCategoryData,  httpStatus.OK);
});

const getPolicyCatgory = catchAsync(async (req, res) => {
    const policyCategoryData = await policyService.queryPolicyCategory({}, req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, policyCategoryData,  httpStatus.OK);
});

const updatePolicyCategory = catchAsync(async (req, res) => {
    const policyCategoryData = await policyService.updatePolicyCategory({_id: req.body._id}, {$set: req.body});
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, policyCategoryData,  httpStatus.OK);
});

const createPolicy = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    req.body['created_by'] = user?.id;
    req.body['file_name'] = req.file?.filename || '';
    req.body['file_size'] = req.file?.size || '';
    const policyData = await policyService.createPolicy(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, policyData,  httpStatus.OK);
});
  
const updatePolicy = catchAsync(async (req, res) => {
    req.body['file_name'] = req.file?.filename || '';
    req.body['file_size'] = req.file?.size || '';
    const policyData = await policyService.updatePolicy({_id: req.body._id}, {$set: req.body});
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, policyData,  httpStatus.OK);
});

const getPolicy = catchAsync(async (req, res) => {
    const policyData = await policyService.queryPolicy({}, req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, policyData,  httpStatus.OK);
});

const getPolicyInCategory = catchAsync(async (req, res) => {
    const policyData = await policyService.queryAllPolicyInCategory({}, req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, policyData,  httpStatus.OK);
});

const getPolicyByCategoryId = catchAsync(async (req, res) => {
    const policyData = await policyService.queryPolicy({category_id: req.query.category_id}, req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, policyData,  httpStatus.OK);
});

const deletePolicyCategory = catchAsync(async (req, res) => {
    const policyCategoryData = await policyService.deletePolicyCategory(req.body._id);
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, policyCategoryData,  httpStatus.OK);
});

const deletePolicy = catchAsync(async (req, res) => {
    const policyData = await policyService.deletePolicy(req.body._id);
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, policyData,  httpStatus.OK);
});

const acceptPolicyByUser = catchAsync(async (req, res) => {
    const user = getSessionData(req);
        const {employee_id, policyAccepted, userSign} = req.body;
        const employeeData = await employeeService.updateUserByFilter({_id: employee_id},{accepted_policies:policyAccepted ,policy_sign: userSign});
        const getRole = await roleService.queryAllRoles({name:"Employee"})
        await employeeService.updateUserByFilter({_id: mongoose.Types.ObjectId(user.id)},{role_id:getRole.data[0]._id})
        return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, employeeData,  httpStatus.OK);
});

const getPolicyCategoryList = catchAsync (async (req, res) => {
    const policyData = await policyService.queryPolicyCategoryList({is_active: true});
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, policyData,  httpStatus.OK);
});


const getPolicyList = catchAsync (async (req, res) => {
    const policyData = await policyService.queryPolicyList({is_active: true});
    policyData && policyData?.data?.map((item) => {
        item.file = `https://saas.glueple.com:3001/policies/${item?.file_name}`
    })
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, policyData,  httpStatus.OK);
});

module.exports = {
    createPolicyCategory,
    getPolicyCatgory,
    updatePolicyCategory,
    createPolicy,
    updatePolicy,
    getPolicy,
    getPolicyInCategory,
    getPolicyByCategoryId,
    deletePolicyCategory,
    deletePolicy,
    acceptPolicyByUser,
    getPolicyCategoryList,
    getPolicyList,
};