const policyCategorySchema = require('../../../models/policyCategory.model');
const policySchema = require('../../../models/policies.model');
const httpStatus = require('http-status');
const ApiError = require('../../../helpers/ApiError');
const { getServiceResFormat, getFindPagination, getAggregatePagination, getDb } = require('../utils/appHelper');
const { removeFile } = require('../../../helpers/fileHandler');

const createPolicyCategory = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const existData = await queryPolicyCategory({ name: data?.name }, {});
    if (existData && existData?.status) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Policy category already exists.');
    }
    const queryRes = await policyCategorySchema(db).create(data);
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const queryPolicyCategory = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const totalRecords = await policyCategorySchema(db).find(filter).count();
    const limits = getFindPagination(options, totalRecords);
    const records = await policyCategorySchema(db).find(filter, {}, limits?.limits).allowDiskUse();
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

const updatePolicyCategory = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await policyCategorySchema(db).findOneAndUpdate(filter, update, { new: true });
    if (queryRes && queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const deletePolicyCategory = async (_id) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await policyCategorySchema(db).deleteOne({ _id: _id });
    if (queryRes && queryRes?.deletedCount) {
        const findPolicies = await policySchema(db).find({ category_id: _id });
        if (findPolicies && findPolicies?.length) {
            findPolicies?.forEach((item) => {
                removeFile({ directory: "./public/policies/", file_name: item?.file_name });
            })
            await policySchema(db).deleteMany({ category_id: _id });
        }
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const createPolicy = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await policySchema(db).create(data);
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const queryAllPolicyInCategory = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    filter = filter && filter?._id ? { _id: mongoose.Types.ObjectId(filter?._id) } : {};
    const totalRecords = await policyCategorySchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await policyCategorySchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup":
            {
                from: "policies",
                localField: "_id",
                foreignField: "category_id",
                as: "policy_data",
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

const queryPolicy = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const totalRecords = await policySchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await policySchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup":
            {
                from: "policy_categories",
                localField: "category_id",
                foreignField: "_id",
                as: "policy_category_name",
            }
        },
        {
            "$set":
            {
                policy_category_name: { "$arrayElemAt": ["$policy_category_name.name", 0] },
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

const updatePolicy = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await policySchema(db).findOneAndUpdate(filter, update);
    if (queryRes && queryRes?._id) {
        removeFile({ directory: "./public/policies/", file_name: queryRes?.file_name });
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const deletePolicy = async (_id) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await policySchema(db).findOneAndDelete({ _id: _id });
    if (queryRes && queryRes?._id) {
        removeFile({ directory: "./public/policies/", file_name: queryRes?.file_name });
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const getPolicyKeyByIds = async (ids, key) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await policySchema(db).distinct(key, { "_id": { $in: ids }, [key]: { $nin: ["", null] } });
    if (queryRes && queryRes?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const queryPolicyCategoryList = async (condition) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await policyCategorySchema(db).aggregate([
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
};

const queryPolicyList = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await policySchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup":
            {
                from: "policy_categories",
                localField: "category_id",
                foreignField: "_id",
                as: "policy_category_name",
            }
        },
        {
            "$set":
            {
                policy_category_name: { "$arrayElemAt": ["$policy_category_name.name", 0] },
            }
        },
    ]).allowDiskUse();
    if (queryRes && queryRes?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};



module.exports = {
    createPolicyCategory,
    queryPolicyCategory,
    updatePolicyCategory,
    createPolicy,
    queryPolicy,
    updatePolicy,
    queryAllPolicyInCategory,
    deletePolicyCategory,
    deletePolicy,
    getPolicyKeyByIds,
    queryPolicyCategoryList,
    queryPolicyList,
};