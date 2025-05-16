const leaveTypeSchema = require('../../../models/leaveTypes.model');
const leaveSettingSchema = require('../../../models/leaveSettings.model');
const leaveBalanceLogsSchema = require('../../../models/leaveBalanceLogs.model');
const httpStatus = require('http-status');
const ApiError = require('../../../helpers/ApiError');
const leaveApplicationSchema = require('../../../models/leaveApplication.model');
const leaveBalanceSchema = require("../../../models/AddLeaveBalance.model")
const approverSchema = require('../../../models/approvers.model');
const { getServiceResFormat, getAggregatePagination, isExistLeave, getDb } = require('../utils/appHelper');
const mongoose = require('mongoose');
const employeeModel = require('../../../models/employee.model');
const moment = require('moment');
const { filter } = require('bluebird');

const addLeaveType = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const nameExistData = await queryLeaveType({ name: data?.name }, {});
    if (nameExistData && nameExistData?.status) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Leave Name already exists.');
    }
    const shortNameExistData = await queryLeaveType({ short_name: data?.short_name }, {});
    if (shortNameExistData && shortNameExistData?.status) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Leave Short Name already exists.');
    }
    const queryRes = await leaveTypeSchema(db).create(data);
    if (queryRes) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const queryLeaveType = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const totalRecords = await leaveTypeSchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await leaveTypeSchema(db).aggregate([
        { "$match": filter },
        {
            "$set":
            {
                expire_on_name: {
                    "$replaceAll": {
                        "input": {
                            "$concat": [
                                {
                                    "$toUpper": {
                                        "$substrCP": [
                                            { "$ifNull": ["$expire_on", ""] },
                                            0,
                                            1
                                        ]
                                    }
                                },
                                {
                                    "$substrCP": [
                                        { "$ifNull": ["$expire_on", ""] },
                                        1,
                                        { "$strLenCP": { "$ifNull": ["$expire_on", ""] } }
                                    ]
                                }
                            ]
                        },
                        "find": "_",
                        "replacement": " "
                    }
                },
                leave_unit_name: {
                    "$replaceAll": {
                        "input": {
                            "$concat": [
                                {
                                    "$toUpper": {
                                        "$substrCP": [
                                            { "$ifNull": ["$leave_unit", ""] },
                                            0,
                                            1
                                        ]
                                    }
                                },
                                {
                                    "$substrCP": [
                                        { "$ifNull": ["$leave_unit", ""] },
                                        1,
                                        { "$strLenCP": { "$ifNull": ["$leave_unit", ""] } }
                                    ]
                                }
                            ]
                        },
                        "find": "_",
                        "replacement": " "
                    }
                },
                leave_type_name: {
                    "$replaceAll": {
                        "input": {
                            "$concat": [
                                {
                                    "$toUpper": {
                                        "$substrCP": [
                                            { "$ifNull": ["$leave_type", ""] },
                                            0,
                                            1
                                        ]
                                    }
                                },
                                {
                                    "$substrCP": [
                                        { "$ifNull": ["$leave_type", ""] },
                                        1,
                                        { "$strLenCP": { "$ifNull": ["$leave_type", ""] } }
                                    ]
                                }
                            ]
                        },
                        "find": "_",
                        "replacement": " "
                    }
                },
                balance_based_on_name: {
                    "$replaceAll": {
                        "input": {
                            "$concat": [
                                {
                                    "$toUpper": {
                                        "$substrCP": [
                                            { "$ifNull": ["$balance_based_on", ""] },
                                            0,
                                            1
                                        ]
                                    }
                                },
                                {
                                    "$substrCP": [
                                        { "$ifNull": ["$balance_based_on", ""] },
                                        1,
                                        { "$strLenCP": { "$ifNull": ["$balance_based_on", ""] } }
                                    ]
                                }
                            ]
                        },
                        "find": "_",
                        "replacement": " "
                    }
                },
                effective_after_name_name: {
                    "$replaceAll": {
                        "input": {
                            "$concat": [
                                {
                                    "$toUpper": {
                                        "$substrCP": [
                                            { "$ifNull": ["$effective_after_name", ""] },
                                            0,
                                            1
                                        ]
                                    }
                                },
                                {
                                    "$substrCP": [
                                        { "$ifNull": ["$effective_after_name", ""] },
                                        1,
                                        { "$strLenCP": { "$ifNull": ["$effective_after_name", ""] } }
                                    ]
                                }
                            ]
                        },
                        "find": "_",
                        "replacement": " "
                    }
                },
                effective_after_value_name: {
                    "$replaceAll": {
                        "input": {
                            "$concat": [
                                {
                                    "$toUpper": {
                                        "$substrCP": [
                                            { "$ifNull": ["$effective_after_value", ""] },
                                            0,
                                            1
                                        ]
                                    }
                                },
                                {
                                    "$substrCP": [
                                        { "$ifNull": ["$effective_after_value", ""] },
                                        1,
                                        { "$strLenCP": { "$ifNull": ["$effective_after_value", ""] } }
                                    ]
                                }
                            ]
                        },
                        "find": "_",
                        "replacement": " "
                    }
                },
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

const updateLeaveType = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const existData = await getLeaveTypeList({ $or: [{ name: update?.name }, { short_name: update?.short_name }] }, {});
    if (existData?.status) {
        const filteredName = existData?.data?.filter((item) => (item?.name == update?.name && item?._id != update?._id));
        if (filteredName && filteredName?.length > 0) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Leave Name already exists.');
        }
        const filteredShortName = existData?.data?.filter((item) => (item?.short_name == update?.short_name && item?._id != update?._id));
        if (filteredShortName && filteredShortName?.length > 0) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Leave Short Name already exists.');
        }
    }
    const queryRes = await leaveTypeSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true });
    if (queryRes && queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const addLeaveSetting = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await leaveSettingSchema(db).create(data);
    if (queryRes) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const queryLeaveSetting = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    filter = filter?.leave_type_id ? { ...filter, leave_type_id: mongoose.Types.ObjectId(filter?.leave_type_id) } : filter;
    filter = filter?.department_id ? { ...filter, department_id: mongoose.Types.ObjectId(filter?.department_id) } : filter;
    filter = filter?.designation_id ? { ...filter, designation_id: mongoose.Types.ObjectId(filter?.designation_id) } : filter;
    const totalRecords = await leaveSettingSchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await leaveSettingSchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup": {
                from: "leave_types",
                localField: "leave_type_id",
                foreignField: "_id",
                as: "leave_type",
            }
        },
        {
            "$lookup": {
                from: "departments",
                localField: "department_id",
                foreignField: "_id",
                as: "department_name",
            }
        },
        {
            "$lookup": {
                from: "designations",
                localField: "designation_id",
                foreignField: "_id",
                as: "designation_name",
            }
        },
        {
            "$set": {
                leave_type_name: { "$arrayElemAt": ["$leave_type.name", 0] },
                department_name: { "$arrayElemAt": ["$department_name.name", 0] },
                designation_name: { "$arrayElemAt": ["$designation_name.name", 0] },
                base_on_credit_name: {
                    "$replaceAll": {
                        "input": {
                            "$concat": [
                                {
                                    "$toUpper": {
                                        "$substrCP": [
                                            { "$ifNull": ["$base_on_credit", ""] },
                                            0,
                                            1
                                        ]
                                    }
                                },
                                {
                                    "$substrCP": [
                                        { "$ifNull": ["$base_on_credit", ""] },
                                        1,
                                        { "$strLenCP": { "$ifNull": ["$base_on_credit", ""] } }
                                    ]
                                }
                            ]
                        },
                        "find": "_",
                        "replacement": " "
                    }
                },
                can_exceed_leave_balance_value_name: {
                    "$replaceAll": {
                        "input": {
                            "$concat": [
                                {
                                    "$toUpper": {
                                        "$substrCP": [
                                            { "$ifNull": ["$can_exceed_leave_balance_value", ""] },
                                            0,
                                            1
                                        ]
                                    }
                                },
                                {
                                    "$substrCP": [
                                        { "$ifNull": ["$can_exceed_leave_balance_value", ""] },
                                        1,
                                        { "$strLenCP": { "$ifNull": ["$can_exceed_leave_balance_value", ""] } }
                                    ]
                                }
                            ]
                        },
                        "find": "_",
                        "replacement": " "
                    }
                },
                allow_request_for_name: {
                    "$replaceAll": {
                        "input": {
                            "$concat": [
                                {
                                    "$toUpper": {
                                        "$substrCP": [
                                            { "$ifNull": ["$allow_request_for", ""] },
                                            0,
                                            1
                                        ]
                                    }
                                },
                                {
                                    "$substrCP": [
                                        { "$ifNull": ["$allow_request_for", ""] },
                                        1,
                                        { "$strLenCP": { "$ifNull": ["$allow_request_for", ""] } }
                                    ]
                                }
                            ]
                        },
                        "find": "_",
                        "replacement": " "
                    }
                },
            }
        },
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
};

