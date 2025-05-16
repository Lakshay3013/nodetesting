const travelTypeSchema = require('../../../models/travelType.model')
const travelApplicationSchema = require('../../../models/travelApplication.model')
const { getServiceResFormat, getFindPagination, getAggregatePagination, getDb } = require('../utils/appHelper');
const approverSchema = require('../../../models/approvers.model');
const mongoose = require("mongoose");
const travelAndClaimRuleSchema = require('../../../models/travelAndClaimRule.model');
const claimApplicationSchema = require('../../../models/claimApplication.model');
const travelAndClaimAssignRuleSchema = require('../../../models/travelAndClaimAssignRule.model');


const addTravelType = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    // const attendanceRawEntriesModel = attendanceRawEntriesSchema(db);
    const addTravel = await travelTypeSchema(db).create(data);
    if (addTravel) {
        res.data = addTravel
    } else {
        res.status = false;
    }
    return res;
}

const getTraveType = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const totalRecords = await travelTypeSchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await travelTypeSchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup": {
                from: 'dropdown_masters',
                localField: "travel_category",
                foreignField: "_id",
                as: "dropdown_master_details"
            }
        },
        { $unwind: { path: "$dropdown_master_details", preserveNullAndEmptyArrays: true } },
        {
            "$set": {
                label: "$name",
                value: "$_id",
                travel_category_label: "$dropdown_master_details.category_key",
                travel_category_value: "$dropdown_master_details._id"
            }
        },
        {
            "$project": {
                dropdown_master_details: 0
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

const getAllTravelType = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const records = await travelTypeSchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup": {
                from: 'dropdown_masters',
                localField: "travel_category",
                foreignField: "_id",
                as: "dropdown_master_details"
            }
        },
        { $unwind: { path: "$dropdown_master_details", preserveNullAndEmptyArrays: true } },
        {
            "$set": {
                label: "$name",
                value: "$_id",
                travel_category_label: "$dropdown_master_details.category_key",
                travel_category_value: "$dropdown_master_details._id"
            }
        },
        {
            "$project": {
                dropdown_master_details: 0
            }
        }
    ]).allowDiskUse();
    if (records && records.length) {
        res.data = records
    } else {
        res.status = false;
    }
    return res;
}

const updateTravelType = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const records = await travelTypeSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true });
    if (records) {
        res.data = records;
    } else {
        res.status = false;
    }
    return res;
}

const deleteTravelType = async (filter) => {
    const res = getServiceResFormat();
    const records = await travelTypeSchema(db).findByIdAndDelete(filter)
    if (records) {
        res.data = records;
    } else {
        res.status = false;
    }
    return res;
}

const addTravel = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const records = await travelApplicationSchema(db).create(data);
    if (records) {
        res.data = records
    } else {
        res.status = false;
    }
    return res;
}

const getTravel = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const totalRecords = await travelApplicationSchema(db).find(filter).count();
    const limits = getFindPagination(options, totalRecords);
    const records = await travelApplicationSchema(db).find(filter, {}, limits?.limits).allowDiskUse();
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
}

const updateTravel = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const records = await travelApplicationSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true });
    if (records) {
        res.data = records;
    } else {
        res.status = false;
    }
    return res;
}

const deleteTravel = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const records = await travelApplicationSchema(db).findByIdAndDelete(filter);
    if (records) {
        res.data = records;
    } else {
        res.status = false
    }
    return res
}

