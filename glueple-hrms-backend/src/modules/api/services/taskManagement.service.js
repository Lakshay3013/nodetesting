const { getServiceResFormat, getFindPagination, getDb } = require('../utils/appHelper');
const httpStatus = require('http-status');
const ApiError = require('../../../helpers/ApiError');
const taskProjectTypeSchema = require('../../../models/taskProjectType.model');
const taskProjectSchema = require('../../../models/taskProejct.model');
const taskHistorySchema = require('../../../models/taskHistory.model')

const addProjectType = async (data) => {
    let db = getDb()
    const res = getServiceResFormat();
    const addType = await taskProjectTypeSchema(db).create(data);
    if (addType) {
        res.data = addType
    } else {
        res.status = false;
    }
    return res
}

const getProjectType = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const totalRecords = await taskProjectTypeSchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await taskProjectTypeSchema(db).aggregate([
        { "$match": filter },
        options?.skips,
        options?.limits
    ]).allowDiskUse()
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

const getAllProjectType = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const records = await taskProjectTypeSchema(db).aggregate([
        { "$match": filter },
        {
            "$set": {
                label: "$name",
                value: "$_id",
            }
        },
    ]).allowDiskUse()
    if (records && records.length) {
        res.data = records;
    } else {
        res.status = false
    }
    return res

}

const updateProjectType = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const records = await taskProjectTypeSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true });
    if (records) {
        res.data = records;
    } else {
        res.status = false;
    }
    return res;
}

const deleteProjectType = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const records = await taskProjectTypeSchema(db).findByIdAndDelete(filter)
    if (records) {
        res.data = records;
    } else {
        res.status = false;
    }
    return res;
}

const createProject = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const addType = await taskProjectSchema(db).create(data);
    if (addType) {
        res.data = addType
    } else {
        res.status = false;
    }
    return res
}

const getProject = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const totalRecords = await taskProjectSchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await taskProjectSchema(db).aggregate([
        { "$match": filter },
        options?.skips,
        options?.limits
    ]).allowDiskUse()
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

const getAllProject = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const records = await taskProjectSchema(db).aggregate([
        { "$match": filter },
        {
            "$set": {
                label: "$name",
                value: "$_id",
            }
        },
    ]).allowDiskUse()
    if (records && records.length) {
        res.data = records;
    } else {
        res.status = false
    }
    return res

}

const updateProject = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const records = await taskProjectSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true });
    if (records) {
        res.data = records;
    } else {
        res.status = false;
    }
    return res;
}

const deleteProject = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const records = await taskProjectSchema(db).findByIdAndDelete(filter)
    if (records) {
        res.data = records;
    } else {
        res.status = false;
    }
    return res;
}

const addTask = async (data) => {
    const res = getServiceResFormat();
    let db = getDb();
    const addTask = await taskSchema(db).create(data);
    if (addTask) {
        res.data = addTask;
    } else {
        res.status = false;
    }
    return res;
}

const getTask = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const totalRecords = await taskSchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await taskSchema(db).aggregate([
        { "$match": filter },
        options?.skips,
        options?.limits
    ]).allowDiskUse()
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

const getAllTask = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const records = await taskSchema(db).aggregate([
        { "$match": filter },
        {
            "$set": {
                label: "$name",
                value: "$_id",
            }
        },
    ]).allowDiskUse()
    if (records && records.length) {
        res.data = records;
    } else {
        res.status = false
    }
    return res
}

const updateTask = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const records = await taskSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true });
    if (records) {
        res.data = records;
    } else {
        res.status = false;
    }
    return res;

}

const deleteTask = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const records = await taskSchema(db).findByIdAndDelete(filter)
    if (records) {
        res.data = records;
    } else {
        res.status = false;
    }
    return res;
}

const addTaskHistory = async(data)=>{
    const res = getServiceResFormat();
    const db = getDb();
    const records = await taskHistorySchema(db).create(data);
    if(records){
        res.data = records;
    }else{
        res.status = false
    }
    return res;
}

const getTaskHistory = async(filter)=>{
    const res = getServiceResFormat();
    const db = getDb();
    const records = await taskHistorySchema(db).aggregate([
          { "$match": filter },
    ])
    if(records && records.length){
        res.data = records;
    }else{
        res.status = false
    }
    return res;
}




module.exports = {
    addProjectType,
    getProjectType,
    getAllProjectType,
    updateProjectType,
    deleteProjectType,
    createProject,
    getProject,
    getAllProject,
    updateProject,
    deleteProject,
    addTask,
    getTask,
    getAllTask,
    updateTask,
    deleteTask,
    addTaskHistory,
    getTaskHistory
};