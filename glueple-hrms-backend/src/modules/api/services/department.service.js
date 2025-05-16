const departmentSchema = require('../../../models/department.model');
const employeeSchema = require('../../../models/employee.model');
const httpStatus = require('http-status');
const ApiError = require('../../../helpers/ApiError');
const { getServiceResFormat, getAggregatePagination, getDb } = require('../utils/appHelper');
const subDepartmentSchema = require('../../../models/subdepartments.mode');
const mongoose = require('mongoose');
const projectSchema = require('../../../models/project.model');
const skillSchema = require('../../../models/skill.model');
const { filter } = require('bluebird');
const { options } = require('joi');
const employeeSkillSchema = require('../../../models/employeeSkill.model');
const employeeProjectSchema = require('../../../models/employeeProject.model');
const { messages } = require('../../../config/constants');

const createDepartment = async (data) => {
  const res = getServiceResFormat();
  let db = getDb()
    const departmentModel = departmentSchema(db);
  const nameExistData = await queryDepartment({ name: data?.name }, {});
  if (nameExistData && nameExistData?.status) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Department Name already exists.');
  }
  const shortNameExistData = await queryDepartment({ short_name: data?.short_name }, {});
  if (shortNameExistData && shortNameExistData?.status) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Department Short Name already exists.');
  }
  const queryRes = await departmentModel.create(data);
  if (queryRes?._id) {
    res.data = queryRes;
  } else {
    res.status = false;
  }
  return res;
};

const queryDepartment = async (filter, options) => {
  const res = getServiceResFormat();
  let db = getDb()
    const departmentModel = departmentSchema(db);
  const totalRecords = await departmentModel.find(filter).count();
  options = getAggregatePagination(options, totalRecords);
  const records = await departmentModel.aggregate([
    { "$match": filter },
    {
      "$lookup":
      {
        from: "employees",
        localField: "_id",
        foreignField: "department_id",
        as: "emp_count",
      }
    },
    {
      "$set":
      {
        emp_count: { "$size": "$emp_count" },
      }
    },
    options?.skips,
    options?.limits
  ]).allowDiskUse();
  const queryRes = {
    recordsTotal: totalRecords,
    recordsFiltered: totalRecords,
    totalPages: options?.totalPages,
    data: records
  }
  if (queryRes && queryRes?.data?.length) {
    res.data = queryRes;
  } else {
    res.status = false;
  }
  return res;
};

const updateDepartment = async (filter, update) => {
  let db = getDb()
    const departmentModel = departmentSchema(db);
  const existData = await getDepartmentDataList({ $or: [{ name: update?.name }, { short_name: update?.short_name }] }, {});
  if (existData?.status) {
    const filteredName = existData?.data?.filter((item) => (item?.name == update?.name && item?._id != update?._id));
    if (filteredName && filteredName?.length > 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Department Name already exists.');
    }
    const filteredShortName = existData?.data?.filter((item) => (item?.short_name == update?.short_name && item?._id != update?._id));
    if (filteredShortName && filteredShortName?.length > 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Department Short Name already exists.');
    }
  }
  const queryRes = await departmentModel.findOneAndUpdate(filter, { $set: update }, { new: true });
  if (queryRes?._id) {
    queryRes.data = queryRes;
  } else {
    queryRes.status = false;
  }
  return queryRes;
}

const deleteDepartment = async (filter) => {
  let db = getDb()
    const departmentModel = departmentSchema(db);
  const queryRes = await departmentModel.findOneAndDelete(filter);
  if (queryRes?._id) {
    queryRes.data = queryRes;
  } else {
    queryRes.status = false;
  }
  return queryRes;
}

const getDepartmentDataList = async (condition) => {
  const res = getServiceResFormat();
  let db = getDb()
    const departmentModel = departmentSchema(db);
  const queryRes = await departmentModel.aggregate([
    { "$match": condition },
    {
      "$set":
      {
        label: "$name",
        value: "$_id",
      }
    },
  ]).allowDiskUse();
  if (queryRes && queryRes?.length) {
    res.data = queryRes;
  } else {
    res.status = false;
  }
  return res;
}

