const addKudosCategorySchema = require('../../../models/addKudosCategory.modal');
const createKudosRequestSchema = require('../../../models/createKudosRequest.model')
const httpStatus = require('http-status');
const ApiError = require('../../../helpers/ApiError');
const { getServiceResFormat, getAggregatePagination, getDb } = require('../utils/appHelper');
const kudosPointHistorySchema = require('../../../models/kudosPointHistory.model');

const addKudosCategory = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const nameExist = await addKudosCategorySchema(db)?.find({ name: data?.name }, {});
    if (nameExist && nameExist?.length) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Category Name already exists.');
    }
    const addKudosCategory = await addKudosCategorySchema(db).create(data);
    if (addKudosCategory?.length) {
        res.data = addKudosCategory;
    } else {
        res.status = false;
    }
    return res;
};
const getKudosCategory = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const totalRecords = await addKudosCategorySchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await addKudosCategorySchema(db).aggregate([
        { "$match": filter },

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
const createKudosRequest = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const addKudosCategory = []
    for (let i = 0; i < data.users.length; i++) {
        data["employee_id"] = data.users[i]
        const query = await createKudosRequestSchema(db).create(data);
        addKudosCategory.push(query)
    }
    if (addKudosCategory && addKudosCategory?.length) {
        res.data = addKudosCategory;
    } else {
        res.status = false;
    }
    return res;
};
const updateKudosRequest = async (filter,options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const kudosData = await createKudosRequestSchema(db).findOneAndUpdate(
        filter,
        options,
        { new: true } 
    );
    if (kudosData) {
        res.data = kudosData;
    } else {
        res.status = false;
    }
    return res;
};
const getKudosRequest = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const totalRecords = await createKudosRequestSchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await createKudosRequestSchema(db).aggregate([
        { "$match": filter },
        {
            $lookup: {
                from: "employees",
                localField: "employee_id",
                foreignField: "_id",
                as: "emp_info"
            }
        },
        {
            $unwind: {
                path: "$emp_info",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "employees",
                localField: "created_by",
                foreignField: "_id",
                as: "create_emp_info"
            }
        },
        {
            $unwind: {
                path: "$create_emp_info",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $set: {
                given_to: { $ifNull: ["$emp_info.name", ""] }, // Default value if null
                generated_by: { $ifNull: ["$create_emp_info.name", ""] }
            }
        },
        {
            $project: {
                create_emp_info: 0,
                emp_info: 0,
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
};

const addKudosPointHistory = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const addKudosCategory = await kudosPointHistorySchema(db).create(data);
    if (addKudosCategory?.length) {
        res.data = addKudosCategory;
    } else {
        res.status = false;
    }
    return res;
};

const getPointStatement = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const records = await kudosPointHistorySchema(db).aggregate([
        { "$match": filter },
        {
            $group: {
                _id: {
                    time_period: { $dateToString: { format: "%Y-%m", date: "$created_at" } }
                },
                total_point_earned: {
                    $sum: {
                        $cond: [{ $eq: ["$type", "CR"] }, "$points", 0]
                    }
                },
                total_point_redeemed: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$type", "DR"] },
                                    { $eq: ["$action_type", "redeemed"] },
                                ]
                            },
                            "$points",
                            0
                        ]
                    }
                }
            }
        },
        {
            $project: {
                time_period: "$_id.time_period",
                total_point_earned: { $ifNull: ["$total_point_earned", 0] },
                total_point_redeemed: {
                    $ifNull: ["$total_point_redeemed", 0]
                },
                _id: 0
            }
        },
        {
            $sort: { time_period: -1 }
        },
    ]);
    if (records && records?.length) {
        res.data = records;
    } else {
        res.status = false;
    }
    return res;
};
const getUserKudosOnType = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await createKudosRequestSchema(db).aggregate([
        {
            $match: filter
        },
        {
            $lookup: {
                from: "employees",
                localField: "users",
                foreignField: "_id",
                as: "emp_info"
            }
        },
        {
            $unwind: {
                path: "$emp_info",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "departments",
                localField: "emp_info.department_id",
                foreignField: "_id",
                as: "department_data"
            }
        },
        {
            $lookup: {
                from: "designations",
                localField: "emp_info.designation_id",
                foreignField: "_id",
                as: "designation_data"
            }
        },
        {
            $set: {
                employee_name: "$emp_info.name",
                kudos_point: "$category_value",
                department_name: {
                    $arrayElemAt: ["$department_data.name", 0]
                },
                designation_name: {
                    $arrayElemAt: ["$designation_data.name", 0]
                }
            }
        },
        {
            $project: {
                kudos_point: 1,
                description: 1,
                employee_name: 1,
                created_at: 1,
                department_name: 1,
                designation_name: 1
            }
        }
    ])

    if (queryRes && queryRes?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

module.exports = {
    addKudosCategory,
    getKudosCategory,
    createKudosRequest,
    getKudosRequest,
    addKudosPointHistory,
    getPointStatement,
    getUserKudosOnType,
    updateKudosRequest
};