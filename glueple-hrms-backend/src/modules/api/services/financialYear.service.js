const financialYearSchema = require('../../../models/financialYear.modal');
const { getServiceResFormat, getAggregatePagination } = require('../utils/appHelper');

const addFinancialYear = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const financialYearModel = financialYearSchema(db);
    const queryRes = await financialYearModel.create(data);
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const getAllFinancialYear = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const financialYearModel = financialYearSchema(db);
    const totalRecords = await financialYearModel.find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await financialYearModel.aggregate([
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


const updateFinancialYear = async (filter, update) => {
    let db = getDb()
    const financialYearModel = financialYearSchema(db);
    const queryRes = await financialYearModel.findOneAndUpdate(filter, { $set: update }, { new: true });
    if (queryRes?._id) {
        queryRes.data = queryRes;
    } else {
        queryRes.status = false;
    }
    return queryRes;
}


const getFinancialYearList = async (condition) => {
    const res = getServiceResFormat();
    let db = getDb()
    const financialYearModel = financialYearSchema(db);
    const queryRes = await financialYearModel.aggregate([
        { "$match": condition },
        {
            "$set":
            {
                label: { "$concat": ["$from", " to ", "$to"] },
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

module.exports = {
    addFinancialYear,
    updateFinancialYear,
    getAllFinancialYear,
    getFinancialYearList,
};