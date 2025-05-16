const pmsKraSubParameterDetailsSchema = require('../../../models/pmsKraSubParameter.model');
const kraDetailsSchema = require('../../../models/pmsKraDetails.model');
const kraDetailsParameterSchema = require('../../../models/pmsKraParameterDetails.model');
const { getServiceResFormat, getAggregatePagination, getDb } = require('../utils/appHelper');
const mongoose = require('mongoose');
const kraRatingTypeForDepartmentSchema = require('../../../models/pmsKraRatingTypeForDepartment.mode.');
const selfRatingPermissionSchema = require('../../../models/pmsSelfRatingPermission.mode');
const { messages } = require('../../../config/constants');
const ApiError = require('../../../helpers/ApiError');
const httpStatus = require('http-status');
const employeeModel = require('../../../models/employee.model');
const kraAssignDetailsByEmployeeSchema = require('../../../models/pmsKraAssignDetailsByEmployee.model');
const kraRatingSchema = require('../../../models/pmsKraRating.model');
const { currentDate } = require('../utils/dateTimeHelper');

const createKra = async (data) => {
  const res = getServiceResFormat();
  let db = getDb()
  const record = await kraDetailsSchema(db).create(data);
  if (record) {
    res.data = record;
  } else {
    res.status = false;
  }
  return res;
}

