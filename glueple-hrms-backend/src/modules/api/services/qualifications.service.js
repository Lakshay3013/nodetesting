const qualificationsSchema = require('../../../models/qualifications.model');
const { getServiceResFormat, getAggregatePagination, getDb } = require('../utils/appHelper');
const httpStatus = require('http-status');
const ApiError = require('../../../helpers/ApiError');

const addQualification = async (data) => {
  const res = getServiceResFormat();
      let db = getDb()
  const nameExistData = await queryQualificationByFilter({ name: data?.name }, {});
  if (nameExistData && nameExistData?.status) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Qualification Name already exists.');
  }
  const shortNameExistData = await queryQualificationByFilter({ short_name: data?.short_name }, {});
  if (shortNameExistData && shortNameExistData?.status) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Qualification Short Name already exists.');
  }
  const queryRes = await qualificationsSchema(db).create(data);
  if (queryRes) {
    res.data = queryRes;
  } else {
    res.status = false;
  }
  return res;
};

const queryQualification = async (filter, options) => {
  const res = getServiceResFormat();
        let db = getDb()
  const totalRecords = await qualificationsSchema(db).find(filter).count();
  options = getAggregatePagination(options, totalRecords);
  const records = await qualificationsSchema(db).aggregate([
    { "$match": filter },
    {
      "$lookup":
      {
        from: "qualifications",
        localField: "parent_id",
        foreignField: "_id",
        as: "parent_name",
      }
    },
    {
      "$set":
      {
        parent_name: { "$arrayElemAt": ["$parent_name.name", 0] },
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

const queryQualificationByFilter = async (filter) => {
  const res = getServiceResFormat();
        let db = getDb()
  const queryRes = await qualificationsSchema(db).find(filter, { label: "$name", value: "$_id", _id: 1, name: 1, short_name: 1 }).allowDiskUse();
  if (queryRes && queryRes?.length) {
    res.data = queryRes;
  } else {
    res.status = false;
  }
  return res;
}

const updateQualification = async (filter, update) => {
        let db = getDb()
  const existData = await queryQualificationByFilter({ $or: [{ name: update?.name }, { short_name: update?.short_name }] }, {});
  if (existData?.status) {
    const filteredName = existData?.data?.filter((item) => (item?.name == update?.name && item?._id != update?._id));
    if (filteredName && filteredName?.length > 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Qualification Name already exists.');
    }
    const filteredShortName = existData?.data?.filter((item) => (item?.short_name == update?.short_name && item?._id != update?._id));
    if (filteredShortName && filteredShortName?.length > 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Qualification Short Name already exists.');
    }
  }
  const queryRes = await qualificationsSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true });
  if (queryRes?._id) {
    queryRes.data = queryRes;
  } else {
    queryRes.status = false;
  }
  return queryRes;
};

module.exports = {
  addQualification,
  queryQualification,
  queryQualificationByFilter,
  updateQualification,
};