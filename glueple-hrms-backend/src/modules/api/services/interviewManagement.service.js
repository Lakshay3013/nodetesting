const interviewDetailsSchema = require('../../../models/interviewDetails.model');
const interviewFormSchema = require('../../../models/interviewForm.model');
const { getServiceResFormat, getFindPagination, getAggregatePagination, getDb } = require('../utils/appHelper');
const mongoose = require('mongoose');

const addUpdateInterviewer = async (data, id) => {
    const res = getServiceResFormat();
    let db = getDb()
    const _id = id ? id : '';
    let queryRes = ``;
    if (_id == '') {
        queryRes = await interviewDetailsSchema(db).create(data);
    } else {
        queryRes = await interviewDetailsSchema(db).findOneAndUpdate({ _id: _id }, { $set: data }, { new: true });
    }
    if (queryRes) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const addUpdateInterviewQuestions = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const _id = data?._id ? data?._id : '';
    let queryRes = ``;
    if (_id == '') {
        queryRes = await interviewFormSchema(db).create(data);
    } else {
        queryRes = await interviewFormSchema(db).findOneAndUpdate({ _id: _id }, { $set: data }, { new: true });
    }
    if (queryRes) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const queryInterviewQuestions = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const totalRecords = await interviewFormSchema(db).find(filter).count();
    const limits = getFindPagination(options, totalRecords);
    const records = await interviewFormSchema(db).find(filter, {}, limits?.limits).allowDiskUse();
    const queryRes = {
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        totalPages: limits?.totalPages,
        data: records
    }
    if (queryRes && queryRes?.data?.length) {
        // res.data = queryRes;
        res.data = records;
    } else {
        res.status = false;
    }
    return res;
};

const queryInterviewer = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    data = data?.mrf_id ? {...data, mrf_id: mongoose.Types.ObjectId(data?.mrf_id)} : data;
    data = data?.candidate_id ? {...data, candidate_id: mongoose.Types.ObjectId(data?.candidate_id)} : data;
    let queryRes = await interviewDetailsSchema(db).aggregate([
        { "$match": data },
        {
            "$lookup":
            {
                from: "dropdown_masters",
                localField: "interview_stage",
                foreignField: "_id",
                as: "interview_stage_name",
            },
        },
        {
            "$lookup":
            {
                from: "dropdown_masters",
                localField: "interview_type",
                foreignField: "_id",
                as: "interview_type_name",
            },
        },
        {
            "$lookup":
            {
                from: "departments",
                localField: "department",
                foreignField: "_id",
                as: "department_name"
            }
        },
        {
            "$lookup":
            {
                from: "designations",
                localField: "designation",
                foreignField: "_id",
                as: "designation_name"
            }
        },
        {
            "$lookup":
            {
                from: "employees",
                localField: "interviewer",
                foreignField: "_id",
                as: "interviewer_name"
            }
        },
        {
            "$set":
            {
                interview_type_name: { "$arrayElemAt": ["$interview_type_name.category_key", 0] },
                interview_stage_name: { "$arrayElemAt": ["$interview_stage_name.category_key", 0] },
                department_name: { "$arrayElemAt": ["$department_name.name", 0] },
                designation_name: { "$arrayElemAt": ["$designation_name.name", 0] },
                interviewer_name: { $concat: [{ "$arrayElemAt": ["$interviewer_name.name", 0] }, " ( ", { "$arrayElemAt": ["$interviewer_name.emp_id", 0] }, " ) "] },
            }
        }
    ]).allowDiskUse();
    if (queryRes && queryRes?.length) {
        res.data = queryRes;
    } else {
        data = data?.candidate_id ? {...data, candidate_id: null} : data;
        queryRes = await interviewDetailsSchema(db).aggregate([
            { "$match": data },
            {
                "$lookup":
                {
                    from: "dropdown_masters",
                    localField: "interview_stage",
                    foreignField: "_id",
                    as: "interview_stage_name",
                },
            },
            {
                "$lookup":
                {
                    from: "dropdown_masters",
                    localField: "interview_type",
                    foreignField: "_id",
                    as: "interview_type_name",
                },
            },
            {
                "$lookup":
                {
                    from: "departments",
                    localField: "department",
                    foreignField: "_id",
                    as: "department_name"
                }
            },
            {
                "$lookup":
                {
                    from: "designations",
                    localField: "designation",
                    foreignField: "_id",
                    as: "designation_name"
                }
            },
            {
                "$lookup":
                {
                    from: "employees",
                    localField: "interviewer",
                    foreignField: "_id",
                    as: "interviewer_name"
                }
            },
            {
                "$set":
                {
                    interview_type_name: { "$arrayElemAt": ["$interview_type_name.category_key", 0] },
                    interview_stage_name: { "$arrayElemAt": ["$interview_stage_name.category_key", 0] },
                    department_name: { "$arrayElemAt": ["$department_name.name", 0] },
                    designation_name: { "$arrayElemAt": ["$designation_name.name", 0] },
                    interviewer_name: { $concat: [{ "$arrayElemAt": ["$interviewer_name.name", 0] }, " ( ", { "$arrayElemAt": ["$interviewer_name.emp_id", 0] }, " ) "] },
                }
            },
            {$project: {
                _id: 0,
            }}
        ]).allowDiskUse();
        if (queryRes && queryRes?.length) {
            res.data = queryRes;
        } else {
            res.status = false;
        }
    }
    return res;
}