const getTravelRequest = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const { approver_id, type, action_type, user } = filter
    // const approvalCondition = action_type == '' ? { "approvers_details.type": type } : { "approvers_details.action_type": action_type, "approvers_details.type": type }
    const approvalCondition = { "approvers_details.type": type }
    const Condition = { employee_id: mongoose.Types.ObjectId(approver_id) }
    const totalRecords = await travelApplicationSchema(db).find(Condition).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await travelApplicationSchema(db).aggregate([
        { "$match": Condition },
        {
            "$lookup": {
                from: 'approvers',
                localField: "_id",
                foreignField: "collection_id",
                as: "approvers_details"
            }
        },
        { $unwind: { path: "$approvers_details", preserveNullAndEmptyArrays: true } },
        {
            $match: approvalCondition
        },
        {
            "$lookup": {
                from: 'employees',
                localField: 'employee_id',
                foreignField: "_id",
                as: "employee_details"
            }
        },
        { $unwind: { path: "$employee_details", preserveNullAndEmptyArrays: true } },
        {
            $set: {
                emp_id: "$employee_details.emp_id",
                name: "$employee_details.name",
                employee_id: "$employee_details._id",
                approvers_status: "$approvers_details.action_type",
                approval_id: "$approvers_details._id"
            }
        },
        {
            $project: {
                employee_details: 0,
                approvers_details: 0
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

const getTravelApproval = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    filter = filter?.approver_id ? { ...filter, approver_id: { $in: [mongoose.Types.ObjectId(filter?.approver_id)] } } : filter;
    const totalRecords = await approverSchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await approverSchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup":
            {
                from: "travel_applications",
                localField: "collection_id",
                foreignField: "_id",
                as: "travel_details",
            },
        },
        { $unwind: { path: "$travel_details", preserveNullAndEmptyArrays: true } },
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
                localField: "travel_details.employee_id",
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
                trave_type: "$travel_details.travel_type",
                purpose_of_travel: "$travel_details.purpose_of_travel",
                employee_id: { "$arrayElemAt": ["$employee_details._id", 0] },
                travel_id: "$travel_details._id",
                designations_name: { "$arrayElemAt": ["$designations_details.name", 0] },
                approval_id: "$_id",
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

const getTravelProgress = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const records = await travelApplicationSchema(db).aggregate([
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

const createTravelAndClaimRule = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await travelAndClaimRuleSchema(db).create(data);
    if (record) {
        res.data = record
    } else {
        res.status = false
    }
    return res

}
const getTravelAndClaimRule = async (filter, options) => {
    const res = getServiceResFormat();
    const totalRecords = await travelAndClaimRuleSchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await travelAndClaimRuleSchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup": {
                from: "travel_types",
                localField: "travel_id",
                foreignField: "_id",
                as: "travel_and_claim_rules_details",
            }
        },
        { $unwind: { path: "$travel_and_claim_rules_details", preserveNullAndEmptyArrays: true } },
        {
            "$lookup": {
                from: "dropdown_masters",
                localField: "travel_class",
                foreignField: "_id",
                as: "dropdown_masters_details",
            }
        },
        { $unwind: { path: "$dropdown_masters_details", preserveNullAndEmptyArrays: true } },
        {
            $set: {
                travel_type_name: "$travel_and_claim_rules_details.name",
                travel_type_value: "$travel_and_claim_rules_details._id",
                travel_class_name: "$dropdown_masters_details.category_key",
                travel_class_value: "$dropdown_masters_details._id"
            }
        },
        {
            $project: {
                travel_and_claim_rules_details: 0,
                dropdown_masters_details: 0
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
const updateTravelAndClaimRule = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await travelAndClaimRuleSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true });
    if (record) {
        res.data = record
    } else {
        res.status = false;
    }
    return res;
}
const deleteTravelAndClaimRule = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await travelAndClaimRuleSchema(db).findByIdAndDelete(filter);
    if (record) {
        res.data = record;
    } else {
        res.status = false;
    }
    return res;
}

const getAllTravelAndClaimRule = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const records = await travelAndClaimRuleSchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup": {
                from: "travel_types",
                localField: "travel_id",
                foreignField: "_id",
                as: "travel_and_claim_rules_details",
            }
        },
        { $unwind: { path: "$travel_and_claim_rules_details", preserveNullAndEmptyArrays: true } },
        {
            "$lookup": {
                from: "dropdown_masters",
                localField: "travel_class",
                foreignField: "_id",
                as: "dropdown_masters_details",
            }
        },
        { $unwind: { path: "$dropdown_masters_details", preserveNullAndEmptyArrays: true } },
        {
            $set: {
                travel_type_name: "$travel_and_claim_rules_details.name",
                travel_type_value: "$travel_and_claim_rules_details._id",
                travel_class_name: "$dropdown_masters_details.category_key",
                travel_class_value: "$dropdown_masters_details._id",
                label: "$name",
                value: "$_id"
            }
        },
        {
            $project: {
                travel_and_claim_rules_details: 0,
                dropdown_masters_details: 0
            }
        },
    ]).allowDiskUse()
    if (records && records.length) {
        res.data = records
    } else {
        res.status = false;
    }
    return res;
}