const getDepartmentDataListForMRF = async (condition) => {
let db = getDb()
const departmentModel = departmentSchema(db);
const employeeModel = employeeSchema(db);
  const res = getServiceResFormat();
  const getEmployeeRelatedDepartment = await employeeModel.aggregate([
    { $match: condition },
    {
      $lookup: {
        from: "departments",
        localField: "department_id",
        foreignField: "_id",
        as: "userDepartment"
      }
    },
    { $unwind: { path: "$userDepartment", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "employees",
        localField: "_id",
        foreignField: "reported_to",
        as: "subordinates"
      }
    },
    { $unwind: { path: "$subordinates", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "departments",
        localField: "subordinates.department_id",
        foreignField: "_id",
        as: "subordinatesDepartment"
      }
    },
    { $unwind: { path: "$subordinatesDepartment", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: "$_id",
        distinctDepartments: {
          $addToSet: {
            $cond: {
              if: { $ne: ["$userDepartment", null] },
              then: "$userDepartment",
              else: "$$REMOVE"
            }
          }
        },
        subordinateDepartments: {
          $addToSet: {
            $cond: {
              if: { $ne: ["$subordinatesDepartment", null] },
              then: "$subordinatesDepartment",
              else: "$$REMOVE"
            }
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        distinctDepartments: {
          $setUnion: [
            "$distinctDepartments",
            "$subordinateDepartments"
          ]
        }
      }
    },
    {
      $project: {
        distinctDepartments: {
          $map: {
            input: "$distinctDepartments",
            as: "dept",
            in: {
              _id: "$$dept._id",
              value: "$$dept._id",
              label: "$$dept.name",
              short_name: "$$dept.short_name"
            }
          }
        }
      }
    }
  ]).allowDiskUse() || {};
  if (Object.hasOwn(condition, '_id')) {
    delete condition['_id'];
  }
  const getEmptyDepartment = await departmentModel.aggregate([
    { $match: condition },
    {
      $lookup: {
        from: "employees",
        localField: "_id",
        foreignField: "department_id",
        as: "employees"
      }
    },
    {
      $match: {
        "employees": { $size: 0 }
      }
    },
    {
      $project: {
        "label": "$name",
        "value": "$_id",
        "short_name": "$short_name",
        "_id": "$_id"
      }
    }
  ]).allowDiskUse() || [];
  const queryRes = getEmployeeRelatedDepartment && getEmployeeRelatedDepartment?.distinctDepartments ? getEmployeeRelatedDepartment?.distinctDepartments?.concat(getEmptyDepartment) : getEmptyDepartment;
  if (queryRes && queryRes?.length) {
    res.data = queryRes;
  } else {
    res.status = false;
  }
  return res;
}

const createSubDepartment = async(data)=>{
  const res = getServiceResFormat();
  let db = getDb()
  const subDepartmentModel = subDepartmentSchema(db);
  const existData = await getDepartmentDataList({_id:mongoose.Types.ObjectId(data.department_id)});
  if(!existData.status){
    throw new ApiError(httpStatus.BAD_REQUEST, 'Department id not exists.');
  }
  const record = await subDepartmentModel.create(data);
  if(record){
    res.data = record;
  }else{
    res.status = false
  }
  return res;
}

const getSubDepartment = async(filter, options)=>{
  const res = getServiceResFormat();
  let db = getDb()
  const subDepartmentModel = subDepartmentSchema(db);
  const totalRecords = await subDepartmentModel.find(filter).count();
  options = getAggregatePagination(options, totalRecords);
  const records = await subDepartmentModel.aggregate([
    { "$match": filter },
    {
      "$lookup":
      {
        from: "departments",
        localField: "department_id",
        foreignField: "_id",
        as: "department_details",
      }
    },
    { $unwind: { path: "$department_details", preserveNullAndEmptyArrays: true } },
    {
      "$lookup":
      {
        from: "employees",
        localField: "function_head_id",
        foreignField: "_id",
        as: "function_head_details",
      }
    },
    { $unwind: { path: "$function_head_details", preserveNullAndEmptyArrays: true } },
    {
      "$set":
      {
        department_name:"$department_details.name",
        department_value:"$department_details._id",
        function_head_name:"$function_head_details.name",
        function_head_value:"$function_head_details._id",
      },
    },
    {
      "$project":{
        department_details:0,
        function_head_details:0
      }
    },
    options?.skips,
    options?.limits
  ]).allowDiskUse();
  const queryRes = {
    recordsTotal: totalRecords,
    recordsFiltered: totalRecords,
    totalPages: options?.totalPages,
    data: records
  }
  if (queryRes && queryRes?.data?.length) {
    res.data = queryRes;
  } else {
    res.status = false;
  }
  return res;
}

const updateSubDepartment = async(filter, update)=>{
  const res = getServiceResFormat();
  let db = getDb()
  const subDepartmentModel = subDepartmentSchema(db);
  const existData = await getDepartmentDataList({_id:mongoose.Types.ObjectId(update.department_id)});
  if(!existData.status){
    throw new ApiError(httpStatus.BAD_REQUEST, 'Department id not exists.');
  }
  const queryRes = await subDepartmentModel.findOneAndUpdate(filter, { $set: update }, { new: true });
  if(queryRes){
    res.data = queryRes
  }else{
    res.status = false
  }
  return res;

}
const getAllSubDepartment = async(filter)=>{
  const res = getServiceResFormat();
  let db = getDb()
  const subDepartmentModel = subDepartmentSchema(db);
  const record = await subDepartmentModel.aggregate([
    { "$match": filter },
    {
      "$set":
      {
        label: "$name",
        value: "$_id",
      }
    },
  ]).allowDiskUse();
  if(record && record.length){
    res.data = record
  }else{
    res.status = false
  }
  return res;

}

const createProject = async(data)=>{
  const res = getServiceResFormat();
  let db = getDb()
  const projectModel = projectSchema(db);
  const record = await projectModel.create(data);
  if(record){
    res.data = record
  }else{
    res.status = false
  }
  return res;
}

const getProject = async(filter, options)=>{
  const res = getServiceResFormat();
  let db = getDb()
  const projectModel = projectSchema(db);
  const totalRecords = await projectModel.find(filter).count();
  options = getAggregatePagination(options, totalRecords);
  const records = await projectModel.aggregate([
    { "$match": filter },
    {
      "$lookup":
      {
        from: "departments",
        localField: "department_id",
        foreignField: "_id",
        as: "department_details",
      }
    },
    { $unwind: { path: "$department_details", preserveNullAndEmptyArrays: true } },
    {
      "$lookup":
      {
        from: "employees",
        localField: "function_head_id",
        foreignField: "_id",
        as: "function_head_details",
      }
    },
    { $unwind: { path: "$function_head_details", preserveNullAndEmptyArrays: true } },
    {
      "$lookup":
      {
        from: "sub_departments",
        localField: "sub_department_id",
        foreignField: "_id",
        as: "sub_departments_details",
      }
    },
    { $unwind: { path: "$sub_departments_details", preserveNullAndEmptyArrays: true } },
    {
      "$lookup":
      {
        from: "employees",
        localField: "project_manager_id",
        foreignField: "_id",
        as: "project_manager_details",
      }
    },
    { $unwind: { path: "$project_manager_details", preserveNullAndEmptyArrays: true } },
    {
      "$set":
      {
        department_name:"$department_details.name",
        function_head_name:"$function_head_details.name",
        sub_department_name:"$sub_departments_details.name",
        project_manager_name:"$project_manager_details.name"

      },
    },
    {
      "$project":{
        department_details:0,
        function_head_details:0,
        sub_departments_details:0,
        project_manager_details:0
      }
    },
    options?.skips,
    options?.limits
  ]).allowDiskUse();
  const queryRes = {
    recordsTotal: totalRecords,
    recordsFiltered: totalRecords,
    totalPages: options?.totalPages,
    data: records
  }
  if (queryRes && queryRes?.data?.length) {
    res.data = queryRes;
  } else {
    res.status = false;
  }
  return res;
}

const updateProject = async(filter, update)=>{
  const res = getServiceResFormat();
  let db = getDb()
  const projectModel = projectSchema(db);
  const existData = await getDepartmentDataList({_id:mongoose.Types.ObjectId(update.department_id)});
  if(!existData.status){
    throw new ApiError(httpStatus.BAD_REQUEST, 'Department id not exists.');
  }
  const queryRes = await projectModel.findOneAndUpdate(filter, { $set: update }, { new: true });
  if(queryRes){
    res.data = queryRes
  }else{
    res.status = false
  }
  return res;
}

const getAllProject = async(filter)=>{
  const res = getServiceResFormat();
  let db = getDb()
  const projectModel = projectSchema(db);
  const record = await projectModel.aggregate([
    { "$match": filter },
    {
      "$set":
      {
        label: "$name",
        value: "$_id",
      }
    },
  ]).allowDiskUse();
  if(record && record.length){
    res.data = record
  }else{
    res.status = false
  }
  return res;
}

const createSkill = async(data)=>{
  const res = getServiceResFormat();
  let db = getDb()
  const skillModel = skillSchema(db);
  const record = await skillModel.create(data);
  if(record){
    res.data = record
  }else{
    res.status = false
  }
  return res
}

const getSkill = async(filter,options)=>{
  const res = getServiceResFormat();
  let db = getDb()
  const skillModel = skillSchema(db);
  const totalRecords = await skillModel.find(filter).count();
  options = getAggregatePagination(options, totalRecords);
  const records = await skillModel.aggregate([
    { "$match": filter },
    options?.skips,
    options?.limits
  ]).allowDiskUse();
  const queryRes = {
    recordsTotal: totalRecords,
    recordsFiltered: totalRecords,
    totalPages: options?.totalPages,
    data: records
  }
  if (queryRes && queryRes?.data?.length) {
    res.data = queryRes;
  } else {
    res.status = false;
  }
  return res;

}

const updateSkill = async(filter, update)=>{
  const res = getServiceResFormat();
  let db = getDb()
  const skillModel = skillSchema(db);
  const queryRes = await skillModel.findOneAndUpdate(filter, { $set: update }, { new: true });
  if(queryRes){
    res.data = queryRes
  }else{
    res.status = false
  }
  return res;

}

const getAllSkill = async(filter)=>{
  const res = getServiceResFormat();
  let db = getDb()
  const skillModel = skillSchema(db);
  const record = await skillModel.aggregate([
    { "$match": filter },
    {
      "$set":
      {
        label: "$name",
        value: "$_id",
      }
    },
  ]).allowDiskUse();
  if(record && record.length){
    res.data = record
  }else{
    res.status = false
  }
  return res;

}

const assignProject = async(data)=>{
  const res = getServiceResFormat();
  let db = getDb()
  const employeeModel = employeeSchema(db);
  const existData = await employeeModel.findOne({_id:data.employee_id});
  if(!existData){
    throw new ApiError(httpStatus.BAD_REQUEST, messages.alert.EMPLOYEE_ID);
  }
  if(existData?.project?.includes(data.project_id)){
    throw new ApiError(httpStatus.BAD_REQUEST, 'Project Already Assigned');
  }
  const record = await employeeModel.findByIdAndUpdate({_id:data?.employee_id}, { $addToSet: { project: data.project_id } },{ new: true });
  if(record){
    res.data = record
  }else{
    res.status = false
  }
  return res
}

const getAssignProject = async(filter)=>{
  const res = getServiceResFormat();
  let db = getDb()
  const employeeProjectModel = employeeProjectSchema(db);
  const record = await employeeProjectModel.aggregate([
    { "$match": filter },
    {
      "$lookup":
      {
        from: "projects",
        localField: "project_id",
        foreignField: "_id",
        as: "project_details",
      }
    },
    { $unwind: { path: "$project_details", preserveNullAndEmptyArrays: true } },
    {
      "$set":
      {
        
        project_name: "$project_details.name",
        project_id:"$project_details._id"
      }
    },
    {
      "$project":{
        project_details:0
      }
    }
  ]).allowDiskUse();
  if(record && record.length){
    res.data = record
  }else{
    res.status = false
  }
  return res;

}

const assignSkill = async(data)=>{
  const res = getServiceResFormat();
  let db = getDb()
  const employeeModel = employeeSchema(db);
  const existData = await employeeModel.findOne({_id:data.employee_id});
  if(!existData){
    throw new ApiError(httpStatus.BAD_REQUEST, messages.alert.EMPLOYEE_ID);
  }
  if(existData?.skill?.includes(data.skill_id)){
    throw new ApiError(httpStatus.BAD_REQUEST, 'Skill Already Assigned');
  }
  const record = await employeeModel.findByIdAndUpdate({_id:data?.employee_id}, { $addToSet: { project: data.skill_id } },{ new: true });
  if(record){
    res.data = record
  }else{
    res.status = false
  }
}

const getAssignSkill = async(filter)=>{
  const res = getServiceResFormat();
  let db = getDb()
  const employeeSkillModel = employeeSkillSchema(db);
  const record = await employeeSkillModel.aggregate([
    { "$match": filter },
    {
      "$lookup":
      {
        from: "skills",
        localField: "skill_id",
        foreignField: "_id",
        as: "skill_details",
      }
    },
    { $unwind: { path: "$skill_details", preserveNullAndEmptyArrays: true } },
    {
      "$set":
      {
        
        skill_name: "$skill_details.name",
        skill_id:"$skill_details._id"
      }
    },
    {
      "$project":{
        skill_details:0
      }
    }
  ]).allowDiskUse();
  if(record && record.length){
    res.data = record
  }else{
    res.status = false
  }
  return res;

}



module.exports = {
  createDepartment,
  queryDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentDataList,
  getDepartmentDataListForMRF,
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
  getAssignProject,
  assignSkill,
  getAssignSkill
};