const updateInterviewerData = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await interviewDetailsSchema(db).findOneAndUpdate(filter, update, { new: true });
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const queryInterviewerData = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await interviewDetailsSchema(db).find(filter);
    if (queryRes && queryRes?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const queryInterviewerDataWithPagination = async (filter, options, candidatePipeline = []) => {
    const res = getServiceResFormat();
    let db = getDb()
    filter = filter && filter?.interviewer ? { ...filter, interviewer: mongoose.Types.ObjectId(filter?.interviewer) } : filter
    const totalRecords = await interviewDetailsSchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await interviewDetailsSchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup":
            {
                from: "dropdown_masters",
                localField: "interview_stage",
                foreignField: "_id",
                as: "interview_stage_name",
            },
        },
        {
            "$lookup":
            {
                from: "dropdown_masters",
                localField: "interview_type",
                foreignField: "_id",
                as: "interview_type_name",
            },
        },
        {
            "$lookup":
            {
                from: "mrfs",
                localField: "mrf_id",
                foreignField: "_id",
                as: "mrf_data",
            },
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
                from: "employees",
                localField: "mrf_data.created_by",
                foreignField: "_id",
                as: "created_by_name"
            }
        },
        {
            "$lookup":
            {
                from: "candidates",
                localField: "candidate_id",
                foreignField: "_id",
                as: "candidate_data",
                pipeline: candidatePipeline,
            }
        },
        { $match: { candidate_data: { $ne: [] } } },
        {
            "$set":
            {
                // mrf_id_value: {
                //     $substr: [
                //     { $toString: "$mrf_id" }, 
                //     { $subtract: [{ $strLenCP: { $toString: "$mrf_id" } }, 5] }, 
                //     5
                //     ]
                // },
                // candidate_id_value: {
                //     $substr: [
                //     { $toString: "$candidate_id" }, 
                //     { $subtract: [{ $strLenCP: { $toString: "$candidate_id" } }, 5] }, 
                //     5
                //     ]
                // },
                department_name: { "$arrayElemAt": ["$department_name.name", 0] },
                designation_name: { "$arrayElemAt": ["$designation_name.name", 0] },
                position_name: { "$arrayElemAt": ["$position_name.name", 0] },
                created_by_name: { "$arrayElemAt": ["$created_by_name.name", 0] },
                candidate_data: { "$arrayElemAt": ["$candidate_data", 0] },
                interview_type_name: { "$arrayElemAt": ["$interview_type_name.category_key", 0] },
                interview_stage_name: { "$arrayElemAt": ["$interview_stage_name.category_key", 0] },
                candidate_name: { "$arrayElemAt": ["$candidate_data.name", 0] },
                candidate_email: { "$arrayElemAt": ["$candidate_data.email", 0] },
            }
        },
        {
            "$project":
            {
                _id: 1,
                mrf_id_value: 1,
                candidate_id_value: 1,
                department_name: 1,
                designation_name: 1,
                position_name: 1,
                created_by_name: 1,
                candidate_data: 1,
                interview_type: 1,
                interview_type_value: 1,
                interview_type_name: 1,
                interview_status: 1,
                interview_stage: 1,
                interview_stage_name: 1,
                interview_assigned_at: 1,
                candidate_name: 1,
                candidate_email: 1,
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

const getFullInterviewDetails = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    filter = filter && filter?._id ? { ...filter, _id: mongoose.Types.ObjectId(filter?._id) } : filter;
    const queryRes = await interviewDetailsSchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup":
            {
                from: "dropdown_masters",
                localField: "interview_stage",
                foreignField: "_id",
                as: "interview_stage_name",
            },
        },
        {
            "$lookup":
            {
                from: "dropdown_masters",
                localField: "interview_type",
                foreignField: "_id",
                as: "interview_type_name",
            },
        },
        {
            "$lookup":
            {
                from: "mrfs",
                localField: "mrf_id",
                foreignField: "_id",
                as: "mrf_data",
            },
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
                localField: "mrf_data.priority",
                foreignField: "_id",
                as: "priority_name"
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
                from: "employees",
                localField: "mrf_data.created_by",
                foreignField: "_id",
                as: "created_by_name"
            }
        },
        {
            "$lookup":
            {
                from: "candidates",
                localField: "candidate_id",
                foreignField: "_id",
                as: "candidate_data",
            }
        },
        { $match: { candidate_data: { $ne: [] } } },
        {
            "$lookup":
            {
                from: "dropdown_masters",
                localField: "candidate_data.year_of_experience",
                foreignField: "_id",
                as: "candidate_year_of_experience_name"
            }
        },
        {
            "$lookup":
            {
                from: "dropdown_masters",
                localField: "candidate_data.source",
                foreignField: "_id",
                as: "candidate_source_name"
            }
        },
        {
            "$set":
            {
                interview_type_name: { "$arrayElemAt": ["$interview_type_name.category_key", 0] },
                interview_stage_name: { "$arrayElemAt": ["$interview_stage_name.category_key", 0] },
                candidate_data: { "$arrayElemAt": ["$candidate_data", 0] },
                mrf_data_value: {
                    _id: { "$arrayElemAt": ["$mrf_data._id", 0] },
                    mrf_status: { "$arrayElemAt": ["$mrf_data.mrf_status", 0] },
                    created_at: { "$arrayElemAt": ["$mrf_data.mrf_status", 0] },
                    type: { "$arrayElemAt": ["$mrf_data.type", 0] },
                    department_name: { "$arrayElemAt": ["$department_name.name", 0] },
                    designation_name: { "$arrayElemAt": ["$designation_name.name", 0] },
                    position_name: { "$arrayElemAt": ["$position_name.name", 0] },
                    priority_name: { "$arrayElemAt": ["$priority_name.category_key", 0] },
                    min_qualififcation_name: { "$arrayElemAt": ["$min_qualififcation_name.name", 0] },
                    business_impact_name: { "$arrayElemAt": ["$business_impact_name.category_key", 0] },
                    year_of_experience_name: { "$arrayElemAt": ["$year_of_experience_name.category_key", 0] },
                    learning_development_cost: { "$arrayElemAt": ["$mrf_data.learning_development_cost", 0] },
                    type_of_appointment: { "$arrayElemAt": ["$mrf_data.type_of_appointment", 0] },
                    hiring_for_name: { "$arrayElemAt": ["$hiring_for_name.name", 0] },
                    preferred_qualification_name: { "$arrayElemAt": ["$preferred_qualification_name.name", 0] },
                    mrf_justification: { "$arrayElemAt": ["$mrf_data.mrf_justification", 0] },
                    created_by_name: { "$arrayElemAt": ["$created_by_name.name", 0] },
                },
                job_description_value: {
                    responsiblities: { "$arrayElemAt": ["$mrf_data.responsiblities", 0] },
                    domain_knowledge: { "$arrayElemAt": ["$mrf_data.domain_knowledge", 0] },
                    training_certificates_name: { "$arrayElemAt": ["$training_certificates_name.name", 0] },
                    other_skills: { "$arrayElemAt": ["$mrf_data.other_skills", 0] },
                    role_summary: { "$arrayElemAt": ["$mrf_data.role_summary", 0] },
                },
                candidate_data_value: {
                    "$mergeObjects": [{ "$arrayElemAt": ["$candidate_data", 0] },
                    { year_of_experience_name: { "$arrayElemAt": ["$candidate_year_of_experience_name.category_key", 0] } },
                    { candidate_source_name: { "$arrayElemAt": ["$candidate_source_name.category_key", 0] } },
                    ]
                },
            }
        },
        {
            "$project": {
                mrf_data_value: 1,
                job_description_value: 1,
                candidate_data_value: 1
            }
        }
    ]).allowDiskUse();
    if (queryRes && queryRes?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}


module.exports = {
    addUpdateInterviewer,
    addUpdateInterviewQuestions,
    queryInterviewQuestions,
    queryInterviewer,
    updateInterviewerData,
    queryInterviewerData,
    queryInterviewerDataWithPagination,
    getFullInterviewDetails,
};