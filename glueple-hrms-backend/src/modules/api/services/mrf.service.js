const mrfSchema = require('../../../models/mrf.model');
const { getServiceResFormat, getAggregatePagination, getDb } = require('../utils/appHelper');
const mongoose = require('mongoose');

const createMRF = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    data['created_by'] = mongoose.Types.ObjectId(data?.created_by) || '';
    const queryRes = await mrfSchema(db).create(data);
    if (queryRes) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const updateMRF = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await mrfSchema(db).findOneAndUpdate(filter, update, { new: true });
    if (queryRes && queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const queryMRF = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await mrfSchema(db).find(filter);
    if (queryRes?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const mrfForm = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const id = data?._id ? data?._id : '';
    let queryRes = ``;
    if (id == '' && data.query_type == 'mrf_form') {
        queryRes = await mrfSchema(db).create(data);
    } else {
        const mrfData = await queryMRF({ _id: id });
        if (mrfData?.status) {
            if (mrfData?.data[0]?.['step'] > data['step']) {
                delete data['step'];
            }
            delete data['auto_id'];
        }
        queryRes = await mrfSchema(db).findOneAndUpdate({ _id: id }, { $set: data }, { new: true });
    }
    if (queryRes) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}


const queryMRFData = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    let approvalStatusCondn = {};
    if (filter?.approval_status) {
        approvalStatusCondn = { approval_status_name: filter?.approval_status };
        delete filter['approval_status'];
    }
    filter = filter && filter?._id ? { ...filter, _id: mongoose.Types.ObjectId(filter?._id) } : filter;
    filter = filter && filter?.created_by ? { ...filter, created_by: mongoose.Types.ObjectId(filter?.created_by) } : filter;
    const totalRecords = await mrfSchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await mrfSchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup": {
                from: "interview_details",
                localField: "_id",
                foreignField: "mrf_id",
                as: "interview_data"
            }
        },
        {
            "$lookup": {
                from: "employees",
                localField: "interview_data.interviewer",
                foreignField: "_id",
                as: "interviewer_data"
            }
        },
        {
            "$lookup": {
                from: "departments",
                localField: "interview_data.department",
                foreignField: "_id",
                as: "department_data"
            }
        },
        {
            "$lookup": {
                from: "designations",
                localField: "interview_data.designation",
                foreignField: "_id",
                as: "designation_data"
            }
        },
        {
            "$lookup": {
                from: "dropdown_masters",
                localField: "interview_data.interview_stage",
                foreignField: "_id",
                as: "interview_stage_data"
            }
        },
        {
            "$lookup": {
                from: "dropdown_masters",
                localField: "interview_data.interview_type",
                foreignField: "_id",
                as: "interview_type_data"
            }
        },
        {
            "$set": {
                interview_data: {
                    "$map": {
                        input: "$interview_data",
                        as: "interview",
                        in: {
                            "$mergeObjects": [
                                "$$interview",
                                {
                                    interviewer_name: {
                                        "$let": {
                                            vars: {
                                                matchedEmployee: {
                                                    "$arrayElemAt": [
                                                        {
                                                            "$filter": {
                                                                input: "$interviewer_data",
                                                                as: "employee",
                                                                cond: { "$eq": ["$$employee._id", "$$interview.interviewer"] }
                                                            }
                                                        },
                                                        0
                                                    ]
                                                }
                                            },
                                            in: { "$ifNull": ["$$matchedEmployee.name", ""] }
                                        }
                                    },
                                    department_name: {
                                        "$let": {
                                            vars: {
                                                matchedDepartment: {
                                                    "$arrayElemAt": [
                                                        {
                                                            "$filter": {
                                                                input: "$department_data",
                                                                as: "department",
                                                                cond: { "$eq": ["$$department._id", "$$interview.department"] }
                                                            }
                                                        },
                                                        0
                                                    ]
                                                }
                                            },
                                            in: { "$ifNull": ["$$matchedDepartment.name", ""] }
                                        }
                                    },
                                    designation_name: {
                                        "$let": {
                                            vars: {
                                                matchedDesignation: {
                                                    "$arrayElemAt": [
                                                        {
                                                            "$filter": {
                                                                input: "$designation_data",
                                                                as: "designation",
                                                                cond: { "$eq": ["$$designation._id", "$$interview.designation"] }
                                                            }
                                                        },
                                                        0
                                                    ]
                                                }
                                            },
                                            in: { "$ifNull": ["$$matchedDesignation.name", ""] }
                                        }
                                    },
                                    interview_stage_name: {
                                        "$let": {
                                            vars: {
                                                matchedStage: {
                                                    "$arrayElemAt": [
                                                        {
                                                            "$filter": {
                                                                input: "$interview_stage_data",
                                                                as: "stage",
                                                                cond: { "$eq": ["$$stage._id", "$$interview.interview_stage"] }
                                                            }
                                                        },
                                                        0
                                                    ]
                                                }
                                            },
                                            in: { "$ifNull": ["$$matchedStage.category_key", ""] }
                                        }
                                    },
                                    interview_type_name: {
                                        "$let": {
                                            vars: {
                                                matchedType: {
                                                    "$arrayElemAt": [
                                                        {
                                                            "$filter": {
                                                                input: "$interview_type_data",
                                                                as: "type",
                                                                cond: { "$eq": ["$$type._id", "$$interview.interview_type"] }
                                                            }
                                                        },
                                                        0
                                                    ]
                                                }
                                            },
                                            in: { "$ifNull": ["$$matchedType.category_key", ""] }
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
            "$lookup":
            {
                from: "training_certificates",
                localField: "training_certificates",
                foreignField: "_id",
                as: "training_certificates_name"
            }
        },
        {
            "$lookup":
            {
                from: "departments",
                localField: "department_id",
                foreignField: "_id",
                as: "department_name"
            }
        },
        {
            "$lookup":
            {
                from: "designations",
                localField: "designation_id",
                foreignField: "_id",
                as: "designation_name"
            }
        },
        {
            "$lookup":
            {
                from: "positions",
                localField: "position_id",
                foreignField: "_id",
                as: "position_name"
            }
        },
        {
            "$lookup":
            {
                from: "dropdown_masters",
                localField: "priority",
                foreignField: "_id",
                as: "priority_name"
            }
        },
        {
            "$lookup":
            {
                from: "dropdown_masters",
                localField: "business_impact",
                foreignField: "_id",
                as: "business_impact_name"
            }
        },
        {
            "$lookup":
            {
                from: "dropdown_masters",
                localField: "year_of_experience",
                foreignField: "_id",
                as: "year_of_experience_name"
            }
        },
        {
            "$lookup":
            {
                from: "qualifications",
                localField: "min_qualififcation",
                foreignField: "_id",
                as: "min_qualififcation_name"
            }
        },
        {
            "$lookup":
            {
                from: "qualifications",
                localField: "preferred_qualification",
                foreignField: "_id",
                as: "preferred_qualification_name"
            }
        },
        {
            "$lookup":
            {
                from: "employees",
                localField: "created_by",
                foreignField: "_id",
                as: "created_by_name"
            }
        },
        {
            "$lookup":
            {
                from: "employees",
                localField: "emp_id",
                foreignField: "_id",
                as: "emp_id_name"
            }
        },
        {
            "$lookup":
            {
                from: "locations",
                localField: "hiring_for",
                foreignField: "_id",
                as: "hiring_for_name"
            }
        },
        {
            "$lookup":
            {
                from: "candidates",
                localField: "_id",
                foreignField: "mrf_id",
                as: "candidate_data",
                pipeline: [{
                    "$match":
                    {
                        final_selection: true,
                    }
                }]
            }
        },
        {
            "$lookup": {
                from: "interview_details",
                localField: "_id",
                foreignField: "mrf_id",
                as: "interview_status_data",
                pipeline: [{
                    "$match":
                    {
                        interview_assigned: true,
                        interview_status: "pending"
                    }
                }]
            }
        },
        {
            "$lookup":
            {
                from: "approvers",
                localField: "_id",
                foreignField: "collection_id",
                as: "approval_status"
            }
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
                from: "roles",
                localField: "approver_data.role_id",
                foreignField: "_id",
                as: "role_data"
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
                                                                in: { "$concat": ["$$user.name", " (", "$$user.emp_id", ")"] }
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
                                },

                                {
                                    concatenated_role: {
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
                                                                in: "$$user.role_name"
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
                                    },
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
                // id_value: {
                //     $substr: [
                //     { $toString: "$_id" }, 
                //     { $subtract: [{ $strLenCP: { $toString: "$_id" } }, 5] }, 
                //     5
                //     ]
                // },
                training_certificates_name: { "$arrayElemAt": ["$training_certificates_name.name", 0] },
                department_name: { "$arrayElemAt": ["$department_name.name", 0] },
                designation_name: { "$arrayElemAt": ["$designation_name.name", 0] },
                position_name: { "$arrayElemAt": ["$position_name.name", 0] },
                priority_name: { "$arrayElemAt": ["$priority_name.category_key", 0] },
                business_impact_name: { "$arrayElemAt": ["$business_impact_name.category_key", 0] },
                year_of_experience_name: { "$arrayElemAt": ["$year_of_experience_name.category_key", 0] },
                min_qualififcation_name: { "$arrayElemAt": ["$min_qualififcation_name.name", 0] },
                preferred_qualification_name: { "$arrayElemAt": ["$preferred_qualification_name.name", 0] },
                created_by_name: { "$arrayElemAt": ["$created_by_name.name", 0] },
                emp_id_name: { $concat: [{ "$arrayElemAt": ["$emp_id_name.name", 0] }, " ( ", { "$arrayElemAt": ["$emp_id_name.emp_id", 0] }, " ) "] },
                hiring_for_name: { "$arrayElemAt": ["$hiring_for_name.name", 0] },
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
                action_by: {
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
                mrf_statuses: {
                    $arrayToObject: [[
                        ["Assigned To Recruiter", "$assigned_to_recruiter"],
                        ["Interview Ongoing", {
                            "$cond": {
                                if: { "$gt": [{ "$size": "$interview_status_data" }, 0] },
                                then: true,
                                else: false
                            }
                        }],
                        ["Candidate Selected", {
                            "$cond": {
                                if: { "$gt": [{ "$size": "$candidate_data" }, 0] },
                                then: true,
                                else: false
                            }
                        }],
                        ["MRF Final", {
                            "$cond": {
                                if: { "$eq": ["$mrf_status", "close"] },
                                then: true,
                                else: false
                            }
                        }]
                    ]]
                }
            }
        },
        { $match: approvalStatusCondn },
        options?.skips,
        options?.limits,
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

const getMRFSubmitCloseCount = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    filter = filter && filter?.created_by ? { ...filter, created_by: mongoose.Types.ObjectId(filter?.created_by) } : filter;
    const queryRes = await mrfSchema(db).aggregate([
        { "$match": filter },
        {
            "$group": {
                _id: null,
                mrf_submitted: {
                    "$sum": {
                        "$cond": [{ "$eq": ["$is_submitted", true] }, 1, 0]
                    }
                },
                mrf_completed: {
                    "$sum": {
                        "$cond": [
                            { "$and": [{ "$eq": ["$is_submitted", true] }, { "$eq": ["$mrf_status", "close"] }] },
                            1,
                            0
                        ]
                    }
                }
            }
        },
        {
            "$project": {
                _id: 0,
                mrf_submitted: 1,
                mrf_completed: 1,
            }
        }
    ])
    if (queryRes) {
        res.data = queryRes[0];
    } else {
        res.status = false;
    }
    return res;
};

const getLastData = async (field) => {
    let db = getDb()
    const res = getServiceResFormat();
    const queryRes = await mrfSchema(db).find().sort({ [field]: -1 }).limit(1);
    if (queryRes && queryRes?.length && queryRes[0]?.auto_id) {
        res.data = queryRes[0];
    } else {
        res.status = false;
    }
    return res;
};

module.exports = {
    createMRF,
    updateMRF,
    queryMRF,
    mrfForm,
    queryMRFData,
    getMRFSubmitCloseCount,
    getLastData,
};