const getKraDetails = async (filter, options) => {
  const res = getServiceResFormat()
  let db = getDb()
  const totalRecords = await kraDetailsSchema(db).find(filter).count();
  options = getAggregatePagination(options, totalRecords);
  const records = await kraDetailsSchema(db).aggregate([
    { "$match": filter },
    {
      "$lookup":
      {
        from: "sub_departments",
        localField: "function_id",
        foreignField: "_id",
        as: "sub_departments_details",
      }
    },
    {
      "$lookup":
      {
        from: "departments",
        localField: "department_id",
        foreignField: "_id",
        as: "department_details",
      }
    },
    {
      "$lookup":
      {
        from: "financial_years",
        localField: "financial_id",
        foreignField: "_id",
        as: "financial_details",
      }
    },
    {
      "$set": {
        function_name: { "$arrayElemAt": ["$sub_departments_details.name", 0] },
        department_name: { "$arrayElemAt": ["$department_details.name", 0] },
        financial_name: {
          "$cond": {
            if: { "$gt": [{ "$size": "$financial_details" }, 0] },
            then: { "$concat": [{ "$arrayElemAt": ["$financial_details.from", 0] }, " - ", { "$arrayElemAt": ["$financial_details.to", 0] }] },
            else: ""
          }
        },
      }
    },
    {
      "$project": {
        sub_departments_details: 0,
        department_details: 0,
        financial_details: 0,
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
  if (queryRes && queryRes.data.length) {
    res.data = queryRes
  } else {
    res.status = false
  }
  return res
}

const updateKraDetails = async (filter, update) => {
  const res = getServiceResFormat();
  let db = getDb()
  const records = await kraDetailsSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true });
  if (records) {
    res.data = records
  } else {
    res.status = false;
  }
  return res;
}

const deleteKraDetails = async (filter) => {
  const res = getServiceResFormat();
  let db = getDb()
  const records = await kraDetailsSchema(db).findByIdAndDelete(filter);
  if (records) {
    res.data = records;
  } else {
    res.status = false
  }
  return res;
}

const createKraParameter = async (data) => {
  const res = getServiceResFormat();
  let db = getDb()
  const record = await kraDetailsParameterSchema(db).create(data);
  if (record) {
    res.data = record
  } else {
    res.status = false;
  }
  return res;
}

const getKraParameter = async (filter,) => {
  const res = getServiceResFormat()
  let db = getDb()
  const totalRecords = await kraDetailsParameterSchema(db).find(filter).count();
  options = getAggregatePagination(options, totalRecords);
  const records = await kraDetailsParameterSchema(db).aggregate([
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
  if (queryRes && queryRes.data.length) {
    res.data = queryRes
  } else {
    res.status = false
  }
  return res
}

const updateKraParameter = async (filter, update) => {
  const res = getServiceResFormat();
  let db = getDb()
  const records = await kraDetailsParameterSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true });
  if (records) {
    res.data = records
  } else {
    res.status = false;
  }
  return res;

}
const deleteKraParameter = async (filter) => {
  const res = getServiceResFormat();
  let db = getDb()
  const records = await kraDetailsParameterSchema(db).findByIdAndDelete(filter);
  if (records) {
    res.data = records;
  } else {
    res.status = false
  }
  return res;
}

const createKpiDetails = async (data) => {
  const res = getServiceResFormat();
  let db = getDb()
  const record = await pmsKraSubParameterDetailsSchema(db).create(data);
  if (record) {
    res.data = record;
  } else {
    res.status = false;
  }
  return res;
}

const getKpiDetails = async (filter, options) => {
  const res = getServiceResFormat()
  let db = getDb()
  const totalRecords = await pmsKraSubParameterDetailsSchema(db).find(filter).count();
  options = getAggregatePagination(options, totalRecords);
  const records = await pmsKraSubParameterDetailsSchema(db).aggregate([
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
  if (queryRes && queryRes.data.length) {
    res.data = queryRes
  } else {
    res.status = false
  }
  return res

}
const updateKpiDetail = async (filter, update) => {
  const res = getServiceResFormat();
  let db = getDb()
  const records = await pmsKraSubParameterDetailsSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true });
  if (records) {
    res.data = records
  } else {
    res.status = false;
  }
  return res;

}

const deleteKpiDetail = async (filter) => {
  const res = getServiceResFormat();
  let db = getDb()
  const records = await pmsKraSubParameterDetailsSchema(db).findByIdAndDelete(filter);
  if (records) {
    res.data = records;
  } else {
    res.status = false
  }
  return res;

}

const getAllKraDetails = async (filter) => {
  const res = getServiceResFormat();
  let db = getDb()
  const records = await kraDetailsSchema(db).aggregate([
    { "$match": filter },
    {
      "$lookup":
      {
        from: "sub_departments",
        localField: "function_id",
        foreignField: "_id",
        as: "sub_departments_details",
      }
    },
    {
      "$lookup":
      {
        from: "departments",
        localField: "department_id",
        foreignField: "_id",
        as: "department_details",
      }
    },
    {
      "$lookup":
      {
        from: "financial_years",
        localField: "financial_id",
        foreignField: "_id",
        as: "financial_details",
      }
    },
    {
      "$set": {
        label: "$kra_name",
        value: "$_id",
        function_name: { "$arrayElemAt": ["$sub_departments_details.name", 0] },
        department_name: { "$arrayElemAt": ["$department_details.name", 0] },
        financial_name: {
          "$cond": {
            if: { "$gt": [{ "$size": "$financial_details" }, 0] },
            then: { "$concat": [{ "$arrayElemAt": ["$financial_details.from", 0] }, " - ", { "$arrayElemAt": ["$financial_details.to", 0] }] },
            else: ""
          }
        },
      }
    },
    {
      "$project": {
        sub_departments_details: 0,
        department_details: 0,
        financial_details: 0,
      }
    },
  ]).allowDiskUse()
  if (records && records.length) {
    res.data = records;
  } else {
    res.status = false
  }
  return res;
}

const getAllKraParameterDetails = async (filter) => {
  const res = getServiceResFormat();
  let db = getDb()
  const records = await kraDetailsParameterSchema(db).aggregate([
    { "$match": filter },
    {
      "$lookup":
      {
        from: "pms_kra_details",
        localField: "kra_id",
        foreignField: "_id",
        as: "kra_details",
      }
    },
    {
      "$set": {
        kra_name: { "$arrayElemAt": ["$kra_details.kra_name", 0] },
      }
    },
    {
      "$project": {
        kra_details: 0
      }
    },
  ]).allowDiskUse()
  if (records && records.length) {
    res.data = records;
  } else {
    res.status = false
  }
  return res
}

const getAllKpiDetails = async (filter) => {
  const res = getServiceResFormat();
  let db = getDb()
  const records = await pmsKraSubParameterDetailsSchema(db).aggregate([
    { "$match": filter },
    {
      "$lookup":
      {
        from: "pms_kra_parameter_details",
        localField: "kra_id",
        foreignField: "_id",
        as: "kra_parameter_details",
      }
    },
    {
      "$set": {
        parameter_name: { "$arrayElemAt": ["$kra_parameter_details.parameter_name", 0] },
        parameter_weightage: { "$arrayElemAt": ["$kra_parameter_details.parameter_weightage", 0] },
      }
    },
    {
      "$project": {
        kra_parameter_details: 0
      }
    },
  ]).allowDiskUse();
  if (records && records.length) {
    res.data = records;
  } else {
    res.status = false
  }
  return res

}

const createKraRatingTypeForDepartment = async (data) => {
  const res = getServiceResFormat();
  let db = getDb()
  let check = await getAllKraRatingTypeForDepartment({ department_id: mongoose.Types.ObjectId(data.department_id), function_id: mongoose.Types.ObjectId(data.function_id) });
  if (check.status) {
    throw new ApiError(httpStatus.BAD_REQUEST, messages.alert.FUNCTION_ALREADY_ASSIGNED);
  }
  const record = await kraRatingTypeForDepartmentSchema(db).create(data);
  if (record) {
    res.data = record
  } else {
    res.status = false;
  }
  return res;
}

const getKraRatingTypeForDepartment = async (filter, options) => {
  const res = getServiceResFormat()
  let db = getDb()
  const totalRecords = await kraRatingTypeForDepartmentSchema(db).find(filter).count();
  options = getAggregatePagination(options, totalRecords);
  const records = await kraRatingTypeForDepartmentSchema(db).aggregate([
    { "$match": filter },
    {
      "$lookup":
      {
        from: "sub_departments",
        localField: "function_id",
        foreignField: "_id",
        as: "sub_departments_details",
      }
    },
    {
      "$lookup":
      {
        from: "departments",
        localField: "department_id",
        foreignField: "_id",
        as: "department_details",
      }
    },
    {
      "$set": {
        function_name: { "$arrayElemAt": ["$sub_departments_details.name", 0] },
        department_name: { "$arrayElemAt": ["$department_details.name", 0] },
      }
    },
    {
      "$project": {
        sub_departments_details: 0,
        department_details: 0,
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
  if (queryRes && queryRes.data.length) {
    res.data = queryRes
  } else {
    res.status = false
  }
  return res

}

const updateKraRatingTypeDepartment = async (filter, update) => {
  const res = getServiceResFormat();
  let db = getDb()
  const records = await kraRatingTypeForDepartmentSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true });
  if (records) {
    res.data = records
  } else {
    res.status = false;
  }
  return res;

}
const deleteKraRatingTypeForDepartment = async (filter) => {
  const res = getServiceResFormat();
  let db = getDb()
  const records = await kraRatingTypeForDepartmentSchema(db).findByIdAndDelete(filter);
  if (records) {
    res.data = records;
  } else {
    res.status = false
  }
  return res;

}

const getAllKraRatingTypeForDepartment = async (filter) => {
  const res = getServiceResFormat();
  let db = getDb()
  const records = await kraRatingTypeForDepartmentSchema(db).aggregate([
    { "$match": filter },
    {
      "$lookup":
      {
        from: "sub_departments",
        localField: "function_id",
        foreignField: "_id",
        as: "sub_departments_details",
      }
    },
    {
      "$lookup":
      {
        from: "departments",
        localField: "department_id",
        foreignField: "_id",
        as: "department_details",
      }
    },
    {
      "$set": {
        function_name: { "$arrayElemAt": ["$sub_departments_details.name", 0] },
        department_name: { "$arrayElemAt": ["$department_details.name", 0] },
      }
    },
    {
      "$project": {
        sub_departments_details: 0,
        department_details: 0,
      }
    },
  ]).allowDiskUse();
  if (records && records.length) {
    res.data = records
  } else {
    res.status = false
  }
  return res;

}

const createSelfRatingPermission = async (data) => {
  const res = getServiceResFormat();
  let db = getDb()
  const record = await selfRatingPermissionSchema(db).create(data);
  if (record) {
    res.data = record;
  } else {
    res.status = false;
  }
  return res
}

const getSelfRatingPermission = async (filter, options) => {
  const res = getServiceResFormat()
  let db = getDb()
  const totalRecords = await selfRatingPermissionSchema(db).find(filter).count();
  options = getAggregatePagination(options, totalRecords);
  const records = await selfRatingPermissionSchema(db).aggregate([
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
  if (queryRes && queryRes.data.length) {
    res.data = queryRes
  } else {
    res.status = false
  }
  return res
}

const updateSelfRatingPermission = async (filter, update) => {
  const res = getServiceResFormat();
  let db = getDb()
  const records = await selfRatingPermissionSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true });
  if (records) {
    res.data = records
  } else {
    res.status = false;
  }
  return res;
}
const deleteSelfRatingPermission = async (filter) => {
  const res = getServiceResFormat();
  let db = getDb()
  const records = await selfRatingPermissionSchema(db).findByIdAndDelete(filter);
  if (records) {
    res.data = records;
  } else {
    res.status = false
  }
  return res;
}

const getAllSelfRatingPermission = async (filter) => {
  const res = getServiceResFormat();
  let db = getDb()
  const records = await selfRatingPermissionSchema(db).aggregate([
    { "$match": filter },
  ]).allowDiskUse();
  if (records && records.length) {
    res.data = records
  } else {
    res.status = false;
  }
  return res;

}

const assignKra = async (data, employee_ids) => {
  const res = getServiceResFormat();
  let db = getDb()
  let record
  for (let i = 0; i < employee_ids.length; i++) {
    record = await kraAssignDetailsByEmployeeSchema(db)(db).create({ employee_id: employee_ids[i], ...data });
  }

  if (record) {
    res.data = record;
  } else {
    res.status = false;
  }
  return res
}

const getAssignKra = async (filter, options) => {
  const res = getServiceResFormat()
  let db = getDb()
  const totalRecords = await kraAssignDetailsByEmployeeSchema(db)(db).find(filter).count();
  options = getAggregatePagination(options, totalRecords);
  const records = await kraAssignDetailsByEmployeeSchema(db)(db).aggregate([
    { "$match": filter },
    {
      "$lookup":
      {
        from: "pms_kra_details",
        localField: "kra_id",
        foreignField: "_id",
        as: "kra_details",
      }
    },
    {
      "$lookup":
      {
        from: "employees",
        localField: "employee_id",
        foreignField: "_id",
        as: "employee_details",
      }
    },
    {
      "$set": {
        kra_name: { "$arrayElemAt": ["$kra_details.name", 0] },
        employee_name: { "$arrayElemAt": ["$employee_details.name", 0] }
      }
    },
    {
      "$project": {
        kra_details: 0,
        employee_details: 0
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
  if (queryRes && queryRes.data.length) {
    res.data = queryRes
  } else {
    res.status = false
  }
  return res
}

const updateAssignKra = async (filter, update) => {
  const res = getServiceResFormat();
  let db = getDb()
  const records = await kraAssignDetailsByEmployeeSchema(db)(db).findOneAndUpdate(filter, { $set: update }, { new: true });
  if (records) {
    res.data = records
  } else {
    res.status = false;
  }
  return res;
}
const deleteAssignKra = async (filter) => {
  const res = getServiceResFormat();
  let db = getDb()
  const records = await kraAssignDetailsByEmployeeSchema(db)(db).findByIdAndDelete(filter);
  if (records) {
    res.data = records;
  } else {
    res.status = false
  }
  return res;
}

const getAllAssignKra = async (filter) => {
  const res = getServiceResFormat();
  let db = getDb()
  const records = await kraAssignDetailsByEmployeeSchema(db)(db).aggregate([
    { "$match": filter },
    {
      "$lookup":
      {
        from: "pms_kra_details",
        localField: "kra_id",
        foreignField: "_id",
        as: "kra_details",
      }
    },
    {
      "$lookup":
      {
        from: "employees",
        localField: "employee_id",
        foreignField: "_id",
        as: "employee_details",
      }
    },
    {
      "$set": {
        kra_name: { "$arrayElemAt": ["$kra_details.name", 0] },
        employee_name: { "$arrayElemAt": ["$employee_details.name", 0] }
      }
    },
    {
      "$project": {
        kra_details: 0,
        employee_details: 0
      }
    },
  ]).allowDiskUse();
  if (records && records.length) {
    res.data = records
  } else {
    res.status = false;
  }
  return res;

}

const getEmployeeByKra = async (filter) => {
  const res = getServiceResFormat();
  let db = getDb()
  const record = await employeeModel.aggregate([
    { "$match": filter },
    {
      "$lookup": {
        from: "pms_kra_assign_by_employees",
        localField: "_id",
        foreignField: "employee_id",
        as: "assign_kra_details",
      }
    },
    {
      "$unwind": { path: "$assign_kra_details", preserveNullAndEmptyArrays: true }
    },
    {
      "$lookup": {
        from: "pms_kra_details",
        localField: "assign_kra_details.kra_id",
        foreignField: "_id",
        as: "kra_details",
      }
    },
    {
      "$addFields": {
        "kra_name": { "$ifNull": [{ "$arrayElemAt": ["$kra_details.kra_name", 0] }, null] }
      }
    },
    {
      "$project": {
        "emp_id": 1,
        "name": 1,
        "email": 1,
        "kra_name": 1,
        "account_status": 1,
        "joining_date": 1,
        "assign_id": "$assign_kra_details._id",
        "financial_id": {
          "$ifNull": [
            { "$arrayElemAt": ["$kra_details.financial_id", 0] },
            null
          ]
        },
        "kra_id": {
          "$ifNull": [
            { "$arrayElemAt": ["$kra_details._id", 0] },
            null
          ]
        },
        "kra_rating_type": {
          "$ifNull": [
            { "$arrayElemAt": ["$kra_details.kra_rating_type", 0] },
            null
          ]
        },
      }
    }
  ]).allowDiskUse();

  if (record && record.length) {
    res.data = record;
  } else {
    res.status = false;
  }
  return res;
}

const getKraDetailsByEmployee = async (filter) => {
  const res = getServiceResFormat();
  let db = getDb()
  filter = filter && filter?.financial_id ? { ...filter, financial_id: mongoose.Types.ObjectId(filter?.financial_id) } : filter;
  filter = filter && filter?.kra_id ? { ...filter, _id: mongoose.Types.ObjectId(filter?.kra_id) } : filter;
  const kra_filter = { _id: mongoose.Types.ObjectId(filter?.kra_id), financial_id: mongoose.Types.ObjectId(filter?.financial_id) }
  const record = await kraDetailsSchema(db).aggregate([
    { $match: kra_filter },
    {
      $lookup: {
        from: "pms_kra_assign_by_employees",
        localField: "_id",
        foreignField: "kra_id",
        as: "kra_assign_details"
      }
    },
    { $unwind: "$kra_assign_details" },
    {
      $match: {
        "kra_assign_details.employee_id": mongoose.Types.ObjectId(filter?.employee_id)
      }
    },
    {
      $lookup: {
        from: "pms_kra_parameter_details",
        let: { kraId: "$kra_assign_details.kra_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$kra_id", "$$kraId"] }
            }
          },
          {
            $lookup: {
              from: "pms_kra_sub_parameter_details",
              localField: "_id",
              foreignField: "parameter_id",
              as: "kra_sub_parameter_details"
            }
          }
        ],
        as: "kra_assign_details.kra_parameter_details"
      }
    },
    {
      $group: {
        _id: "$_id",
        financial_id: { $first: "$financial_id" },
        kra_name: { $first: "$kra_name" },
        kra_rating_type: { $first: "$kra_rating_type" },
        rating_duration: { $first: "$rating_duration" },
        created_by: { $first: "$created_by" },
        created_at: { $first: "$created_at" },
        updated_at: { $first: "$updated_at" },
        kra_assign_details: { $push: "$kra_assign_details" }
      }
    }
  ]);
  if (record && record.length) {
    res.data = record
  } else {
    res.status = false
  }
  return res;

}

const giveRating = async (data, rating_remark) => {
  const res = getServiceResFormat();
  let db = getDb()
  const [year, month] = data.rating_month.split('-')
  let bulk = kraRatingSchema(db).collection.initializeUnorderedBulkOp();
  for (let i = 0; i < rating_remark?.length; i++) {
    const item = rating_remark[i];
    item['employee_id'] = mongoose.Types.ObjectId(data.employee_id)
    item['financial_id'] = mongoose.Types.ObjectId(data.financial_id)
    item['month'] = month
    item['year'] = year
    item['feedback'] = data.feedback
    item['created_by'] = mongoose.Types.ObjectId(data.created_by)
    item['created_at'] = currentDate()
    item['kra_id'] = mongoose.Types.ObjectId(item.kra_id)
    item['parameter_id'] = mongoose.Types.ObjectId(item.parameter_id)
    item['sub_parameter_id'] = mongoose.Types.ObjectId(item.sub_parameter_id)
    bulk.find({ employee_id: item.employee_id, financial_id: item.financial_id, month: item.month, sub_parameter_id: item.sub_parameter_id }).upsert().updateOne({ $set: item });
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

const getGivenRating = async (filter, rating_month) => {
  const res = getServiceResFormat();
  let db = getDb()
  const [year, month] = rating_month.split('-');

  const kra_filter = {
    financial_id: mongoose.Types.ObjectId(filter?.financial_id),
    ...(filter?.kra_id && { _id: mongoose.Types.ObjectId(filter?.kra_id) })
  };
  const record = await kraDetailsSchema(db).aggregate([
    { $match: kra_filter },
    {
      $lookup: {
        from: "pms_kra_assign_by_employees",
        localField: "_id",
        foreignField: "kra_id",
        as: "kra_assign_details"
      }
    },
    { $unwind: "$kra_assign_details" },
    {
      $match: {
        "kra_assign_details.employee_id": mongoose.Types.ObjectId(filter?.employee_id)
      }
    },
    {
      $lookup: {
        from: "pms_kra_parameter_details",
        let: {
          kraId: "$kra_assign_details.kra_id",
          empId: "$kra_assign_details.employee_id"
        },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$kra_id", "$$kraId"] }
            }
          },
          {
            $lookup: {
              from: "pms_kra_rating_details",
              let: {
                paramId: "$_id",
                employeeId: "$$empId"
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$parameter_id", "$$paramId"] },
                        { $eq: ["$employee_id", "$$employeeId"] },
                        { $eq: ["$month", month] },
                        { $eq: ["$year", year] }
                      ]
                    }
                  }
                }
              ],
              as: "kra_rating_details"
            }
          },
          {
            $lookup: {
              from: "pms_kra_sub_parameter_details",
              localField: "_id",
              foreignField: "parameter_id",
              as: "kra_sub_parameter_details"
            }
          },
          {
            $addFields: {
              kra_sub_parameter_details: {
                $cond: [
                  { $gt: [{ $size: "$kra_rating_details" }, 0] },
                  "$kra_rating_details",
                  "$kra_sub_parameter_details"
                ]
              }
            }
          },
          {
            $project: {
              kra_rating_details: 0
            }
          }
        ],
        as: "kra_assign_details.kra_parameter_details"
      }
    },
    {
      $group: {
        _id: "$_id",
        financial_id: { $first: "$financial_id" },
        kra_name: { $first: "$kra_name" },
        kra_rating_type: { $first: "$kra_rating_type" },
        rating_duration: { $first: "$rating_duration" },
        created_by: { $first: "$created_by" },
        created_at: { $first: "$created_at" },
        updated_at: { $first: "$updated_at" },
        kra_assign_details: { $push: "$kra_assign_details" }
      }
    }
  ]);
  if (record && record.length) {
    res.data = record;
  } else {
    res.status = false;
  }

  return res;
};


