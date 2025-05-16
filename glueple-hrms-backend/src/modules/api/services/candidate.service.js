const candidateSchema = require('../../../models/candidate.model');
const httpStatus = require('http-status');
const ApiError = require('../../../helpers/ApiError');
const { getServiceResFormat, getDb, 
    
 } = require('../utils/appHelper');

const createCandidate = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const candidateModel = candidateSchema(db);
    const existData = await queryCandidate({ email: data?.email, mrf_id: data?.mrf_id }, {});
    if (existData && existData?.status) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Candidate already created with this email.');
    }
    const queryRes = await candidateModel.create(data);
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const queryCandidate = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const candidateModel = candidateSchema(db);
    const totalRecords = await candidateModel.find(filter).count();
    const limits = getFindPagination(options, totalRecords);
    const records = await candidateModel.find(filter, {}, limits?.limits).allowDiskUse();
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
};

const updateCandidate = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const candidateModel = candidateSchema(db);
    const queryRes = await candidateModel.findOneAndUpdate(filter, update, {new: true});
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const getLastData = async (field) => {
    const res = getServiceResFormat();
    let db = getDb()
    const candidateModel = candidateSchema(db);
    const queryRes = await candidateModel.find().sort({[field]:-1}).limit(1);
    if (queryRes && queryRes?.length && queryRes[0]?.auto_id) {
        res.data = queryRes[0];
    } else {
        res.status = false;
    }
    return res;
};

module.exports = {
    createCandidate,
    queryCandidate,
    updateCandidate,
    getLastData,
};