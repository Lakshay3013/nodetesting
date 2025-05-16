const designationSchema = require('../../../models/designation.model');
const httpStatus = require('http-status');
const ApiError = require('../../../helpers/ApiError');
const { getServiceResFormat, getAggregatePagination, getDb } = require('../utils/appHelper');
const mongoose = require('mongoose');

const createDesignation = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
  const designationModel = designationSchema(db);
    const nameExistData = await queryDesignationByFilter({ name: data?.name, department_id: mongoose.Types.ObjectId(data?.department_id) }, {});
    if (nameExistData && nameExistData?.status) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Designation Name already exists.');
    }
    const shortNameExistData = await queryDesignationByFilter({ short_name: data?.short_name }, {});
    if (shortNameExistData && shortNameExistData?.status) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Designation Short Name already exists.');
    }
    const queryRes = await designationModel.create(data);
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const queryDesignation = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
  const designationModel = designationSchema(db);
    filter = filter && filter?.department_id ? { ...filter, department_id: mongoose.Types.ObjectId(filter?.department_id) } : {};
    const totalRecords = await designationModel.find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await designationModel.aggregate([
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

const queryDesignationByFilter = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
  const designationModel = designationSchema(db);
    filter = filter && filter?.department_id ? { ...filter, department_id: mongoose.Types.ObjectId(filter?.department_id) } : filter;
    const queryRes = await designationModel.aggregate([
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
            "$set":
            {
                department_name: { "$arrayElemAt": ["$department_name.name", 0] },
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

const updateDesignation = async (filter, update) => {
    let db = getDb()
  const designationModel = designationSchema(db);
    const existData = await queryDesignationByFilter({ $or: [{ name: update?.name }, { short_name: update?.short_name }] }, {});
    if (existData?.status && (update?.name || update?.short_name)) {
        const filteredName = existData?.data?.filter((item) => (item?.name == update?.name && (item?._id != update?._id || item?.department_id != update?.department_id)));
        if (filteredName && filteredName?.length > 0) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Designation Name already exists.');
        }
        const filteredShortName = existData?.data?.filter((item) => (item?.short_name == update?.short_name && item?._id != update?._id));
        if (filteredShortName && filteredShortName?.length > 0) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Designation Short Name already exists.');
        }
    }
    const queryRes = await designationModel.findOneAndUpdate(filter, { $set: update }, { new: true });
    if (queryRes?._id) {
        queryRes.data = queryRes;
    } else {
        queryRes.status = false;
    }
    return queryRes;
}

const deleteDesignation = async (filter) => {
    let db = getDb()
  const designationModel = designationSchema(db);
    const queryRes = await designationModel.findOneAndDelete(filter);
    if (queryRes?._id) {
        queryRes.data = queryRes;
    } else {
        queryRes.status = false;
    }
    return queryRes;
}

const getGraphicalData = async () => {
    const res = getServiceResFormat();
    let db = getDb()
  const designationModel = designationSchema(db);
    const queryRes = await designationModel.aggregate([
        {
            $graphLookup: {
                from: "designations",
                startWith: "$parent",
                connectFromField: "parent",
                connectToField: "_id",
                as: "organization_hierarchy",
                depthField: "order"
            }
        },
        {
            $sort: {
                "organization_hierarchy.order": 1
            }
        },
    ]);
    if (queryRes?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const getTeamData = async () => {
    const res = getServiceResFormat();
    let db = getDb()
  const designationModel = designationSchema(db);
    const queryRes = await designationModel.aggregate([
        {
            $lookup: {
                from: "designations",
                localField: "parent",
                foreignField: "_id",
                as: "organization_hierarchy",
            }
        },
        {
            $lookup: {
                from: "employees",
                localField: "_id",
                foreignField: "designation_id",
                as: "employee_data",
            }
        },
        {
            $sort: {
                "organization_hierarchy.order": 1
            }
        },
    ]);
    if (queryRes?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

module.exports = {
    createDesignation,
    queryDesignation,
    updateDesignation,
    deleteDesignation,
    getGraphicalData,
    getTeamData,
    queryDesignationByFilter,
};