const updateLeaveSetting = async (filter, update) => {
    let db = getDb()
    const res = getServiceResFormat();
    const queryRes = await leaveSettingSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true });
    if (queryRes && queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const getLeaveTypeList = async (condition) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await leaveTypeSchema(db).aggregate([
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

const applyLeave = async (data) => {
    let db = getDb()
    const res = getServiceResFormat();
    const { reason, leaveDetails, emp_id, created_by } = data
    const checkLeave = await leaveApplicationSchema(db).find({ emp_id: mongoose.Types.ObjectId(created_by), is_cancel: false, leave_start_date: { $gte: leaveDetails[0].leave_date, $lte: leaveDetails[leaveDetails.length - 1].leave_date } })
    if (checkLeave && checkLeave.length > 0) {
        const getLeaveData = isExistLeave(leaveDetails, checkLeave);
        if (!getLeaveData?.status) {
            throw new ApiError(httpStatus.BAD_REQUEST, `Leave Already Applied for ${getLeaveData?.msg}`);
        }
    }
    let queryRes = null
    const saveData = {}
    const leaveData = []
    for (let i = 0; i < leaveDetails.length; i++) {
        saveData['emp_id'] = created_by
        saveData['emp_code'] = emp_id
        saveData['leave_start_date'] = leaveDetails[i].leave_date
        saveData['leave_end_date'] = leaveDetails[i].leave_date
        saveData['leave_type'] = leaveDetails[i].leave_type
        saveData['leave_status'] = leaveDetails[i].leave_status
        saveData['reason'] = leaveDetails[i]?.reason || reason
        saveData['is_sandwich'] = leaveDetails[i]?.is_sandwich || false;
        saveData['created_by'] = created_by
        queryRes = await leaveApplicationSchema(db).create(saveData);
        leaveData.push(queryRes)
    }
    if (leaveData.length) {
        res.data = leaveData;
    } else {
        res.status = false;
    }
    return res;
}

const getLeaveBalance = async (condition) => {
    const res = getServiceResFormat();
    let db = getDb()
    const getLeaveData = await leaveBalanceSchema(db).aggregate([
        { "$match": condition },
        {
            "$lookup": {
                from: "employees",
                localField: "emp_id",
                foreignField: "emp_id",
                as: "employees_data",
            }
        },
        { $unwind: { path: "$employees_data", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                emp_id: "$employees_data.emp_id",
                first_name: "$employees_data.name",
                last_name: "$employees_data.last_name",
                email: "$employees_data.email",
                leave_type: "$leave_type",
                leave_balance: "$leave_balance",
                leave_name: '$leave_name',
                leave_id: '$_id',
                employee_id: '$employee_id'
            }
        },
    ])
    if (getLeaveData) {
        res.data = getLeaveData;
    } else {
        res.status = false;
    }
    return res;
}

const addLeaveBalance = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await leaveBalanceSchema(db).create(data);
    if (queryRes) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const updateLeaveBalance = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await leaveBalanceSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true });
    if (queryRes && queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const getEmpAppliedLeave = async (data, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const { request_for, parameter, status, limit, page, user } = data
    const cancelStatus = status == "cancelled" ? true : false
    const leaveStatus = status == "cancelled" ? "pending" : status
    const approvalCondition = { "approvers_dateils.action_type": leaveStatus, "approvers_dateils.type": parameter, }
    const leaveCondition = request_for == "applied" ? { emp_id: mongoose.Types.ObjectId(user.id), "is_cancel": cancelStatus } : ""
    const totalRecords = await leaveApplicationSchema(db).aggregate([
        { "$match": leaveCondition },
        {
            "$lookup": {
                from: 'approvers',
                localField: "_id",
                foreignField: "collection_id",
                as: "approvers_dateils"
            }
        },
        { $match: approvalCondition },
    ]).allowDiskUse();
    options = getAggregatePagination(options, totalRecords.length);
    const getLeaveData = await leaveApplicationSchema(db).aggregate([
        { "$match": leaveCondition },
        {
            "$lookup": {
                from: 'approvers',
                localField: "_id",
                foreignField: "collection_id",
                as: "approvers_dateils"
            }
        },
        // { $unwind: { path: "$approvers_dateils", preserveNullAndEmptyArrays: true }},
        { $match: approvalCondition },
        {
            "$lookup": {
                from: 'leave_types',
                localField: "leave_type",
                foreignField: "_id",
                as: "leave_data"
            }
        },
        { $unwind: { path: "$leave_data", preserveNullAndEmptyArrays: true } },
        {
            "$lookup": {
                from: 'employees',
                localField: 'emp_id',
                foreignField: "_id",
                as: "employee_dateils"
            }
        },
        { $unwind: { path: "$employee_dateils", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                emp_id: "$employee_dateils.emp_id",
                first_name: "$employee_dateils.name",
                last_name: "$employee_dateils.last_name",
                email: "$employee_dateils.email",
                employee_id: '$employee_dateils._id',
                leave_date: "$leave_start_date",
                leave_type: "$leave_type",
                leave_status: '$leave_status',
                reason: "$reason",
                type: { "$arrayElemAt": ["$approvers_dateils.type", 0] },
                approvel_id: { "$arrayElemAt": ["$approvers_dateils._id", 0] },
                leave_id: '$_id',
                leave_short_name: "$leave_data.short_name",
                is_cancel: "$is_cancel",
                approvers_status: { "$arrayElemAt": ["$approvers_dateils.action_type", 0] }
            }
        },
        options?.skips,
        options?.limits
    ]).allowDiskUse();
    const queryRes = {
        recordsTotal: totalRecords.length,
        recordsFiltered: totalRecords.length,
        totalPages: options?.totalPages,
        data: getLeaveData
    }
    if (queryRes && queryRes?.data?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const cancelLeave = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await leaveApplicationSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true });
    if (queryRes && queryRes._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const queryApproverLeaveDataByFilter = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    filter = filter?.approver_id ? { ...filter, approver_id: { $in: [mongoose.Types.ObjectId(filter?.approver_id)] } } : filter;
    const totalRecords = await approverSchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await approverSchema(db).aggregate([
        { "$match": filter },
        // { "$match": {type: "leave", approver_id: {$in: [ObjectId("66839ed301800bd91a9e9721")]}} },
        {
            "$lookup":
            {
                from: "leave_applications",
                localField: "collection_id",
                foreignField: "_id",
                as: "leave_data",
            },
        },
        {
            "$lookup":
            {
                from: "approvers",
                localField: "collection_id",
                foreignField: "collection_id",
                as: "approval_status",
            },
        },
        {
            "$lookup":
            {
                from: "employees",
                localField: "approval_status.approver_id",
                foreignField: "_id",
                as: "approver_data"
            }
        },

        {
            "$lookup": {
                from: 'leave_types',
                localField: "leave_data.leave_type",
                foreignField: "_id",
                as: "leave_balances_data"
            }
        },
        {
            "$lookup":
            {
                from: "employees",
                localField: "leave_data.emp_id",
                foreignField: "_id",
                as: "employee_dateils"
            }
        },
        {
            "$set": {
                approver_data: {
                    "$map": {
                        input: "$approver_data",
                        as: "role",
                        in: {
                            "$mergeObjects": [
                                "$$role",
                                {
                                    role_name: {
                                        "$let": {
                                            vars: {
                                                matchedRole: {
                                                    "$arrayElemAt": [
                                                        {
                                                            "$filter": {
                                                                input: "$role_data",
                                                                as: "role_name",
                                                                cond: { "$eq": ["$$role_name._id", "$$role.role_id"] }
                                                            }
                                                        },
                                                        0
                                                    ]
                                                }
                                            },
                                            in: { "$ifNull": ["$$matchedRole.name", ""] }
                                        }
                                    },
                                }
                            ]
                        }
                    }
                }
            }
        },
        {
            "$set": {
                approval_status: {
                    "$map": {
                        input: "$approval_status",
                        as: "approver",
                        in: {
                            "$mergeObjects": [
                                "$$approver",
                                {
                                    approver_name: {
                                        "$let": {
                                            vars: {
                                                matchedEmployee: {
                                                    "$arrayElemAt": [
                                                        {
                                                            "$filter": {
                                                                input: "$approver_data",
                                                                as: "employee",
                                                                cond: { "$eq": ["$$employee._id", "$$approver.action_by"] }
                                                            }
                                                        },
                                                        0
                                                    ]
                                                }
                                            },
                                            in: { "$ifNull": [{ $concat: ["$$matchedEmployee.name", ' (', "$$matchedEmployee.emp_id", ')'] }, ""] }
                                        }
                                    },
                                },
                                {
                                    role_name: {
                                        "$let": {
                                            vars: {
                                                matchedEmployee: {
                                                    "$arrayElemAt": [
                                                        {
                                                            "$filter": {
                                                                input: "$approver_data",
                                                                as: "employee",
                                                                cond: { "$eq": ["$$employee._id", "$$approver.action_by"] }
                                                            }
                                                        },
                                                        0
                                                    ]
                                                }
                                            },
                                            in: { "$ifNull": ["$$matchedEmployee.role_name", ""] }
                                        }
                                    },
                                },
                                {
                                    concatenated_name: {
                                        "$let": {
                                            vars: {
                                                matchedEmployee: {
                                                    "$filter": {
                                                        input: "$approver_data",
                                                        as: "employee",
                                                        cond: { "$in": ["$$employee._id", "$$approver.approver_id"] }
                                                    }
                                                }
                                            },
                                            in: {
                                                "$ifNull": [{
                                                    "$reduce": {
                                                        input: {
                                                            "$map": {
                                                                input: "$$matchedEmployee",
                                                                as: "user",
                                                                in: { $toString: "$$user._id" }
                                                            }
                                                        },
                                                        initialValue: "",
                                                        in: {
                                                            "$cond": {
                                                                if: { "$eq": ["$$value", ""] },
                                                                then: "$$this",
                                                                else: { "$concat": ["$$value", ", ", "$$this"] }
                                                            }
                                                        }
                                                    }
                                                }, ""]
                                            }
                                        }
                                    }
                                }


                            ]
                        }
                    }
                }
            }
        },
        {
            "$addFields": {
                last_approval: {
                    "$arrayElemAt": [
                        "$approval_status",
                        -1
                    ]
                },
                rejection: {
                    "$filter": {
                        input: "$approval_status",
                        as: "approval",
                        cond: { "$eq": ["$$approval.action_type", "reject"] }
                    }
                },
                pending: {
                    "$filter": {
                        input: "$approval_status",
                        as: "approval",
                        cond: { "$eq": ["$$approval.action_type", "pending"] }
                    }
                },
            }
        },
        {
            "$set":
            {
                emp_id: { "$arrayElemAt": ["$employee_dateils.emp_id", 0] },
                first_name: { "$arrayElemAt": ["$employee_dateils.name", 0] },
                last_name: { "$arrayElemAt": ["$employee_dateils.last_name", 0] },
                email: { "$arrayElemAt": ["$employee_dateils.email", 0] },
                employee_id: { "$arrayElemAt": ["$employee_dateils._id", 0] },
                leave_date: { "$arrayElemAt": ["$leave_data.leave_start_date", 0] },
                leave_status: { "$arrayElemAt": ["$leave_data.leave_status", 0] },
                reason: { "$arrayElemAt": ["$leave_data.reason", 0] },
                leave_id: { "$arrayElemAt": ["$leave_data._id", 0] },
                approvel_id: "$_id",
                leave_short_name: { "$arrayElemAt": ["$leave_balances_data.short_name", 0] },
                leave_type: { "$arrayElemAt": ["$leave_data.type", 0] },
                approval_status_name: {
                    "$cond": {
                        if: { "$gt": [{ "$size": "$rejection" }, 0] },
                        then: "reject",
                        else: {
                            "$cond": {
                                if: { "$gt": [{ "$size": "$pending" }, 0] },
                                then: "pending",
                                else: { "$arrayElemAt": ["$approval_status.action_type", -1] }
                            }
                        }
                    }
                },
                approval_action_to: {
                    "$cond": {
                        if: { "$gt": [{ "$size": "$rejection" }, 0] },
                        then: "$rejection.approver_name",
                        else: {
                            "$cond": {
                                if: { "$gt": [{ "$size": "$pending" }, 0] },
                                then: { "$arrayElemAt": ["$pending.concatenated_name", 0] },
                                else: { "$arrayElemAt": ["$approval_status.approver_name", -1] }
                            }
                        }
                    }
                },
            }
        },
    ])
    // const records = await approverSchema(db).aggregate([
    //     { "$match": filter },
    //     {
    //         "$lookup":
    //         {
    //             from: "leave_applications",
    //             localField: "collection_id",
    //             foreignField: "_id",
    //             as: "leave_data",
    //         }
    //     },
    //     {
    //         "$match": {
    //             "leave_data.is_cancel": false,
    //             "leave_data": { "$ne": [] }
    //         }
    //     }, { $unwind: { path: "$leave_data", preserveNullAndEmptyArrays: true } },
    //     {
    //         "$lookup": {
    //             from: 'leave_balances',
    //             localField: "leave_data.leave_type",
    //             foreignField: "_id",
    //             as: "leave_balances_data"
    //         }
    //     },
    //     { $unwind: { path: "$leave_balances_data", preserveNullAndEmptyArrays: true } },
    //     {
    //         "$lookup":
    //         {
    //             from: "employees",
    //             localField: "leave_data.emp_id",
    //             foreignField: "_id",
    //             as: "employee_dateils"
    //         }
    //     },
    //     { $unwind: { path: "$employee_dateils", preserveNullAndEmptyArrays: true } },
    //     {
    //         $project: {
    //             emp_id: "$employee_dateils.emp_id",
    //             first_name: "$employee_dateils.name",
    //             last_name: "$employee_dateils.last_name",
    //             email: "$employee_dateils.email",
    //             employee_id: '$employee_dateils._id',
    //             leave_date: "$leave_data.leave_start_date",
    //             leave_type: "$leave_data.leave_type",
    //             leave_status: '$leave_data.leave_status',
    //             reason: "$leave_data.reason",
    //             type: "type",
    //             approvel_id: "$_id",
    //             action_type: "$action_type",
    //             leave_short_name: "$leave_balances_data.leave_short_name"

    //         }
    //     },
    //     options?.skips,
    //     options?.limits
    // ]).allowDiskUse();
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

const getAllEmployeeLeave = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const checkLeave = await leaveApplicationSchema(db).find({ leave_start_date: { $gte: filter.start_date, $lt: filter.end_date } })
    if (checkLeave && checkLeave?.length) {
        res.data = checkLeave;
    } else {
        res.status = false;
    }
    return res;
}

const rejectLeave = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const records = await leaveApplicationSchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup":
            {
                from: "leave_balances",
                localField: "emp_code",
                foreignField: "emp_id",
                as: "leave_balances_data"
            }
        }, {
            "$unwind": "$leave_balances_data"
        }, {
            "$match": {
                "$expr": {
                    "$eq": ["$leave_balances_data._id", "$leave_type"]
                }
            }
        },
        {
            $project: {
                emp_id: "$emp_id",
                leave_start_date: "$leave_start_date",
                leave_type: "$leave_type",
                leave_status: "$leave_status",
                leave_balance: "$leave_balances_data.leave_balance",
                emp_id: "$emp_code"
            }
        },
    ])

    if (records) {
        res.data = records;
    } else {
        res.status = false;
    }
    return res;
}

