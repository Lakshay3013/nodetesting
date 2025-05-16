const shortLeaveConfigurationSchema = require('../../../models/shortLeaveConfiguration.model');
const { getServiceResFormat, getAggregatePagination, getDb } = require('../utils/appHelper');
const httpStatus = require('http-status');
const ApiError = require('../../../helpers/ApiError');

const queryConfiguration = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await shortLeaveConfigurationSchema(db).find(filter);
    if (queryRes && queryRes?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const createConfiguration = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const nameExistData = await queryConfiguration({ name: data?.name }, {});
    if (nameExistData && nameExistData?.status) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Short Leave Name already exists.');
    }
    const shortNameExistData = await queryConfiguration({ short_name: data?.short_name }, {});
    if (shortNameExistData && shortNameExistData?.status) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Short Leave Short Name already exists.');
    }
    const queryRes = await shortLeaveConfigurationSchema(db).create(data);
    if (queryRes) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const updateConfiguration = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const existData = await queryConfiguration({ $or: [{ name: update?.name }, { short_name: update?.short_name }] }, {});
    if (existData?.status) {
        const filteredName = existData?.data?.filter((item) => (item?.name == update?.name && item?._id != update?._id));
        if (filteredName && filteredName?.length > 0) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Short Leave Name already exists.');
        }
        const filteredShortName = existData?.data?.filter((item) => (item?.short_name == update?.short_name && item?._id != update?._id));
        if (filteredShortName && filteredShortName?.length > 0) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Short Leave Short Name already exists.');
        }
    }
    const queryRes = await shortLeaveConfigurationSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true });
    if (queryRes && queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const getAllConfigurations = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const totalRecords = await shortLeaveConfigurationSchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await shortLeaveConfigurationSchema(db).aggregate([
        { "$match": filter },
        {
            "$set": {
                used_as_name: {
                    "$replaceAll": {
                        "input": {
                            "$concat": [
                                {
                                    "$toUpper": {
                                        "$substrCP": [
                                            { "$ifNull": ["$used_as", ""] },
                                            0,
                                            1
                                        ]
                                    }
                                },
                                {
                                    "$substrCP": [
                                        { "$ifNull": ["$used_as", ""] },
                                        1,
                                        { "$strLenCP": { "$ifNull": ["$used_as", ""] } }
                                    ]
                                }
                            ]
                        },
                        "find": "_",
                        "replacement": " "
                    }
                },
                applicable_within_name: {
                    "$replaceAll": {
                        "input": {
                            "$concat": [
                                {
                                    "$toUpper": {
                                        "$substrCP": [
                                            { "$ifNull": ["$applicable_within", ""] },
                                            0,
                                            1
                                        ]
                                    }
                                },
                                {
                                    "$substrCP": [
                                        { "$ifNull": ["$applicable_within", ""] },
                                        1,
                                        { "$strLenCP": { "$ifNull": ["$applicable_within", ""] } }
                                    ]
                                }
                            ]
                        },
                        "find": "_",
                        "replacement": " "
                    }
                },
                applicable_for_name: {
                    "$replaceAll": {
                        "input": {
                            "$concat": [
                                {
                                    "$toUpper": {
                                        "$substrCP": [
                                            { "$ifNull": ["$applicable_for", ""] },
                                            0,
                                            1
                                        ]
                                    }
                                },
                                {
                                    "$substrCP": [
                                        { "$ifNull": ["$applicable_for", ""] },
                                        1,
                                        { "$strLenCP": { "$ifNull": ["$applicable_for", ""] } }
                                    ]
                                }
                            ]
                        },
                        "find": "_",
                        "replacement": " "
                    }
                }
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

module.exports = {
    queryConfiguration,
    createConfiguration,
    updateConfiguration,
    getAllConfigurations,
};