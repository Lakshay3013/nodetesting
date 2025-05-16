const mongoose = require('mongoose');
const employeeSchema = require('../../../models/employee.model');
// const getUserModel = require('../models/user.model');
const { getServiceResFormat, getFindPagination, getAggregatePagination,getDb } = require('../utils/appHelper');

const getSingleUser = async (filter, project) => {
    const res = getServiceResFormat();
    let db = getDb()
    const employeeModel = employeeSchema(db);
    const queryRes = await employeeModel.findOne(filter, project);
    if (queryRes) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const updateUserByFilter = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const employeeModel = employeeSchema(db);
    const queryRes = await employeeModel.findOneAndUpdate(filter, { $set: update },{ new: true });
    if (queryRes) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const getGraphData = async () => {
    const res = getServiceResFormat();
    let db = getDb()
    const employeeModel = employeeSchema(db);
    const queryRes = await employeeModel.aggregate([
        {
            $graphLookup: {
                from: "employees",
                startWith: "$reported_to",
                connectFromField: "reported_to",
                connectToField: "_id",
                as: "reportingHierarchy"
            }
        }
    ]);
    if (queryRes?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const queryUser = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const employeeModel = employeeSchema(db);
    const totalRecords = await employeeModel.find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await employeeModel.aggregate([
        {
          $match: filter
        },
        {
            "$lookup":
            {
                from: "departments",
                localField: "department_id",
                foreignField: "_id",
                as: "department_details",
            },
        },
        {
            "$lookup":
            {
                from: "designations",
                localField: "designation_id",
                foreignField: "_id",
                as: "designation_details",
            },
        },
        {
            "$lookup":
            {
                from: "sub_departments",
                localField: "sub_department_id",
                foreignField: "_id",
                as: "sub_department_details",
            },
        },
        {
            "$lookup":
            {
                from: "branches",
                localField: "branch_id",
                foreignField: "_id",
                as: "branch_details",
            },
        },
        {
            "$lookup":
            {
                from: "employees",
                localField: "reported_to",
                foreignField: "_id",
                as: "reported_details",
            },
        },
        {
            "$lookup":
            {
                from: "dropdown_masters",
                localField: "working_from",
                foreignField: "_id",
                as: "working_details",
            },
        },
        {
          $addFields: {
            project_obj_ids: {
              $cond: {
                if: { $isArray: "$project" },
                then: {
                  $map: {
                    input: "$project",
                    as: "projId",
                    in: { $toObjectId: "$$projId" }
                  }
                },
                else: []
              }
            },
            skill_obj_ids: {
              $cond: {
                if: { $isArray: "$skill" },
                then: {
                  $map: {
                    input: "$skill",
                    as: "skillId",
                    in: { $toObjectId: "$$skillId" }
                  }
                },
                else: []
              }
            }
          }
        },
        {
          $lookup: {
            from: "projects",
            let: { projectIds: "$project_obj_ids" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$_id", "$$projectIds"]
                  }
                }
              },
              {
                $project: {
                  value: "$_id",
                  label: "$name"
                }
              }
            ],
            as: "project"
          }
        },
        {
          $lookup: {
            from: "skills",
            let: { skillIds: "$skill_obj_ids" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$_id", "$$skillIds"]
                  }
                }
              },
              {
                $project: {
                  value: "$_id",
                  label: "$name"
                }
              }
            ],
            as: "skill"
          }
        },
        {
            "$set":{
                department_name: { $arrayElemAt: ["$department_details.name", 0] }, 
                designation_name: { $arrayElemAt: ["$designation_details.name", 0] },
                sub_department_name: { $arrayElemAt: ["$sub_department_details.name", 0] },
                branch_name: { $arrayElemAt: ["$branch_details.branch_name", 0] },
                reported_to_name: { $arrayElemAt: ["$reported_details.name", 0] },
                working_from_name: { $arrayElemAt: ["$working_details.category_key", 0] },



            }

        },
        {
          $project: {
            project_obj_ids: 0,
            skill_obj_ids: 0,
            department_details:0,
            designation_details:0,
            sub_department_details:0,
            branch_details:0,
            reported_details:0,
            working_details:0,
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

const queryUserByFilter = async (filter, project) => {
    let db = getDb()
    const employeeModel = employeeSchema(db);
    filter = filter && filter?.designation_id ? { ...filter, designation_id: mongoose.Types.ObjectId(filter?.designation_id) } : filter;
    filter = filter && filter?.reported_to ? { ...filter, reported_to: mongoose.Types.ObjectId(filter?.reported_to) } : filter;
    filter = filter && filter?.role_id ? { ...filter, role_id: mongoose.Types.ObjectId(filter?.role_id) } : filter;
    const res = getServiceResFormat();
    const queryRes = await employeeModel.aggregate([
        { "$match": filter },
        {
            "$lookup":
            {
                from: "departments",
                localField: "department_id",
                foreignField: "_id",
                as: "department_data",
            },
        },
        {
            "$lookup":
            {
                from: "designations",
                localField: "designation_id",
                foreignField: "_id",
                as: "designation_data",
            },
        },
        {
            "$project": {
                label: { $concat: ["$name", " ( ", "$emp_id", " ) "] },
                value: "$_id",
                department_name: { $arrayElemAt: ["$department_data.name", 0] }, 
                designation_name: { $arrayElemAt: ["$designation_data.name", 0] },
                reported_to: "$reported_to",
                name:"$name",
                emp_code:'$emp_id',
                ...project,
            }
        }
    ]);
    if (queryRes && queryRes?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const queryUserForAttendance = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const employeeModel = employeeSchema(db);
    filter = filter?._id ? { ...filter, _id: mongoose.Types.ObjectId(filter?._id) } : filter;
    const queryRes = await employeeModel.aggregate([
        { "$match": filter },
        {
            "$lookup":
            {
                from: "locations",
                localField: "location",
                foreignField: "_id",
                as: "location_data",
            },
        },
        {
            "$lookup":
            {
                from: "assign_week_offs",
                localField: "_id",
                foreignField: "employee_id",
                as: "week_off_data",
            },
        },
        {
            "$lookup":
            {
                from: "shift_assigns",
                localField: "_id",
                foreignField: "employee_id",
                as: "assigned_shift_data",
                pipeline: [{
                    "$match":
                    {
                        assignment_type: "default",
                    },
                }]
            },
        },
        {
            "$lookup":
            {
                from: "shift_details",
                localField: "assigned_shift_data.shift_id",
                foreignField: "_id",
                as: "shift_data",
            },
        },
        {
            "$lookup":
            {
                from: "shift_calendars",
                localField: "shift_data.calendar_id",
                foreignField: "_id",
                as: "shift_week_offs",
            },
        },
        {
            "$lookup":
            {
                from: "shift_assigns",
                localField: "_id",
                foreignField: "employee_id",
                as: "assigned_other_shift",
                pipeline: [{
                    "$match":
                    {
                        assignment_type: { $ne: "default" },
                    },
                }]
            },
        },
        {
            "$lookup":
            {
                from: "shift_details",
                localField: "assigned_other_shift.shift_id",
                foreignField: "_id",
                as: "other_shift_data",
            },
        },
        {
            "$lookup":
            {
                from: "shift_calendars",
                localField: "other_shift_data.calendar_id",
                foreignField: "_id",
                as: "other_shift_calendars",
            },
        },
        {
            "$set": {
                other_shift_data: {
                    "$map": {
                        input: "$other_shift_data",
                        as: "other_shift",
                        in: {
                            "$mergeObjects": [
                                "$$other_shift",
                                {
                                    other_shift_calendars: {
                                        "$let": {
                                            vars: {
                                                matchedShiftCalendars: {
                                                    "$arrayElemAt": [
                                                        {
                                                            "$filter": {
                                                                input: "$other_shift_calendars",
                                                                as: "shift_calendars",
                                                                cond: { "$eq": ["$$shift_calendars._id", "$$other_shift.calendar_id"] }
                                                            }
                                                        },
                                                        0
                                                    ]
                                                }
                                            },
                                            in: { "$ifNull": ["$$matchedShiftCalendars", {}] }
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
                assigned_other_shift: {
                    "$map": {
                        input: "$assigned_other_shift",
                        as: "other_shift",
                        in: {
                            "$mergeObjects": [
                                "$$other_shift",
                                {
                                    other_shift_data: {
                                        "$let": {
                                            vars: {
                                                matchedShift: {
                                                    "$arrayElemAt": [
                                                        {
                                                            "$filter": {
                                                                input: "$other_shift_data",
                                                                as: "shift_data",
                                                                cond: { "$eq": ["$$shift_data._id", "$$other_shift.shift_id"] }
                                                            }
                                                        },
                                                        0
                                                    ]
                                                }
                                            },
                                            in: { "$ifNull": ["$$matchedShift", {}] }
                                        }
                                    },
                                }
                            ]
                        }
                    }
                },
                location_data: { "$arrayElemAt": ["$location_data", 0] },
            }
        },
    ]);
    if (queryRes && queryRes?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const createEmployee = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const employeeModel = employeeSchema(db);
    const queryRes = await employeeModel.create(data);
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const getAllEmployee = async(filter)=>{
    const res = getServiceResFormat();
    let db = getDb()
    const employeeModel = employeeSchema(db);
    const queryRes = await employeeModel.find(filter);
    if (queryRes && queryRes.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const getEmployee = async(filter, options)=>{
    const res = getServiceResFormat();
    let db = getDb()
    const employeeModel = employeeSchema(db);
    const totalRecords = await employeeModel.find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await employeeModel.aggregate([
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

const getProfile = async(filter)=>{
    const res = getServiceResFormat();
    let db = getDb()
    const employeeModel = employeeSchema(db);
    const records = await employeeModel.aggregate([
        {
          $match: filter
        },
        {
            "$lookup":
            {
                from: "departments",
                localField: "department_id",
                foreignField: "_id",
                as: "department_details",
            },
        },
        {
            "$lookup":
            {
                from: "designations",
                localField: "designation_id",
                foreignField: "_id",
                as: "designation_details",
            },
        },
        {
            "$lookup":
            {
                from: "sub_departments",
                localField: "sub_department_id",
                foreignField: "_id",
                as: "sub_department_details",
            },
        },
        {
          "$lookup":
          {
              from: "locations",
              localField: "location",
              foreignField: "_id",
              as: "location_details"
          },
      },
        {
            "$lookup":
            {
                from: "branches",
                localField: "branch_id",
                foreignField: "_id",
                as: "branch_details",
            },
        },
        {
            "$lookup":
            {
                from: "employees",
                localField: "reported_to",
                foreignField: "_id",
                as: "reported_details",
            },
        },
        {
            "$lookup":
            {
                from: "dropdown_masters",
                localField: "working_from",
                foreignField: "_id",
                as: "working_details",
            },
        },
        {
          $addFields: {
            project_obj_ids: {
              $cond: {
                if: { $isArray: "$project" },
                then: {
                  $map: {
                    input: "$project",
                    as: "projId",
                    in: { $toObjectId: "$$projId" }
                  }
                },
                else: []
              }
            },
            skill_obj_ids: {
              $cond: {
                if: { $isArray: "$skill" },
                then: {
                  $map: {
                    input: "$skill",
                    as: "skillId",
                    in: { $toObjectId: "$$skillId" }
                  }
                },
                else: []
              }
            }
          }
        },
        {
          $lookup: {
            from: "projects",
            let: { projectIds: "$project_obj_ids" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$_id", "$$projectIds"]
                  }
                }
              },
              {
                $project: {
                  value: "$_id",
                  label: "$name"
                }
              }
            ],
            as: "project"
          }
        },
        {
          $lookup: {
            from: "skills",
            let: { skillIds: "$skill_obj_ids" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$_id", "$$skillIds"]
                  }
                }
              },
              {
                $project: {
                  value: "$_id",
                  label: "$name"
                }
              }
            ],
            as: "skill"
          }
        },
        {
            "$set":{
                department_name: { $arrayElemAt: ["$department_details.name", 0] }, 
                designation_name: { $arrayElemAt: ["$designation_details.name", 0] },
                sub_department_name: { $arrayElemAt: ["$sub_department_details.name", 0] },
                branch_office_name: { $arrayElemAt: ["$branch_details.branch_name", 0] },
                reported_to_name: { $arrayElemAt: ["$reported_details.name", 0] },
                working_from_name: { $arrayElemAt: ["$working_details.category_key", 0] },
                location_name: { $arrayElemAt: ["$location_details.name", 0] },
            }

        },
        {
          $project: {
            project_obj_ids: 0,
            skill_obj_ids: 0,
            department_details:0,
            designation_details:0,
            sub_department_details:0,
            branch_details:0,
            reported_details:0,
            working_details:0,
            location_details:0,
          }
        }
      ]).allowDiskUse();
      if(records && records.length){
        res.data = records
      }else{
        res.status = false;
      }
      return res;
}

const bulkUploadEmployee = async(data, role_id,encryptedPassword)=>{
   const res = getServiceResFormat();
   let db = getDb()
    const employeeModel = employeeSchema(db);
      let bulk = employeeModel.collection.initializeUnorderedBulkOp();
      for (let i = 0; i < data?.length; i++) {
          const item = data[i];
          item['role_id'] = role_id.data[0]._id 
          item['password'] = encryptedPassword;
          item['account_status'] = 'active';
          bulk.find({ emp_id: item.emp_id}).upsert().updateOne({ $set: item });
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

const getLastEmployee = async(filter)=>{
  const res = getServiceResFormat();
  let db = getDb()
  const employeeModel = employeeSchema(db);
  const records =await employeeModel.find(filter).sort({ _id: -1 }).limit(1);
  if(records){
    res.data = records;
  }else{
    res.status = false
  }
  return res
}


module.exports = {
    getSingleUser,
    updateUserByFilter,
    getGraphData,
    queryUser,
    queryUserByFilter,
    queryUserForAttendance,
    createEmployee,
    getAllEmployee,
    getEmployee,
    getProfile,
    bulkUploadEmployee,
    getLastEmployee
}