const getLeaveProgress = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const records = await leaveApplicationSchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup": {
                from: "approvers",
                localField: "_id",
                foreignField: "collection_id",
                as: "approval_status",
                pipeline: [
                    {
                        $lookup: {
                            from: "employees",
                            localField: "approver_id",
                            foreignField: "_id",
                            as: "employee_data",
                            pipeline: [
                                {
                                    $lookup: {
                                        from: "roles",
                                        localField: "role_id",
                                        foreignField: "_id",
                                        as: "role_data"
                                    }
                                },
                                {
                                    $project: {
                                        emp_id: 1,
                                        name: 1,
                                        email: 1,
                                        role_name: { $arrayElemAt: ["$role_data.name", 0] }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $project: {
                            approver_id: 1,
                            comment: 1,
                            action_type: 1,
                            employee_data: { $arrayElemAt: ["$employee_data", 0] }
                        }
                    }
                ]
            }
        },
        {
            "$set": {
                approver_data: {
                    "$map": {
                        input: "$approval_status",
                        as: "status",
                        in: {
                            emp_id: "$$status.employee_data.emp_id",
                            name: "$$status.employee_data.name",
                            email: "$$status.employee_data.email",
                            role_name: "$$status.employee_data.role_name",
                            comment: "$$status.comment",
                            action_type: "$$status.action_type"
                        }
                    }
                }
            }
        },
        {
            "$project": {
                approval_status: 0
            }
        }
    ]);

    console.log("sdfdsf", records)
    if (records) {
        res.data = records
    } else {
        res.status = false
    }
    return res
}