const createClaimApplication = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const addData = await claimApplicationSchema(db).create(data);
    if (addData) {
        res.data = addData
    } else {
        res.status = false
    }
    return res
}

const updateClaimRequest = async (filter, update) => {
    const res = getServiceResFormat();
    const record = await claimApplicationSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true });
    if (record) {
        res.data = record
    } else {
        res.status = false;
    }
    return res;
}

const deleteClaimRequest = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await claimApplicationSchema(db).findByIdAndDelete(filter);
    if (record) {
        res.data = record;
    } else {
        res.status = false;
    }
    return res;
}

const getClaimRequest = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const { approver_id, type, action_type, user, is_draft } = filter
    const approvalCondition = { "approvers_details.type": type }
    const Condition = { employee_id: mongoose.Types.ObjectId(approver_id), is_draft: is_draft }
    const totalRecords = await claimApplicationSchema(db).find(Condition).count();
    options = getAggregatePagination(options, totalRecords);
    // const records = await claimApplicationSchema(db).aggregate([
    //     { "$match": Condition },
    //     {
    //         "$lookup": {
    //             from: 'approvers',
    //             localField: "_id",
    //             foreignField: "collection_id",
    //             as: "approvers_details"
    //         }
    //     },
    //     { $unwind: { path: "$approvers_details", preserveNullAndEmptyArrays: true } },
    //     { 
    //         $match: approvalCondition
    //     },
    //     {
    //         "$lookup": {
    //             from: 'travel_applications',
    //             localField: "travel_id",
    //             foreignField: "_id",
    //             as: "travel_details_data"
    //         }
    //     },
    //     {
    //         "$lookup": {
    //             from: 'travel_types',
    //             localField: "travel_type_id",
    //             foreignField: "_id",
    //             as: "travel_type_details"
    //         }
    //     },
    //     {
    //         "$lookup": {
    //             from: 'employees',
    //             localField: 'employee_id',
    //             foreignField: "_id",
    //             as: "employee_details"
    //         }
    //     },
    //     { $unwind: { path: "$employee_details", preserveNullAndEmptyArrays: true } },
    //     {
    //         "$lookup": {
    //             from: 'travel_types',
    //             localField: "travel_details.travel_type_value", // Use actual travel_details field
    //             foreignField: "_id",
    //             as: "travel_type_mapped"
    //         }
    //     },
    //     {
    //         "$addFields": {
    //             "travel_details": {
    //                 "$map": {
    //                     "input": "$travel_details",
    //                     "as": "td",
    //                     "in": {
    //                         "travel_type": {
    //                             "$let": {
    //                                 "vars": {
    //                                     "matched": {
    //                                         "$arrayElemAt": [
    //                                             {
    //                                                 "$filter": {
    //                                                     "input": "$travel_type_mapped",
    //                                                     "as": "tt",
    //                                                     "cond": { "$eq": ["$$tt._id", "$$td.travel_type"] }
    //                                                 }
    //                                             },
    //                                             0
    //                                         ]
    //                                     }
    //                                 },
    //                                 "in": "$$matched.name"
    //                             }
    //                         },
    //                         "travel_type_value":"$$td.travel_type",
    //                         "amount": "$$td.amount",
    //                         "date": "$$td.date",
    //                         "bill_no": "$$td.bill_no",
    //                         "bill_image": "$$td.bill_image"
    //                     }
    //                 }
    //             }
    //         }
    //     },
    //     {
    //         $set: {
    //             emp_id: "$employee_details.emp_id",
    //             name: "$employee_details.name",
    //             travel_details:"$travel_details",
    //             travel: { "$arrayElemAt": ["$travel_details_data.travel_name", 0] },
    //             // type: { "$arrayElemAt": ["$travel_detailss.name", 0] },
    //             employee_id: "$employee_details._id",
    //             approvers_status: "$approvers_details.action_type",
    //             approval_id: "$approvers_details._id"
    //         }
    //     },
    //     {
    //         $project: {
    //             employee_details: 0,
    //             approvers_details: 0,
    //             travel_details_data:0,
    //             travel_type_details:0
    //         }
    //     },
    //     options?.skips,
    //     options?.limits
    // ]).allowDiskUse()
    const records = await claimApplicationSchema(db).aggregate([
        { "$match": Condition },
        {
            "$lookup": {
                from: 'approvers',
                localField: "_id",
                foreignField: "collection_id",
                as: "approvers_details"
            }
        },
        { $unwind: { path: "$approvers_details", preserveNullAndEmptyArrays: true } },
        { $match: approvalCondition },

        {
            "$lookup": {
                from: 'travel_applications',
                localField: "travel_id",
                foreignField: "_id",
                as: "travel_details_data"
            }
        },

        {
            "$lookup": {
                from: 'employees',
                localField: 'employee_id',
                foreignField: "_id",
                as: "employee_details"
            }
        },
        { $unwind: { path: "$employee_details", preserveNullAndEmptyArrays: true } },
        { "$unwind": { path: "$travel_details", preserveNullAndEmptyArrays: true } },

        {
            "$lookup": {
                "from": "travel_types",
                "let": { "travelTypeId": { "$toObjectId": "$travel_details.travel_type" } },
                "pipeline": [
                    { "$match": { "$expr": { "$eq": ["$_id", "$$travelTypeId"] } } }
                ],
                "as": "travel_type_mapped"
            }
        },

        {
            "$addFields": {
                "travel_details.travel_type_name": {
                    "$arrayElemAt": ["$travel_type_mapped.name", 0]
                }
            }
        },

        {
            "$group": {
                "_id": "$_id",
                "is_draft": { "$first": "$is_draft" },
                "emp_id": { "$first": "$employee_details.emp_id" },
                "name": { "$first": "$employee_details.name" },
                "employee_id": { "$first": "$employee_details._id" },
                "travel_details": { "$push": "$travel_details" },
                "travel": { "$first": { "$arrayElemAt": ["$travel_details_data.travel_name", 0] } },
                "approvers_status": { "$first": "$approvers_details.action_type" },
                "approval_id": { "$first": "$approvers_details._id" }
            }
        },

        // Remove unwanted fields
        {
            $project: {
                employee_details: 0,
                approvers_details: 0,
                travel_details_data: 0,
                travel_type_mapped: 0
            }
        },

        // Apply pagination (if needed)
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

}

const getClaimApproval = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    filter = filter?.approver_id ? { ...filter, approver_id: { $in: [mongoose.Types.ObjectId(filter?.approver_id)] } } : filter;
    const totalRecords = await approverSchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await approverSchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup":
            {
                from: "claim_applications",
                localField: "collection_id",
                foreignField: "_id",
                as: "claim_details",
            },
        },
        { $unwind: { path: "$claim_details", preserveNullAndEmptyArrays: true } },
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
                localField: "claim_details.employee_id",
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
            "$lookup": {
                from: 'travel_applications',
                localField: "claim_details.travel_id",
                foreignField: "_id",
                as: "travel_details"
            }
        },
        {
            "$lookup": {
                from: 'travel_types',
                localField: "claim_details.travel_type_id",
                foreignField: "_id",
                as: "travel_type_details"
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
                emp_id: { "$arrayElemAt": ["$employee_details.emp_id", 0] },
                name: { "$arrayElemAt": ["$employee_details.name", 0] },
                email: { "$arrayElemAt": ["$employee_details.email", 0] },
                employee_id: { "$arrayElemAt": ["$employee_details._id", 0] },
                travel: { "$arrayElemAt": ["$travel_details.travel_name", 0] },
                type: { "$arrayElemAt": ["$travel_type_details.name", 0] },
                is_draft: { "$arrayElemAt": ["$travel_type_details.is_draft", 0] },
                designations_name: { "$arrayElemAt": ["$designations_details.name", 0] },
                amount: "$claim_details.amount",
                date: "$claim_details.date",
                bill_no: "$claim_details.bill_no",
                approval_id: "$_id",
                claim_id: "$claim_details._id",
                bill_no: "$claim_details.bill_no",
                date: "$claim_details.date",
                amount: "$claim_details.amount",
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
        {
            $project: {
                travel_details: 0,
                travel_type_details: 0
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

const getAllTravelApprovalData = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const records = await travelApplicationSchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup": {
                from: 'approvers',
                localField: "_id",
                foreignField: "collection_id",
                as: "approvers_details"
            }
        },
        { $unwind: { path: "$approvers_details", preserveNullAndEmptyArrays: true } },
        {
            $match: { "approvers_details.action_type": "approve" }
        },
        {
            "$lookup": {
                from: 'employees',
                localField: 'employee_id',
                foreignField: "_id",
                as: "employee_details"
            }
        },
        { $unwind: { path: "$employee_details", preserveNullAndEmptyArrays: true } },
        {
            $set: {
                emp_id: "$employee_details.emp_id",
                name: "$employee_details.name",
                employee_id: "$employee_details._id",
                approvers_status: "$approvers_details.action_type",
                approval_id: "$approvers_details._id",
                label: "$travel_name",
                value: "$_id"
            }
        },
        {
            $project: {
                employee_details: 0,
                approvers_details: 0
            }
        },
    ])
    if (records && records.length) {
        res.data = records
    } else {
        res.status = false;
    }
    return res
}
const getClaimProgress = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const records = await claimApplicationSchema(db).aggregate([
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

const travelAndClaimAssignRule = async (rule_details) => {
    const res = getServiceResFormat();
    let db = getDb()
    let bulk = travelAndClaimAssignRuleSchema(db).collection.initializeUnorderedBulkOp();
    for (let i = 0; i < rule_details?.length; i++) {
        const item = rule_details[i];
        bulk.find({ department_id: item.department_id, designation_id: item.designation_id }).upsert().updateOne({ $set: { travel_rule_ids: (item?.details).map(item => mongoose.Types.ObjectId(item)) } });
    }
    bulk.execute(async (err, result) => {
        if (result) {
            res.data = result;
        } else {
            res.status = false;
        }
    });
    return res;
}

const getAssignRule = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await travelAndClaimAssignRuleSchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup": {
                from: "departments",
                localField: "department_id",
                foreignField: "_id",
                as: "department_details"
            },
        },
        { $unwind: { path: "$department_details", preserveNullAndEmptyArrays: true } },
        {
            "$lookup": {
                from: "designations",
                localField: "designation_id",
                foreignField: "_id",
                as: "designations_details"
            },
        },
        { $unwind: { path: "$designations_details", preserveNullAndEmptyArrays: true } },
        {
            "$set": {
                department_name: "$department_details.name",
                designations_name: "$designations_details.name",
            }
        },
        {
            "$project": {
                designations_details: 0,
                department_details: 0
            }
        }
    ])
    if (record && record.length) {
        res.data = record;
    } else {
        res.status = false;
    }
    return res;
}



module.exports = {
    addTravelType,
    getTraveType,
    getAllTravelType,
    updateTravelType,
    deleteTravelType,
    addTravel,
    getTravel,
    updateTravel,
    deleteTravel,
    getTravelRequest,
    getTravelApproval,
    getTravelProgress,
    createTravelAndClaimRule,
    getTravelAndClaimRule,
    updateTravelAndClaimRule,
    deleteTravelAndClaimRule,
    getAllTravelAndClaimRule,
    createClaimApplication,
    updateClaimRequest,
    deleteClaimRequest,
    getClaimRequest,
    getClaimApproval,
    getAllTravelApprovalData,
    getClaimProgress,
    travelAndClaimAssignRule,
    getAssignRule,
}