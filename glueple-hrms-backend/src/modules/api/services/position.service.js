const positionSchema = require('../../../models/position.model');
const httpStatus = require('http-status');
const ApiError = require('../../../helpers/ApiError');
const { getServiceResFormat, getAggregatePagination, getDb } = require('../utils/appHelper');
const mongoose = require('mongoose');

const createPosition = async (data) => {
    const res = getServiceResFormat();
          let db = getDb()
    const nameExistData = await queryPositionByFilter({ name: data?.name, department_id: mongoose.Types.ObjectId(data?.department_id), designation_id: mongoose.Types.ObjectId(data?.designation_id) }, {});
    if (nameExistData && nameExistData?.status) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Position Name already exists.');
    }
    const shortNameExistData = await queryPositionByFilter({ short_name: data?.short_name }, {});
    if (shortNameExistData && shortNameExistData?.status) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Position Short Name already exists.');
    }
    const queryRes = await positionSchema(db).create(data);
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const queryPosition = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    filter = filter && filter?.department_id && filter?.designation_id ? { ...filter, department_id: mongoose.Types.ObjectId(filter?.department_id), designation_id: mongoose.Types.ObjectId(filter?.designation_id) }
        : filter?.department_id ? { ...filter, department_id: mongoose.Types.ObjectId(filter?.department_id) }
            : filter?.designation_id ? { ...filter, designation_id: mongoose.Types.ObjectId(filter?.designation_id) }
                : filter;
    const totalRecords = await positionSchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await positionSchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup":
            {
                from: "departments",
                localField: "department_id",
                foreignField: "_id",
                as: "department_name",
            }
        },
        {
            "$lookup":
            {
                from: "designations",
                localField: "designation_id",
                foreignField: "_id",
                as: "designation_name",
            }
        },
        {
            "$lookup":
            {
                from: "employees",
                localField: "_id",
                foreignField: "designation_id",
                as: "emp_count",
            }
        },
        {
            "$set":
            {
                department_name: { "$arrayElemAt": ["$department_name.name", 0] },
                designation_name: { "$arrayElemAt": ["$designation_name.name", 0] },
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

const queryPositionByFilter = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    filter = filter && filter?.department_id && filter?.designation_id ? { ...filter, department_id: mongoose.Types.ObjectId(filter?.department_id), designation_id: mongoose.Types.ObjectId(filter?.designation_id) }
        : filter?.department_id ? { ...filter, department_id: mongoose.Types.ObjectId(filter?.department_id) }
            : filter?.designation_id ? { ...filter, designation_id: mongoose.Types.ObjectId(filter?.designation_id) }
                : filter;
    const queryRes = await positionSchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup":
            {
                from: "departments",
                localField: "department_id",
                foreignField: "_id",
                as: "department_name",
            }
        },
        {
            "$lookup":
            {
                from: "designations",
                localField: "designation_id",
                foreignField: "_id",
                as: "designation_name",
            }
        },
        {
            "$set":
            {
                department_name: { "$arrayElemAt": ["$department_name.name", 0] },
                designation_name: { "$arrayElemAt": ["$designation_name.name", 0] },
                label: "$name",
                value: "$_id"
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

const updatePosition = async (filter, update) => {
    let db = getDb()
    const existData = await queryPositionByFilter({ $or: [{ name: update?.name }, { short_name: update?.short_name }] }, {});
    if (existData?.status && (update?.name || update?.short_name)) {
        const filteredName = existData?.data?.filter((item) => (item?.name == update?.name && (item?._id != update?._id || (item?.department_id != update?.department_id && item?.designation_id != update?.designation_id))));
        if (filteredName && filteredName?.length > 0) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Position Name already exists.');
        }
        const filteredShortName = existData?.data?.filter((item) => (item?.short_name == update?.short_name && item?._id != update?._id));
        if (filteredShortName && filteredShortName?.length > 0) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Position Short Name already exists.');
        }
    }
    const queryRes = await positionSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true });
    if (queryRes?._id) {
        queryRes.data = queryRes;
    } else {
        queryRes.status = false;
    }
    return queryRes;
}

const deletePosition = async (filter) => {
    let db = getDb()
    const queryRes = await positionSchema(db).findOneAndDelete(filter);
    if (queryRes?._id) {
        queryRes.data = queryRes;
    } else {
        queryRes.status = false;
    }
    return queryRes;
}

module.exports = {
    createPosition,
    queryPosition,
    updatePosition,
    deletePosition,
    queryPositionByFilter,
};