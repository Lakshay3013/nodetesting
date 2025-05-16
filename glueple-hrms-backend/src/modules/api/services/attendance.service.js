
const attendanceRawEntriesSchema = require('../../../models/attendanceRawEntries.model');
const calculatedAttendanceSchema = require('../../../models/calculatedAttendance.model');
const correctionApplicationSchema = require('../../../models/correctionApplication.model')
const coffApplicationSchema = require('../../../models/compOffApplication.model')
const tourApplicationSchema = require('../../../models/tourApplication.model')
const leaveApplicationModel = require('../../../models/leaveApplication.model')
const approverSchema = require('../../../models/approvers.model')
const employeeSchema = require('../../../models/employee.model')
const { getServiceResFormat, isExistLeave, getAggregatePagination, getDb } = require('../utils/appHelper');
const mongoose = require('mongoose')
const httpStatus = require('http-status');
const ApiError = require('../../../helpers/ApiError');
const attendanceLockSchema = require('../../../models/attendanceLock.model');
const departmentSchema = require('../../../models/department.model');

const addRawEntryData = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const attendanceRawEntriesModel = attendanceRawEntriesSchema(db);
    const queryRes = await attendanceRawEntriesModel.create(data);
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const getRawEntryData = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const attendanceRawEntriesModel = attendanceRawEntriesSchema(db);
    const queryRes = await attendanceRawEntriesModel.aggregate([
        {
            "$match": filter
        },
        { $sort: { punch_time: 1 } } 
    ]);
    if (queryRes && queryRes?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const bulkAddUpdateCalculatedAttendance = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const calculatedAttendanceModel = calculatedAttendanceSchema(db);
    let bulk = calculatedAttendanceModel.collection.initializeUnorderedBulkOp();
    for (let i = 0; i < data?.length; i++) {
        const item = data[i];
        bulk.find({ emp_id: item.emp_id, attendance_date: item.attendance_date }).upsert().updateOne({ $set: item });
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

const getMonthlyAttendance = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const calculatedAttendanceModel = calculatedAttendanceSchema(db);
    const queryRes = await calculatedAttendanceModel.find(filter)
    if (queryRes && queryRes?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const attendanceCorrection = async (data) => {
    const res = getServiceResFormat();
    // const checkLeave = await leaveApplicationModel.find({emp_id:mongoose.Types.ObjectId(data.emp_id),is_cancel:false,leave_start_date:{$gte:data.date,$lte:data.date}})
    // if (checkLeave && checkLeave.length > 0) {
    // const getLeaveData = isExistLeave(leaveDetails, checkLeave);
    // if(!getLeaveData?.status){
    //     throw new ApiError(httpStatus.BAD_REQUEST, `Leave Already Applied for ${getLeaveData?.msg}`);
    //   }
    // }
    let db = getDb()
    const correctionApplicationModel = correctionApplicationSchema(db);
    const checkAttendanceCorrection = await correctionApplicationModel.find({ emp_id: mongoose.Types.ObjectId(data.emp_id), date: { $gte: data.date, $lte: data.date } })
    if (checkAttendanceCorrection.length) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Correction Already Applied for ${data.date}`)
    }
    const queryRes = await correctionApplicationModel.create(data);
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const getAttendanceCorrectionRequest = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const correctionApplicationModel = correctionApplicationSchema(db);
    const { request_for, parameter, status, limit, page, user } = filter
    const approvalCondition = status == '' ? { "approvers_details.type": parameter } : { "approvers_details.action_type": status, "approvers_details.type": parameter }
    const Condition = request_for == "applied" ? { emp_id: mongoose.Types.ObjectId(user.id) } : ""
    const totalRecords = await correctionApplicationModel.find(Condition).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await correctionApplicationModel.aggregate([
        { "$match": Condition },
        {
            "$lookup": {
                from: 'approvers',
                localField: "_id",
                foreignField: "collection_id",
                as: "approvers_details"
            }
        },
        { $match: approvalCondition },
        {
            "$lookup": {
                from: 'employees',
                localField: 'emp_id',
                foreignField: "_id",
                as: "employee_details"
            }
        },
        { $unwind: { path: "$employee_details", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                emp_id: "$employee_details.emp_id",
                first_name: "$employee_details.name",
                last_name: "$employee_details.last_name",
                email: "$employee_details.email",
                employee_id: '$employee_details._id',
                correction_check_out_time: "$correction_check_out_time",
                correction_check_in_time: "$correction_check_in_time",
                check_out_reason: '$check_out_reason',
                check_in_reason: '$check_in_reason',
                type: "$type",
                date: "$date",
                reason: "$reason",
                approvel_id: { "$arrayElemAt": ["$approvers_details._id", 0] },
                leave_id: '$_id',
                leave_short_name: "$leave_data.leave_short_name",
                is_cancel: "$is_cancel",
                approvers_status: { "$arrayElemAt": ["$approvers_details.action_type", 0] }
            }
        },
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

const getAttendanceCorrectionApproval = async (filter, options) => {
    const res = getServiceResFormat();
    filter = filter?.approver_id ? { ...filter, approver_id: { $in: [mongoose.Types.ObjectId(filter?.approver_id)] } } : filter;
    let db = getDb()
    const approverModel = approverSchema(db);
    const totalRecords = await approverModel.find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await approverModel.aggregate([
        { "$match": filter },
        {
            "$lookup":
            {
                from: "correction_applications",
                localField: "collection_id",
                foreignField: "_id",
                as: "correction_data",
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
            "$lookup":
            {
                from: "employees",
                localField: "correction_data.emp_id",
                foreignField: "_id",
                as: "employee_details"
            }
        },
        {
            "$lookup":
            {
                from: "designations",
                localField: "employee_details.designation_id",
                foreignField: "_id",
                as: "designations_details"
            }
        },
        {
            "$lookup":
            {
                from: "roles",
                localField: "approver_data.role_id",
                foreignField: "_id",
                as: "role_data"
            },
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
                emp_id: { "$arrayElemAt": ["$employee_details.emp_id", 0] },
                name: { "$arrayElemAt": ["$employee_details.name", 0] },
                email: { "$arrayElemAt": ["$employee_details.email", 0] },
                employee_id: { "$arrayElemAt": ["$employee_details._id", 0] },
                date: { "$arrayElemAt": ["$correction_data.date", 0] },
                correction_check_out_time: { "$arrayElemAt": ["$correction_data.correction_check_out_time", 0] },
                correction_check_in_time: { "$arrayElemAt": ["$correction_data.correction_check_in_time", 0] },
                check_out_reason: { "$arrayElemAt": ["$correction_data.check_out_reason", 0] },
                check_in_reason: { "$arrayElemAt": ["$correction_data.check_in_reason", 0] },
                attendance_type: { "$arrayElemAt": ["$correction_data.type", 0] },
                designations_name: { "$arrayElemAt": ["$designations_details.name", 0] },
                approvel_id: "$_id",
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
const getAttendanceLogs = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const attendanceRawEntriesModel = attendanceRawEntriesSchema(db);
    const queryRes = await attendanceRawEntriesModel.aggregate([
        { "$match": filter },
        {
            "$set": {
                device_from_name: {
                    "$replaceAll": {
                        "input": {
                            "$concat": [
                                {
                                    "$toUpper": {
                                        "$substrCP": [
                                            { "$ifNull": ["$device_from", ""] },
                                            0,
                                            1
                                        ]
                                    }
                                },
                                {
                                    "$substrCP": [
                                        { "$ifNull": ["$device_from", ""] },
                                        1,
                                        { "$strLenCP": { "$ifNull": ["$device_from", ""] } }
                                    ]
                                }
                            ]
                        },
                        "find": "_",
                        "replacement": " "
                    }
                },
            }
        }
    ]);
    if (queryRes && queryRes?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};
const getAttendanceCorrectionProgress = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const correctionApplicationModel = correctionApplicationSchema(db);
    const records = await correctionApplicationModel.aggregate([
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
    if (records) {
        res.data = records
    } else {
        res.status = false
    }
    return res
}

const correctionDetail = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const approverModel = approverSchema(db);
    const records = await approverModel.aggregate([
        { "$match": filter },
        {
            "$lookup":
            {
                from: "correction_applications",
                localField: "collection_id",
                foreignField: "_id",
                as: "correction_data",
            },
        },
        { "$unwind": { path: "$correction_data", preserveNullAndEmptyArrays: true } },
        {
            "$lookup":
            {
                from: "approvers",
                localField: "correction_data._id",
                foreignField: "collection_id",
                as: 'approver_details'

            }
        },
        {
            "$replaceRoot": {
                newRoot: {
                    $mergeObjects: ["$$ROOT", "$correction_data"]
                }
            }
        }])
    if (records.length) {
        res.data = records
    } else {
        res.status = false
    }
    return res

}
const updateAttendance = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const calculatedAttendanceModel = calculatedAttendanceSchema(db);
    const updateQuery = await calculatedAttendanceModel.findOneAndUpdate(filter, update)
    if (updateQuery._id) {
        res.data = updateQuery
    } else {
        res.status = false
    }
    return res

}
const addAttendance = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const calculatedAttendanceModel = calculatedAttendanceSchema(db);
    const addData = await calculatedAttendanceModel.create(data)
    if (addData._id) {
        res.data = addData
    } else {
        res.status = false
    }
    return res
}

const getSelfAttendance = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const calculatedAttendanceModel = calculatedAttendanceSchema(db);
    const totalRecords = await calculatedAttendanceModel.find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await calculatedAttendanceModel.aggregate([
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

const getMyTeamAttendance = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const getFilter = { reported_to: filter?.reported_to }
    const totalRecords = await employeeSchema(db).find(getFilter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await employeeSchema(db).aggregate([
        {
            $match: getFilter
        },
        {
            $lookup: {
                from: "calculated_attendances",
                let: { empId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$emp_id", "$$empId"] },
                                    { $gte: ["$attendance_date", filter?.start_date] },
                                    { $lte: ["$attendance_date", filter?.end_date] }
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalWorkingDays: {
                                $sum: {
                                    $cond: [
                                        {
                                            $and: [
                                                { $ne: ["$total_working_hours", null] },
                                                { $ne: ["$total_working_hours", ""] }
                                            ]
                                        },
                                        1,
                                        0
                                    ]
                                }
                            },

                            presentDays: {
                                $sum: {
                                    $switch: {
                                        branches: [
                                            { case: { $eq: ["$attendance_status", "PR"] }, then: 1 },
                                            { case: { $in: ["$attendance_status", ["SHP", "FHP"]] }, then: 0.5 }
                                        ],
                                        default: 0
                                    }
                                }
                            },
                            absentDays: {
                                $sum: {
                                    $switch: {
                                        branches: [
                                            { case: { $eq: ["$attendance_status", "AB"] }, then: 1 },
                                            { case: { $in: ["$attendance_status", ["SHP", "FHP"]] }, then: 0.5 }
                                        ],
                                        default: 0
                                    }
                                }
                            },
                            leavesTaken: {
                                $sum: {
                                    $cond: [
                                        {
                                            $not: [
                                                { $in: ["$attendance_status", ["PR", "AB", "WO", "WO_P", "SHP", "FHP"]] }
                                            ]
                                        },
                                        1,
                                        0
                                    ]
                                }
                            }

                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            totalWorkingDays: 1,
                            presentDays: 1,
                            absentDays: 1,
                            leavesTaken: 1
                        }
                    }
                ],
                as: "attendance_summary"
            }
        },
        {
            $project: {
                name: 1,
                emp_id: 1,
                total_working_days: { $arrayElemAt: ["$attendance_summary.totalWorkingDays", 0] },
                present_days: { $arrayElemAt: ["$attendance_summary.presentDays", 0] },
                absent_days: { $arrayElemAt: ["$attendance_summary.absentDays", 0] },
                leaves_taken: { $arrayElemAt: ["$attendance_summary.leavesTaken", 0] }

            }
        },
        options?.skips,
        options?.limits
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


const getAllTeamAttendance = async (filter, options) => {
    const res = getServiceResFormat();
    const getFilter = { _id: filter?.id }
    let db = getDb()
    const departmentModel = departmentSchema(db);
    const totalRecords = await departmentModel.find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    // console.log("sdfsdf",getFilter,filter)
    // const records = await departmentModel.aggregate([
    //     {
    //         $match: filter
    //     },
    //     {
    //         "$lookup": {
    //             from: "employees",
    //             localField: "_id",
    //             foreignField: "department_id",
    //             as: "employees_details",
    //         }
    //     },
    //     {
    //         $addFields: {
    //             number_of_employees: { $size: "$employees_details" }
    //         }
    //     },
    //     {
    //         $project: {
    //             employees_details: 0 
    //         }
    //     },
    //     options?.skips,
    //     options?.limits
    // ])

    const records = await departmentModel.aggregate([
    {
        $match: filter
    },
    {
        $lookup: {
            from: "employees",
            localField: "_id",
            foreignField: "department_id",
            as: "employees_details"
        }
    },
    {
        $addFields: {
            number_of_employees: { $size: "$employees_details" }
        }
    },
    {
        $lookup: {
            from: "calculated_attendances",
            let: { empIds: "$employees_details._id" },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $in: ["$emp_id", "$$empIds"]
                        }
                    }
                },
                {
                    $group: {
                        _id: "$attendance_status",
                        count: { $sum: 1 }
                    }
                }
            ],
            as: "attendance_summary"
        }
    },
    {
        $addFields: {
            present: {
                $ifNull: [
                    {
                        $first: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: "$attendance_summary",
                                        as: "a",
                                        cond: { $eq: ["$$a._id", "PR"] }
                                    }
                                },
                                as: "p",
                                in: "$$p.count"
                            }
                        }
                    },
                    0
                ]
            },
            absent: {
                $ifNull: [
                    {
                        $first: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: "$attendance_summary",
                                        as: "a",
                                        cond: { $eq: ["$$a._id", "AB"] }
                                    }
                                },
                                as: "a",
                                in: "$$a.count"
                            }
                        }
                    },
                    0
                ]
            }
        }
    },
    {
        $project: {
            employees_details: 0,
            attendance_summary:0
        }
    },
    options?.skips,
    options?.limits
]);
    const queryRes = {
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        totalPages: options?.totalPages,
        data: records
    }
    // console.log("sdfsdf",records)
    if (queryRes && queryRes?.data?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;

}

const getEmployeeAttendance = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const calculatedAttendanceModel = calculatedAttendanceSchema(db);
    const records = await calculatedAttendanceModel.find(filter)
    if (records.length) {
        res.data = records
    } else {
        res.status = false

    }
    return res
}

const attendanceReport = async (filter) => {
    const res = getServiceResFormat();
    const employeeIdsObjectId = filter?.employeeIds.length == 0 ? [] : filter?.employeeIds?.map(id => mongoose.Types.ObjectId(id));
    let db = getDb()
    const calculatedAttendanceModel = calculatedAttendanceSchema(db);
    const records = await calculatedAttendanceModel.aggregate([
        {
            $lookup: {
                from: "employees",
                localField: "emp_id",
                foreignField: "_id",
                as: "employee_details"
            }
        },
        {
            $match: {
                attendance_date: { $gte: filter.start_date, $lte: filter.end_date },
                emp_id: {
                    $not: { $regex: "test", $options: "i" },
                    ...(employeeIdsObjectId.length > 0 ? { $in: employeeIdsObjectId } : {})
                },
            }
        },
        {
            $project:
            {
                _id: 0,
                employee_id:{ "$arrayElemAt": ["$employee_details._id", 0] },
                emp_id: { "$arrayElemAt": ["$employee_details.emp_id", 0] },
                name: { "$arrayElemAt": ["$employee_details.name", 0] },
                email: { "$arrayElemAt": ["$employee_details.email", 0] },
                attendance_date: "$attendance_date",
                day_of_week: "$day_of_week",
                first_half_status: "$first_half_status",
                second_half_status: "$second_half_status",
                first_check_in_time: "$first_check_in_time",
                last_check_out_time: "$last_check_out_time",
                total_working_hours: "$total_working_hours",
                total_break_time: "$total_break_time",
                duration: "$duration",
                attendance_status: "$attendance_status",
            }
        }
    ])
    
    if (records && records.length) {
        res.data = records
    } else {
        res.status = false
    }
    return res
}

const compOffApplication = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const compOffApplicationModel = coffApplicationSchema(db);
    const addData = await compOffApplicationModel.create(data)
    if (addData._id) {
        res.data = addData
    } else {
        res.status = false
    }
    return res
}

const getCompOffApproval = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const approverModel = approverSchema(db);
    filter = filter?.approver_id ? { ...filter, approver_id: { $in: [mongoose.Types.ObjectId(filter?.approver_id)] } } : filter;
    const totalRecords = await approverModel.find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await approverModel.aggregate([
        { "$match": filter },
        {
            "$lookup":
            {
                from: "compOff_applications",
                localField: "collection_id",
                foreignField: "_id",
                as: "comp_data",
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
            "$lookup":
            {
                from: "employees",
                localField: "comp_data.emp_id",
                foreignField: "_id",
                as: "employee_details"
            }
        },
        {
            "$lookup":
            {
                from: "designations",
                localField: "employee_details.designation_id",
                foreignField: "_id",
                as: "designations_details"
            }
        },
        {
            "$lookup":
            {
                from: "roles",
                localField: "approver_data.role_id",
                foreignField: "_id",
                as: "role_data"
            },
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
                emp_id: { "$arrayElemAt": ["$employee_details.emp_id", 0] },
                name: { "$arrayElemAt": ["$employee_details.name", 0] },
                email: { "$arrayElemAt": ["$employee_details.email", 0] },
                employee_id: { "$arrayElemAt": ["$employee_details._id", 0] },
                date: { "$arrayElemAt": ["$comp_data.date", 0] },
                status: { "$arrayElemAt": ["$comp_data.status", 0] },
                working_hours: { "$arrayElemAt": ["$comp_data.working_hours", 0] },
                designations_name: { "$arrayElemAt": ["$designations_details.name", 0] },
                approvel_id: "$_id",
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


const getCompOffDetails = async (filter) => {
    const res = getServiceResFormat()
    let db = getDb()
    const compOffApplicationModel = coffApplicationSchema(db);
    const query = await compOffApplicationModel.aggregate([
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

const tourApplication = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const tourApplicationModel = tourApplicationSchema(db);
    const addData = await tourApplicationModel.create(data)
    if (addData._id) {
        res.data = addData
    } else {
        res.status = false
    }
    return res
}

const getTourApproval = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const approverModel = approverSchema(db);
    filter = filter?.approver_id ? { ...filter, approver_id: { $in: [mongoose.Types.ObjectId(filter?.approver_id)] } } : filter;
    const totalRecords = await approverModel.find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await approverModel.aggregate([
        { "$match": filter },
        {
            "$lookup":
            {
                from: "tour_applications",
                localField: "collection_id",
                foreignField: "_id",
                as: "comp_data",
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
            "$lookup":
            {
                from: "employees",
                localField: "comp_data.emp_id",
                foreignField: "_id",
                as: "employee_details"
            }
        },
        {
            "$lookup":
            {
                from: "designations",
                localField: "employee_details.designation_id",
                foreignField: "_id",
                as: "designations_details"
            }
        },
        {
            "$lookup":
            {
                from: "roles",
                localField: "approver_data.role_id",
                foreignField: "_id",
                as: "role_data"
            },
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
                emp_id: { "$arrayElemAt": ["$employee_details.emp_id", 0] },
                name: { "$arrayElemAt": ["$employee_details.name", 0] },
                email: { "$arrayElemAt": ["$employee_details.email", 0] },
                employee_id: { "$arrayElemAt": ["$employee_details._id", 0] },
                date: { "$arrayElemAt": ["$comp_data.date", 0] },
                status: { "$arrayElemAt": ["$comp_data.status", 0] },
                working_hours: { "$arrayElemAt": ["$comp_data.working_hours", 0] },
                designations_name: { "$arrayElemAt": ["$designations_details.name", 0] },
                approvel_id: "$_id",
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

const getTourDetails = async (filter) => {
    const res = getServiceResFormat()
    let db = getDb()
    const compOffApplicationModel = coffApplicationSchema(db);
    const query = await compOffApplicationModel.aggregate([
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

const getAllAttendance = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const calculatedAttendanceModel = calculatedAttendanceSchema(db);
    const records = await calculatedAttendanceModel.aggregate([
        {
            "$match": filter
        }
    ]);
    if (records && records?.length) {
        res.data = records;
    } else {
        res.status = false;
    }
    return res;
}
const deleteRawEntryData = async(filter)=>{
    const res = getServiceResFormat();
    let db = getDb()
    const attendanceRawEntriesModel = attendanceRawEntriesSchema(db);
    const record = await attendanceRawEntriesModel.deleteMany(filter)
    if(record){
        res.data = record;
    }else{
        res.status = false;
    }
    return res;
}

const bulkUpdateRawEntry = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const attendanceRawEntriesModel = attendanceRawEntriesSchema(db);
    let bulk = attendanceRawEntriesModel.collection.initializeUnorderedBulkOp();
    for (let i = 0; i < data?.length; i++) {
        const item = data[i];
        bulk.find({ emp_id: item.emp_id, punch_time: item.attendance_date }).upsert().updateOne({ $set: item });
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

const createAttendanceLock = async(data)=>{
    const res = getServiceResFormat();
    let db = getDb()
    const attendanceLockModel = attendanceLockSchema(db);
    const addRecord = await attendanceLockModel.create(data)
    if(addRecord){
        res.data = addRecord
    }else{
        res.status = false;
    }
    return res;
}

const getAttendanceLock = async(filter)=>{
    const res = getServiceResFormat();
    let db = getDb()
    const attendanceLockModel = attendanceLockSchema(db);
    const record = await attendanceLockModel.find(filter);
    if(record && record.length){
        res.data = record;
    }else{
        res.status = false
    }
    return res
}
const updateAttendanceLock = async(filter, update)=>{
    const res = getServiceResFormat();
    let db = getDb()
    const attendanceLockModel = attendanceLockSchema(db);
    const updateRecord = await attendanceLockModel.findOneAndUpdate(filter, { $set: update }, { new: true })
    if(updateRecord){
        res.data = updateRecord;
    }else{
        res.status = false
    }
    return res;
}
const getAllAttendanceLock = async(filter, options)=>{
     const res = getServiceResFormat()
     let db = getDb()
    const attendanceLockModel = attendanceLockSchema(db);
        const totalRecords = await attendanceLockModel.find(filter).count();
        options = getAggregatePagination(options, totalRecords);
        const records = await attendanceLockModel.aggregate([
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
    addRawEntryData,
    getRawEntryData,
    bulkAddUpdateCalculatedAttendance,
    getMonthlyAttendance,
    attendanceCorrection,
    getAttendanceCorrectionRequest,
    getAttendanceCorrectionApproval,
    getAttendanceLogs,
    getAttendanceCorrectionProgress,
    correctionDetail,
    updateAttendance,
    addAttendance,
    getSelfAttendance,
    getMyTeamAttendance,
    getAllTeamAttendance,
    getEmployeeAttendance,
    attendanceReport,
    compOffApplication,
    getCompOffApproval,
    getCompOffDetails,
    tourApplication,
    getTourApproval,
    getTourDetails,
    getAllAttendance,
    deleteRawEntryData,
    bulkUpdateRawEntry,
    getAttendanceLock,
    createAttendanceLock,
    updateAttendanceLock,
    getAllAttendanceLock
};