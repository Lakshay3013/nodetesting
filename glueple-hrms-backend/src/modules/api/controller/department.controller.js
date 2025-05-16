const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const {
  departmentService, 
  employeeService,
} = require('../services');
const { successResponse, errorResponse } = require('../../../helpers');
const { messages } = require('../../../config/constants.js');
const { getSessionData } = require('../utils/appHelper.js');
const mongoose = require('mongoose');
const { http } = require('winston');

const getDepartment = catchAsync(async (req, res) => {
  const departmentData = await departmentService.queryDepartment({}, req.query);
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, departmentData,  httpStatus.OK);
});

const createDepartment = catchAsync(async (req, res) => {
  const user = getSessionData(req);
  req.body['created_by'] = user?.id;
  const departmentData = await departmentService.createDepartment(req.body);
  return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, departmentData,  httpStatus.OK);
});

const updateDepartment = catchAsync(async (req, res) => {
  const departmentData = await departmentService.updateDepartment({_id: req.body._id}, req.body);
  return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, departmentData,  httpStatus.OK);
});

const deleteDepartment = catchAsync(async (req, res) => {
  const getEmployeeOfDepartment = await employeeService.getSingleUser({department_id: req.body._id},{});
  if(getEmployeeOfDepartment && getEmployeeOfDepartment?.status){
    const departmentData = await departmentService.updateDepartment({_id: req.body._id}, {deleted_at: new Date()});
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, departmentData,  httpStatus.OK);
  }else{
    const departmentData = await departmentService.deleteDepartment({_id: req.body._id});
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, departmentData,  httpStatus.OK);
  }
});

const assignDepartmentHod = catchAsync (async (req, res) => {
  const departmentData = await departmentService.updateDepartment({_id: req.body._id}, {head_id: req.body.head_id});
  return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, departmentData,  httpStatus.OK);
});

const getDepartmentDataList = catchAsync (async (req, res) => {
  const listType = req.query.list_type;
  // delete req.query['list_type'];  add filters as object
  const filters = {
    is_active: true,
    deleted_at: {$eq: null}
  };
  let departmentData = [];
  if(listType == 'mrf'){
    const user = getSessionData(req);
    filters["_id"] = user?.id;
    departmentData = await departmentService.getDepartmentDataListForMRF(filters);
  }else{
    departmentData = await departmentService.getDepartmentDataList(filters);
  }
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, departmentData,  httpStatus.OK);
});

const createSubDepartment = catchAsync(async(req, res)=>{
  const user = getSessionData(req);
  req.body["created_by"] = user.id;
  const addSubDepartment = await departmentService.createSubDepartment(req.body);
  return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, addSubDepartment,httpStatus.OK);
});

const getSubDepartment = catchAsync(async(req, res)=>{
  const departmentData = await departmentService.getSubDepartment({}, req.query);
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, departmentData,  httpStatus.OK);
});

const updateSubDepartment = catchAsync(async(req, res)=>{
  const updateSubDepartment = await departmentService.updateSubDepartment({_id:mongoose.Types.ObjectId(req.body._id)}, req.body);
  return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, updateSubDepartment, httpStatus.OK)
});

const getAllSubDepartment = catchAsync(async(req, res)=>{
  const getAll = await departmentService.getAllSubDepartment({});
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getAll, httpStatus.OK)
});

const createProject = catchAsync(async(req, res)=>{
  const user = getSessionData(req);
  req.body["created_by"] = user?.id;
  const createProject = await departmentService.createProject(req.body);
  return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, createProject, httpStatus.OK);
});

const getProject = catchAsync(async(req, res)=>{
  const getProject = await departmentService.getProject({},req.query);
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getProject, httpStatus.OK)
});

const updateProject = catchAsync(async(req, res)=>{
  const updateProject = await departmentService.updateProject({_id:mongoose.Types.ObjectId(req.body._id)},req.body);
  return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, updateProject, httpStatus.OK);
});

const getAllProject = catchAsync(async(req, res)=>{
  const getAllProject = await departmentService.getAllProject({});
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getAllProject, httpStatus.OK)
});

const createSkill = catchAsync(async(req, res)=>{
  const user = getSessionData(req);
  req.body["created_by"] = user?.id;
  const createSkill = await departmentService.createSkill(req.body);
  return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, createSkill, httpStatus.OK);
});

const getSkill = catchAsync(async(req, res)=>{
  const getSkill = await departmentService.getSkill({},req.query);
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getSkill, httpStatus.OK)
});

const updateSkill = catchAsync(async(req, res)=>{
  const updateSkill = await departmentService.updateSkill({_id:mongoose.Types.ObjectId(req.body._id)},req.body);
  return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, updateSkill, httpStatus.OK);
});

const getAllSkill = catchAsync(async(req, res)=>{
  const getAllSkill = await departmentService.getAllSkill({});
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getAllSkill, httpStatus.OK)
});

const assignProject = catchAsync(async(req, res)=>{
  const user = getSessionData(req);
  req.body["created_by"] = user?.id;
  const create = await departmentService.assignProject(req.body);
  return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, create, httpStatus.OK);
});

const getAssignProject = catchAsync(async(req, res)=>{
  const getAssign = await departmentService.getAssignProject(req.query);
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getAssign, httpStatus.OK)
})


const assignSkill = catchAsync(async(req, res)=>{
  const user = getSessionData(req);
  req.body["created_by"] = user?.id;
  const create = await departmentService.assignSkill(req.body);
  return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, create, httpStatus.OK);
});

const getAssignSkill = catchAsync(async(req, res)=>{
  const getAssign = await departmentService.getAssignSkill(req.query);
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getAssign, httpStatus.OK)
})

const getSubDepartmentByDepartment = catchAsync(async(req, res)=>{
  const getData = await departmentService.getAllSubDepartment({department_id:mongoose.Types.ObjectId(req.query.department_id)});
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getData, httpStatus.OK);
})




module.exports = {
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  assignDepartmentHod,
  getDepartmentDataList,
  createSubDepartment,
  getSubDepartment,
  updateSubDepartment,
  getAllSubDepartment,
  createProject,
  getProject,
  updateProject,
  getAllProject,
  createSkill,
  getSkill,
  updateSkill,
  getAllSkill,
  assignProject,
  assignSkill,
  getAssignProject,
  getAssignSkill,
  getSubDepartmentByDepartment
};