const getFilteredLeaveBalanceData = async (condition) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await leaveBalanceLogsSchema(db).aggregate([
        { "$match": condition },
        {
            $lookup: {
                from: "leave_types",
                localField: "leave_type_id",
                foreignField: "_id",
                as: "leave_info"
            }
        },
        {
            $unwind: {
                path: "$leave_info",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "employees",
                localField: "emp_id",
                foreignField: "_id",
                as: "emp_user_info"
            }
        },
        {
            $unwind: {
                path: "$emp_user_info",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
                _id: {
                    emp_id: "$emp_user_info.emp_id",
                    employee_id: "$emp_user_info._id",
                    leave_name: "$leave_info.name",
                    leave_short_name: "$leave_info.short_name",
                },
                total_leave_credited: {
                    $sum: {
                        $cond: [
                            { $and: [{ $eq: ["$status", "CR"] }, { $eq: ["$is_approved", true] }] },
                            "$leave_value",
                            0
                        ]
                    }
                },
                total_leave_debited: {
                    $sum: {
                        $cond: [
                            { $eq: ["$status", "DR"] },
                            "$leave_value",
                            0
                        ]
                    }
                }
            }
        },
        {
            $project: {
                leave_type: "$_id.leave_type",
                employee_id: "$_id.employee_id",
                emp_id: "$_id.emp_id",
                leave_name: "$_id.leave_name",
                leave_short_name: "$_id.leave_short_name",
                total_leave_credited: 1,
                total_leave_debited: 1,
                leave_balance: {
                    $subtract: ["$total_leave_credited", "$total_leave_debited"]
                }
            }
        }
    ]).allowDiskUse();
    if (queryRes && queryRes?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const queryApprovedLeave = async (condition) => {
    const res = getServiceResFormat();
    let db = getDb()
    condition = condition?.emp_id ? { ...condition, emp_id: mongoose.Types.ObjectId(condition?.emp_id) } : condition;
    condition = condition?.leave_start_date ? { ...condition, leave_start_date: condition?.leave_start_date } : condition;
    const queryRes = await leaveApplicationSchema(db).aggregate([
        { "$match": condition },
        {
            "$lookup": {
                from: "approvers",
                localField: "_id",
                foreignField: "collection_id",
                as: "approval_status"
            }
        },
        {
            "$lookup": {
                from: "leave_types",
                localField: "leave_type",
                foreignField: "_id",
                as: "leave_data"
            }
        },
        {
            "$addFields": {
                rejection: {
                    "$filter": {
                        input: "$approval_status",
                        as: "approval",
                        cond: { "$eq": ["$$approval.action_type", "reject"] }
                    }
                },
                pending: {
                    "$filter": {
                        input: "$approval_status",
                        as: "approval",
                        cond: { "$eq": ["$$approval.action_type", "pending"] }
                    }
                },
            }
        },
        {
            "$set":
            {
                approval_status_name: {
                    "$cond": {
                        if: { "$gt": [{ "$size": "$rejection" }, 0] },
                        then: "reject",
                        else: {
                            "$cond": {
                                if: { "$gt": [{ "$size": "$pending" }, 0] },
                                then: "pending",
                                else: { "$arrayElemAt": ["$approval_status.action_type", -1] }
                            }
                        }
                    }
                },
                leave_short_name: {
                    "$arrayElemAt": ["$leave_data.short_name", 0]
                },
            }
        },
        { $match: { approval_status_name: "approve" } }
    ]);
    if (queryRes && queryRes?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const queryLeaveApplicationOnFilter = async (condition) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await leaveApplicationSchema(db).find(condition);
    if (queryRes && queryRes?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const creditDebitLeave = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await leaveBalanceLogsSchema(db).create(data);
    if (queryRes) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}
const getLeaveDetails = async (filter) => {
    const res = getServiceResFormat()
    let db = getDb()
    const query = await leaveApplicationSchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup": {
                from: "leave_types",
                localField: "leave_type",
                foreignField: "_id",
                as: "leave_details"
            }
        },
        {
            "$set":
            {
                leave_name: { "$arrayElemAt": ["$leave_details.name", 0] },
                leave_short_name: { "$arrayElemAt": ["$leave_details.short_name", 0] },
            }
        },
        {
            "$project": {
                "leave_details": 0
            }
        },
    ])
    if (query.length) {
        res.data = query;
    } else {
        res.status = false;
    }
    return res;
}

