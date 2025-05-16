const clientsSchema = require('../../../models/clients.mode')
const httpStatus = require('http-status');
const ApiError = require('../../../helpers/ApiError');
const { getServiceResFormat, getAggregatePagination, getFindPagination, getDb } = require('../utils/appHelper');

/* Create */
const createClient = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const clientsModel = clientsSchema(db);
    const createPost = await clientsModel.create(data);
    if (createPost) {
        res.data = createPost;
    } else {
        res.status = false;
    }
    return res;
};

const getClient = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const clientsModel = clientsSchema(db);
    const totalRecords = await clientsModel.find(filter).count();
    const limits = getFindPagination(options, totalRecords);
    const records = await clientsModel.find(filter, {}, limits?.limits).allowDiskUse();
    const queryRes = {
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        totalPages: limits?.totalPages,
        data: records
    }

    if (queryRes && queryRes?.data?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const updateClient = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const clientsModel = clientsSchema(db);
    const record = await clientsModel.findOneAndUpdate(filter, { $set: update }, { new: true })
    if (record) {
        res.data = record;
    } else {
        res.status = false;
    }
    return res;
}

const deleteClient = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const clientsModel = clientsSchema(db);
    const queryRes = await clientsModel.findOneAndDelete(filter);
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const getAllClient = async(filter)=>{
    const res = getServiceResFormat();
    let db = getDb()
    const clientsModel = clientsSchema(db);
    const record = await clientsModel.find(filter)
    if(record){
        res.data = record;
    }else{
        res.status = false
    }
    return res;
}


module.exports = {
    createClient,
    getClient,
    updateClient,
    deleteClient,
    getAllClient,
};