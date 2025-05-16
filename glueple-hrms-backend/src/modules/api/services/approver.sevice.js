const approverSchema = require('../../../models/approvers.model');
const { getServiceResFormat, getAggregatePagination,getDb } = require('../utils/appHelper');
const mongoose = require('mongoose');

const addApproverData = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const approverModel = approverSchema(db);
    data['collection_id'] = mongoose.Types.ObjectId(data['collection_id']);
    const queryRes = await approverModel.create(data);
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const updateApproverData = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const approverModel = approverSchema(db);
    const queryRes = await approverModel.findOneAndUpdate(filter, update, { new: true });
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const queryApproverData = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const approverModel = approverSchema(db);
    const queryRes = await approverModel.findOne(filter);
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const queryApproverDataByFilter = async (filter, options) => {
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
                from: "mrfs",
                localField: "collection_id",
                foreignField: "_id",
                as: "mrf_data",
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
            "$lookup":
            {
                from: "departments",
                localField: "mrf_data.department_id",
                foreignField: "_id",
                as: "department_name"
            }
        },
        {
            "$lookup":
            {
                from: "designations",
                localField: "mrf_data.designation_id",
                foreignField: "_id",
                as: "designation_name"
            }
        },
        {
            "$lookup":
            {
                from: "positions",
                localField: "mrf_data.position_id",
                foreignField: "_id",
                as: "position_name"
            }
        },
        {
            "$lookup":
            {
                from: "locations",
                localField: "mrf_data.hiring_for",
                foreignField: "_id",
                as: "hiring_for_name"
            }
        },
        {
            "$lookup":
            {
                from: "dropdown_masters",
                localField: "mrf_data.priority",
                foreignField: "_id",
                as: "priority_name"
            }
        },
        {
            "$lookup":
            {
                from: "employees",
                localField: "mrf_data.created_by",
                foreignField: "_id",
                as: "created_by_name"
            }
        },
        {
            "$lookup":
            {
                from: "training_certificates",
                localField: "mrf_data.training_certificates",
                foreignField: "_id",
                as: "training_certificates_name"
            }
        },
        {
            "$lookup":
            {
                from: "dropdown_masters",
                localField: "mrf_data.business_impact",
                foreignField: "_id",
                as: "business_impact_name"
            }
        },
        {
            "$lookup":
            {
                from: "dropdown_masters",
                localField: "mrf_data.year_of_experience",
                foreignField: "_id",
                as: "year_of_experience_name"
            }
        },
        {
            "$lookup":
            {
                from: "qualifications",
                localField: "mrf_data.min_qualififcation",
                foreignField: "_id",
                as: "min_qualififcation_name"
            }
        },
        {
            "$lookup":
            {
                from: "qualifications",
                localField: "mrf_data.preferred_qualification",
                foreignField: "_id",
                as: "preferred_qualification_name"
            }
        },
        {
            "$set":
            {
                // mrf_id_value: {
                //     $substr: [
                //     { $toString: {"$arrayElemAt": ["$mrf_data._id", 0]}, }, 
                //     { $subtract: [{ $strLenCP: { $toString: {"$arrayElemAt": ["$mrf_data._id", 0]} } }, 5] }, 
                //     5
                //     ]
                // },
                auto_id: { "$arrayElemAt": ["$mrf_data.auto_id", 0] },
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
                hiring_for_name: { "$arrayElemAt": ["$hiring_for_name.name", 0] },
                mrf_type: { "$arrayElemAt": ["$mrf_data.type", 0] },
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

const getApprovalPendingApprovedCount = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const approverModel = approverSchema(db);
    filter = filter && filter?.approver_id ? { ...filter, approver_id: { $in: [filter?.approver_id] } } : filter;
    const queryRes = await approverModel.aggregate([
        { "$match": filter },
        {
            "$group": {
                _id: null,
                approval_pending: {
                    "$sum": {
                        "$cond": [{ "$eq": ["$action_type", 'pending'] }, 1, 0]
                    }
                },
                mrf_actioned: {
                    "$sum": {
                        "$cond": [
                            { "$or": [{ "$eq": ["$action_type", 'approve'] }, { "$eq": ["$action_type", "reject"] }] },
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
                approval_pending: 1,
                mrf_actioned: 1,
            }
        }
    ])
    if (queryRes) {
        res.data = queryRes[0];
    } else {
        res.status = false;
    }
    return res;
}


const deleteApproverData = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const approverModel = approverSchema(db);
    const queryRes = await approverModel.findByIdAndDelete(filter);
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const deleteApproverDataByCollectionId = async(filter)=>{
    const res = getServiceResFormat();
    let db = getDb()
    const approverModel = approverSchema(db);
    const record = await approverModel.deleteMany(filter);
    if(record?._id){
        res.data = record
    }else{
        res.status = false;
    }
    return res;

}

module.exports = {
    addApproverData,
    updateApproverData,
    queryApproverData,
    queryApproverDataByFilter,
    getApprovalPendingApprovedCount,
    deleteApproverData,
    deleteApproverDataByCollectionId,
};