const getEmployeeLeave = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const query = await leaveTypeSchema(db).aggregate([
        {
            "$lookup": {
                from: "leave_balances",
                localField: "_id",
                foreignField: "leave_type",
                as: "leave_details"
            }
        },
        {
            "$unwind": {
                path: "$leave_details",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            "$match": {
                $or: [
                    { "leave_details.employee_id": filter.employee_id },
                    { "leave_details": null }
                ]
            }
        },
        {
            "$project": {
                "leave_type": "$name",
                "leave_balance": { $ifNull: ["$leave_details.leave_balance", 0] }
            }
        }
    ])

    if (query && query.length) {
        res.data = query
    } else {
        res.status = false
    }
    return res;
}

const getLeaveToday = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await leaveApplicationSchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup": {
                from: "approvers",
                localField: "_id",
                foreignField: "collection_id",
                as: "approvers_details"
            }
        },
        {
            $lookup: {
                from: "employees",
                localField: "emp_id",
                foreignField: "_id",
                as: "employee_details"
            }
        },
        // {
        //             "$match": {
        //                 "approvers_details": {
        //                     "$not": { "$elemMatch": { "action_type": { "$ne": "approve" } } }
        //                 }
        //             }
        //         },
        {
            "$match": {
                "$or": [
                    { "approvers_details": { "$size": 0 } },
                    { "approvers_details": { "$not": { "$elemMatch": { "action_type": { "$ne": "approve" } } } } }
                ]
            }
        },
        {
            "$addFields": {
                "is_planned_leave": {
                    "$cond": {
                        "if": { "$lt": ["$created_at", { "$toDate": "$leave_start_date" }] },
                        "then": true,
                        "else": false
                    }
                }
            }
        },
        {
            "$project": {
                "name": { $arrayElemAt: ['$employee_details.name', 0] },
                "emp_id": { $arrayElemAt: ['$employee_details.emp_id', 0] },
                "is_planned_leave": "$is_planned_leave",
                "leave_status": "$leave_status"
            }
        }
    ]);
    if (record && record.length) {
        res.data = record
    } else {
        res.status = false
    }
    return res
}

const getLeaveSetting = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await leaveSettingSchema(db).find(filter);
    if (record && record.length) {
        res.data = record;
    } else {
        res.status = false;
    }
    return res
}

module.exports = {
    addLeaveType,
    queryLeaveType,
    updateLeaveType,
    addLeaveSetting,
    queryLeaveSetting,
    updateLeaveSetting,
    applyLeave,
    getLeaveTypeList,
    getFilteredLeaveBalanceData,
    queryApprovedLeave,
    getLeaveBalance,
    addLeaveBalance,
    updateLeaveBalance,
    getEmpAppliedLeave,
    cancelLeave,
    queryApproverLeaveDataByFilter,
    getAllEmployeeLeave,
    rejectLeave,
    getLeaveProgress,
    queryLeaveApplicationOnFilter,
    creditDebitLeave,
    getLeaveDetails,
    getEmployeeLeave,
    getLeaveToday,
    getLeaveSetting,
};