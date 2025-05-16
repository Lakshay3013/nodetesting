const roleSchema = require('../../../models/role.model');
const { getServiceResFormat, getAggregatePagination, getDb } = require('../utils/appHelper');

const querySingleRoleData = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await roleSchema(db).findOne(filter);
    if (queryRes && queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const queryAllRoles = async (condition) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await roleSchema(db).aggregate([
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

const createRoles = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const records = await roleSchema(db).create(data);
    if (records) {
        res.data = records;
    } else {
        res.status = false;
    }
    return res

}

const updateRole = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const records = await roleSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true });
    if (records) {
        res.data = records;
    } else {
        res.status = false;
    }
    return res;

}

const deleteRole = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const records = await roleSchema(db).deleteOne(filter);
    if (records) {
        res.data = records;
    } else {
        res.status = false;
    }
    return res;
}

const getRoleList = async (filter, options) => {
    const res = getServiceResFormat()
    let db = getDb()
    const totalRecords = await roleSchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await roleSchema(db).aggregate([
        { "$match": filter },
        options?.skips,
        options?.limits,
    ]);
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

module.exports = {
    querySingleRoleData,
    queryAllRoles,
    deleteRole,
    createRoles,
    updateRole,
    getRoleList,
};