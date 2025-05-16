const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const { employeeService, roleService } = require('../services');
const { successResponse, errorResponse, encryptPassword, generateRandomPassword } = require('../../../helpers');
const { messages } = require('../../../config/constants.js');
const { getSessionData, getServiceResFormat } = require('../utils/appHelper.js');
const mongoose = require('mongoose')
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const f = require('session-file-store');

const getProfile = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    const userId = req.query._id ? req.query._id : user?.id;
    const employeeData = await employeeService.getProfile({ _id: mongoose.Types.ObjectId(userId)});
    if(!employeeData.status){
        return errorResponse(req, res, messages.alert.Data_NOT_FOUND,httpStatus.BAD_REQUEST)
    }
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, employeeData, httpStatus.OK);
});

const getEmployeeByIds = catchAsync(async (req, res) => {
    const empIds = req.body?.ids && req.body?.ids?.length ? req.body?.ids : [];
    const employeeData = await employeeService.queryUser({ _id: { '$in': empIds } }, req.body);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, employeeData, httpStatus.OK);
});

const getEmployeeForReportingManager = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    const employeeData = await employeeService.queryUserByFilter({ reported_to: user?.id, account_status: 'active' });
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, employeeData, httpStatus.OK);
});

const getAllEmployee = catchAsync( async(req, res)=>{
    const getAllEmp = await employeeService.queryUserByFilter({account_status:"active"})
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getAllEmp,httpStatus.OK)
})

const getAllEmployeeList = catchAsync( async(req, res)=>{
    const {employee_ids,department_ids,status,designation_ids} = req.body
    const filter = {};
    if (status) {
      filter.account_status = status;
    }
    if (employee_ids?.length > 0) {
      const employeeIds = employee_ids.map(id => mongoose.Types.ObjectId(id));
      filter._id = { $in: employeeIds };
    }
  
    if (department_ids?.length > 0) {
      const departmentIds = department_ids.map(id => mongoose.Types.ObjectId(id));
      filter.department_id = { $in: departmentIds };
    }
    if(designation_ids?.length > 0){
        const designationIds = designation_ids.map(id=>mongoose.Types.ObjectId(id));
        filter.designation_id = { $in: designationIds }
    }
    const getAllEmp = await employeeService.queryUser(filter,req.body)
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getAllEmp,httpStatus.OK)
})

const getUserOnRole = catchAsync(async (req, res) => {
    const { role_id } = req.query;
    const employeeData = await employeeService.queryUserByFilter({ role_id: role_id });
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, employeeData, httpStatus.OK);
});

const aadhaarVerifiedByEmployee = catchAsync(async (req, res) => {
    const {employee_id, is_aadhar_verified} = req.body;
        const employeeData = await employeeService.updateUserByFilter({_id: employee_id},{is_aadhar_verified: is_aadhar_verified});
        return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, employeeData,  httpStatus.OK);
});

const createEmployee = catchAsync(async (req, res) => {
    const randomPassword = generateRandomPassword(10);
    const encryptedPassword = await encryptPassword("Admin@123");
    req.body['password'] = encryptedPassword;
    req.body['account_status'] = 'active';
    const getRole = await roleService.queryAllRoles({name:"Onboarding"})
    req.body['role_id'] = getRole.status ? getRole.data[0]._id : ''
    const createEmployeeData = await employeeService.createEmployee(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, createEmployeeData, httpStatus.OK);
});

const updateEmployeeDetails = catchAsync(async(req, res)=>{
    const updateEmployee = await employeeService.updateUserByFilter({_id:mongoose.Types.ObjectId(req.body._id)},req.body);
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA,updateEmployee, httpStatus.OK)
})

const bulkUploadEmployee = catchAsync(async(req, res)=>{
    const file = req.file
    console.log("sdfdsf",file)
      if (!file) {
          return errorResponse(req, res, messages.alert.FILE_NOT_FOUND, httpStatus.BAD_REQUEST);
      }
      if (!file.originalname.match(/\.(xlsx|csv)$/)) {
          return errorResponse(req, res, messages.alert.INVALID_FILE, httpStatus.BAD_REQUEST);
      }
      const getRole = await roleService.queryAllRoles({name:"Onboarding"})
      const encryptedPassword = await encryptPassword("Admin@123");
      const workbook = xlsx.readFile(req.file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const employeeData = xlsx.utils.sheet_to_json(sheet);
      if(employeeData.length == 0){
        return errorResponse(req, res, messages.alert.Data_NOT_FOUND, httpStatus.BAD_REQUEST);
      }
      const updateEmployee = await employeeService.bulkUploadEmployee(employeeData,getRole,encryptedPassword)
      return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA,updateEmployee, httpStatus.OK)
})

const updateProfile = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    

})

const generateEmployeeId = catchAsync(async(req,res)=>{
    const response = getServiceResFormat()
    const getLastEmployee = await employeeService.getLastEmployee({})
    if(!getLastEmployee.status){
        return errorResponse(req, res, messages.alert.ID_NOT_FOUND, httpStatus.BAD_REQUEST);
    }
    let nextId = 'QD100'; 
    let lastEmp = getLastEmployee.data
  if (lastEmp.length > 0 && typeof lastEmp[0].emp_id === 'string') {
    const lastId = lastEmp[0].emp_id.trim(); 

    const match = lastId.match(/^([A-Za-z]+)(\d+)$/); 
    if (match) {
      const prefix = match[1];                
      const numericPart = match[2];           
      const nextNumber = parseInt(numericPart) + 1;
      const paddedNumber = nextNumber.toString().padStart(numericPart.length, '0');
      nextId = prefix + paddedNumber;  
    }
    }
    response.data = {emp_id:nextId}
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA,response, httpStatus.OK)

    
})

module.exports = {
    getProfile,
    getEmployeeByIds,
    getEmployeeForReportingManager,
    aadhaarVerifiedByEmployee,
    createEmployee,
    getAllEmployee,
    getUserOnRole,
    getAllEmployeeList,
    updateEmployeeDetails,
    bulkUploadEmployee,
    updateProfile,
    generateEmployeeId
};