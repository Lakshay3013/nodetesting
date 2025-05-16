const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const config = require('../../../config/config.js');
const { dropdownMastersService } = require('../services');
const { successResponse, errorResponse } = require('../../../helpers');
const { messages, dropdownMasters } = require('../../../config/constants.js');
const { getSessionData, getServiceResFormat, convertToSnakeCase } = require('../utils/appHelper.js');
const mongoose = require('mongoose')

const getFilteredDropdownMastersData = catchAsync(async (req, res) => {
  const data = {
    deleted_at: { $eq: null },
    is_active: true,
  };
  data['category_short_name'] = req.body.category;
  const filter =req.body.category ? {category_short_name: { "$in": req.body.category }} :req.body.category
  const dropdownData = await dropdownMastersService.queryFilteredDropdownData(filter);
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, dropdownData, httpStatus.OK);
});

const getDropdownMastersData = catchAsync(async (req, res) => {
  const dropdownData = await dropdownMastersService.queryDropdownData({ deleted_at: { $eq: null } }, req.query);
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, dropdownData, httpStatus.OK);
});

const saveDropdownData = catchAsync(async (req, res) => {
  const user = getSessionData(req);
  req.body['created_by'] = user?.id;
  const dropdownData = await dropdownMastersService.saveDropdownData(req.body);
  return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, dropdownData, httpStatus.OK);
});

const deleteDropdownData = catchAsync(async (req, res) => {
  const dropdownData = await dropdownMastersService.updateDropdownData(req.body, { $set: { deleted_at: new Date() } });
  return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, dropdownData, httpStatus.OK);
});

const getDropdownMasterConstantData = catchAsync(async (req, res) => {
  const response = getServiceResFormat();
  response.data = dropdownMasters;
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response,  httpStatus.OK);
});

const updateDropdownData = catchAsync(async (req, res) => {
  const dropdownData = await dropdownMastersService.updateDropdownData({ _id: req.body._id }, { $set: req.body });
  return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, dropdownData, httpStatus.OK);
});

const saveCategory = catchAsync(async(req, res)=>{
  const user = getSessionData(req);
  req.body["created_by"] = user?.id
  req.body['category_short_name'] = convertToSnakeCase(req.body.name)
  const saveCategory = await dropdownMastersService.saveMasterCategory(req.body);
  return successResponse(req,res, messages.alert.SUCCESS_SAVE_DATA, saveCategory, httpStatus.OK);
})

const getMasterCategory = catchAsync(async(req, res)=>{
  const getMasterCategory = await dropdownMastersService.getMasterCategory({},req.query);
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getMasterCategory, httpStatus.Ok);
})

const getAllMasterCategory = catchAsync(async(req, res)=>{
  const getAllMasterCategory = await dropdownMastersService.getAllMasterCategory({});
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA,getAllMasterCategory, httpStatus.OK);

})

const updateMasterCategory = catchAsync(async(req, res)=>{
  req.body['category_short_name'] = convertToSnakeCase(req.body.name)
  const updateMasterCategory = await dropdownMastersService.updateMasterCategory({_id:mongoose.Types.ObjectId(req.body._id)},req.body);
  return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, updateMasterCategory, httpStatus.OK)

})

const deleteMasterCategory = catchAsync(async(req, res)=>{
  const deleteMasterCategory = await dropdownMastersService.deleteMasterCategory({_id:mongoose.Types.ObjectId(req.body._id)});
  return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, deleteMasterCategory, httpStatus.OK); 

})

module.exports = {
  getFilteredDropdownMastersData,
  getDropdownMastersData,
  saveDropdownData,
  deleteDropdownData,
  getDropdownMasterConstantData,
  updateDropdownData,
  saveCategory,
  getMasterCategory,
  getAllMasterCategory,
  updateMasterCategory,
  deleteMasterCategory
};