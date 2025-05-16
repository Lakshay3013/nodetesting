const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const {
    roleService,
    employeeService,
} = require('../services');
const { successResponse, errorResponse } = require('../../../helpers');
const { messages } = require('../../../config/constants.js');
const { getSessionData } = require('../utils/appHelper.js');
const mongoose = require('mongoose')

const getAllRoles = catchAsync(async (req, res) => {
    const roleData = await roleService.queryAllRoles({});
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, roleData, httpStatus.OK);
});

const createRoles = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    req.body['created_by'] = user?.id;
    const create = await roleService.createRoles(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, create,  httpStatus.OK);
})

const updateRole = catchAsync(async(req, res)=>{
     const updateRole = await roleService.updateRole({_id: req.body._id}, req.body);
      return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, updateRole,  httpStatus.OK);
})

const deleteRole = catchAsync(async(req, res)=>{
 const deleteRole = await roleService.deleteRole({_id: req.body._id});
  return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, deleteRole,  httpStatus.OK);
})

const getRoleList = catchAsync(async(req, res)=>{
     const getAllData = await roleService.getRoleList({}, req.query);
      return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getAllData,  httpStatus.OK);
})

const assignRole = catchAsync(async(req, res)=>{
     const {role_id, employee_ids} = req.body
     let updateEmployee = null
     if(employee_ids && employee_ids?.length){
        updateEmployee = await employeeService.updateUserByFilter({_id:mongoose.Types.ObjectId(employee_ids[i])},{role_id:role_id})
     }
     return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, updateEmployee, httpStatus.OK);
      
})

module.exports = {
    getAllRoles,
    createRoles,
    updateRole,
    deleteRole,
    getRoleList,
    assignRole
};