const getRatingWiseEmployee = async (filter) => {
  const res = getServiceResFormat();
  let db = getDb()
  const record = await kraRatingSchema(db).aggregate([
    { $match: filter },
    { $match: { rating_remark: { $ne: null } } },
    {
      $group: {
        _id: "$employee_id",
        average_rating: {
          $avg: {
            $convert: {
              input: "$rating_remark",
              to: "double",
              onError: null,
              onNull: null
            }
          }
        },
        ratings: { $push: "$$ROOT" }
      }
    },
    {
      $lookup: {
        from: "employees",
        localField: "_id",
        foreignField: "_id",
        as: "employee_details"
      }
    },
    {
      $addFields: {
        employee_name: { $arrayElemAt: ["$employee_details.name", 0] },
        employee_code: { $arrayElemAt: ["$employee_details.emp_id", 0] },
        joining_date: { $arrayElemAt: ["$employee_details.joining_date", 0] },
        email: { $arrayElemAt: ["$employee_details.email", 0] }
      }
    },
    {
      $project: {
        employee_details: 0,
        ratings: 0
      }
    }
  ]);
  if (record && record.length) {
    res.data = record;
  } else {
    res.status = false;
  }
  return res;
}


const getAverageRating = async (filter) => {
  const res = getServiceResFormat();
  let db = getDb()
  const record = await kraRatingSchema(db).aggregate([
    { $match: filter },
    {
      $lookup: {
        from: "employees",
        localField: "_id",
        foreignField: "_id",
        as: "employee_details"
      }
    },
    {
      $addFields: {
        employee_name: { $arrayElemAt: ["$employee_details.name", 0] },
        employee_code: { $arrayElemAt: ["$employee_details.emp_id", 0] },
        joining_date: { $arrayElemAt: ["$employee_details.joining_date", 0] },
        email: { $arrayElemAt: ["$employee_details.email", 0] }
      }
    },
    {
      $project: {
        employee_details: 0
      }
    }
  ]);
  if (record && record.length) {
    res.data = record;
  } else {
    res.status = false;
  }
  return res;
}





module.exports = {
  createKra,
  getKraDetails,
  updateKraDetails,
  deleteKraDetails,
  createKraParameter,
  getKraParameter,
  updateKraParameter,
  deleteKraParameter,
  createKpiDetails,
  getKpiDetails,
  updateKpiDetail,
  deleteKpiDetail,
  createKraRatingTypeForDepartment,
  getKraRatingTypeForDepartment,
  updateKraRatingTypeDepartment,
  deleteKraRatingTypeForDepartment,
  getAllKraDetails,
  getAllKraParameterDetails,
  getAllKpiDetails,
  getAllKraRatingTypeForDepartment,
  createSelfRatingPermission,
  getSelfRatingPermission,
  updateSelfRatingPermission,
  deleteSelfRatingPermission,
  getAllSelfRatingPermission,
  assignKra,
  getAssignKra,
  updateAssignKra,
  deleteAssignKra,
  getAllAssignKra,
  getEmployeeByKra,
  getKraDetailsByEmployee,
  giveRating,
  getGivenRating,
  getRatingWiseEmployee,
  getAverageRating,
}