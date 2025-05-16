const approvalManagementSchema = require('../../../models/approvalManagement.model');
const httpStatus = require('http-status');
const ApiError = require('../../../helpers/ApiError');
const { getServiceResFormat, getFindPagination,getAggregatePagination,getDb } = require('../utils/appHelper');

const addApprovalHierarchy = async (data) => {
    let db = getDb()
    const approvalManagementModel = approvalManagementSchema(db);
    const condition = data?.department_id && data?.designation_id && data?.position_id ? 
                      {type: data?.type, department_id: data?.department_id, designation_id: data?.designation_id, position_id: data?.position_id} : 
                      data?.department_id && data?.designation_id ?
                      {type: data?.type, department_id: data?.department_id, designation_id: data?.designation_id} : 
                      {type: data?.type, department_id: data?.department_id};
    const res = getServiceResFormat();
    const existData = await queryHierarchy(condition,{});
    if (existData && existData?.status) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Hierarchy already exists.');
    }
    const queryRes = await approvalManagementModel.create(data);
    if(queryRes?._id){
        res.data = queryRes;
    }else{
        res.status = false;
    }
    return res;
};

const queryHierarchy = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const approvalManagementModel = approvalManagementSchema(db);
    const totalRecords =  await approvalManagementModel.find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await approvalManagementModel.aggregate([
        { "$match": filter },
        {
            "$lookup":
            {
                from: "designations",
                localField: "designation_id",
                foreignField: "_id",
                as: "designations_data",
            },
        },
        {
            "$lookup":
            {
                from: "departments",
                localField: "department_id",
                foreignField: "_id",
                as: "departments_data",
            },
        },
        {
            "$lookup":
            {
                from: "positions",
                localField: "position_id",
                foreignField: "_id",
                as: "positions_data"
            }
        },
        {
            "$lookup":
            {
                from: "employees",
                localField: "auto_approve_assign_to",
                foreignField: "_id",
                as: "employees_data"
            }
        },
        {
            "$set":
            {
            department_name:{"$arrayElemAt":["$departments_data.name",0]},
            designation_name:{"$arrayElemAt":["$designations_data.name",0]},
            position_name:{"$arrayElemAt":["$positions_data.name",0]},
            auto_approve_assign_to_name:{"$arrayElemAt":["$employees_data.name",0]},
            }
        },
        {
            "$project": {
                "departments_data": 0,
                "designations_data":0,
                "positions_data":0,
                "employees_data":0
            }
        },
        options?.skips,
        options?.limits
    ]);
    const queryRes = {
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        totalPages: options?.totalPages,
        data: records
    }
    if(queryRes && queryRes?.data?.length){
        res.data = queryRes;
    }else{
        res.status = false;
    }
    return res;
};

const updateHierarchy = async(filter, update) =>{
    const res = getServiceResFormat()
    let db = getDb()
    const approvalManagementModel = approvalManagementSchema(db);
    const updateQuery = await approvalManagementModel.findByIdAndUpdate(filter,update)
    if(updateQuery._id){
        res.data = updateQuery
    }else{
        res.status = false
    }
    return res
}

const deleteHierarchy = async(filter)=>{
    const res = getServiceResFormat()
    let db = getDb()
    const approvalManagementModel = approvalManagementSchema(db);
    const deleteQuery = await approvalManagementModel.findOneAndDelete(filter)
    if(deleteQuery._id){
        res.data = deleteQuery
    }else{
        res.status = false
    }
    return res
}

const querySingleHierarchy = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const approvalManagementModel = approvalManagementSchema(db);
    const records = await approvalManagementModel.findOne(filter);
    if(records){
        res.data = records?.assigned_to;
    }else{
        res.status = false;
    }
    return res;
};

module.exports = {
    addApprovalHierarchy,
    queryHierarchy,
    querySingleHierarchy,
    updateHierarchy,
    deleteHierarchy,
};