const onboardingStepsSchema = require('../../../models/onboardingSteps.model');
const onboardingFieldsSchema = require('../../../models/onboardingFields.model');
const employeeSchema = require('../../../models/employee.model');
const httpStatus = require('http-status');
const ApiError = require('../../../helpers/ApiError');
const { getServiceResFormat, getFindPagination, getDb } = require('../utils/appHelper');
const mongoose = require('mongoose');
const employeeDocumentSchema = require('../../../models/employeeDocument.model');

const createOnboardingStep = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const nameExistData = await queryOnboardingStep({ name: data?.name }, {});
    if (nameExistData && nameExistData?.status) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Onbaording Step already exists.');
    }
    const shortNameExistData = await queryOnboardingStep({ short_name: data?.short_name }, {});
    if (shortNameExistData && shortNameExistData?.status) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Onbaording Step Short Name already exists.');
    }
    const queryRes = await onboardingStepsSchema(db).create(data);
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const queryOnboardingStep = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await onboardingStepsSchema(db).find(filter).sort({ sort_order: "1" });
    if (queryRes && queryRes?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const createOnboardingStepFields = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await onboardingFieldsSchema(db).create(data);
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const queryOnboardingStepFields = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const totalRecords = await onboardingFieldsSchema(db).find(filter).count();
    const limits = getFindPagination(options, totalRecords);
    const records = await onboardingFieldsSchema(db).find(filter, {}, limits?.limits).sort({ "sort_order": 1 }).allowDiskUse();
    const queryRes = {
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        totalPages: limits?.totalPages,
        data: records,
    }
    if (queryRes && queryRes?.data?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const saveOnboardingDetails = async (filter, update, additionalFieldName) => {
    const res = getServiceResFormat();
    let db = getDb()
    filter['_id'] = mongoose.Types.ObjectId(filter?._id);
    let queryRes = null;
    let updateData = {};
    let additionalData = {};
    const data = Object?.keys(update);
    let results = await Promise.all(data?.map(async (key, i) => {
        let filterData = filter;
        if (key != 'user_id' && key != 'step_id' && key != 'query_type' && key != 'user_id') {
            filterData[key] = { $exists: true }
            const existKey = await employeeSchema(db).find(filterData);
            if (existKey && existKey?.length) {
                updateData[key] = update[key];
                queryRes = await employeeSchema(db).findOneAndUpdate(filter, { $set: { [key]: update[key] } }, { upsert: true, new: true });
            } else {
                const stepFields = await onboardingFieldsSchema(db).find({ step_id: update['step_id'], key_name: key });
                if (stepFields && stepFields?.length) {
                    additionalData[key] = update[key];
                }
            }
        }
    }));
    if (results) {
        queryRes = await employeeSchema(db).findOneAndUpdate({ _id: filter?._id }, { $set: { [additionalFieldName]: additionalData, ...updateData } }, { upsert: true, new: true });
        if (queryRes && queryRes?._id) {
            res.data = queryRes;
        } else {
            res.status = false;
        }
        return res;
    }
};

const saveOnboardingKeyData = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await employeeSchema(db).findOneAndUpdate(filter, update, { new: true });
    if (queryRes && queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const uploadDocuments = async (documents) => {
    const res = getServiceResFormat();
    let db = getDb()
    let bulk = employeeDocumentSchema(db).collection.initializeUnorderedBulkOp();
    for (let i = 0; i < documents?.length; i++) {
        const item = documents[i];
        bulk.find({ employee_id: item.employee_id, doc_name: item.doc_name }).upsert().updateOne({ $set: item });
    }
    bulk.execute(async (err, result) => {
        if (result) {
            res.data = result;
        } else {
            res.status = false;
        }
    });
    return res;
};

const getEmployeeDocs = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await employeeDocumentSchema(db).aggregate([
        { "$match": filter }
    ]).allowDiskUse()
    if (queryRes && queryRes?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}


module.exports = {
    createOnboardingStep,
    queryOnboardingStep,
    createOnboardingStepFields,
    queryOnboardingStepFields,
    saveOnboardingDetails,
    saveOnboardingKeyData,
    uploadDocuments,
    getEmployeeDocs,
};