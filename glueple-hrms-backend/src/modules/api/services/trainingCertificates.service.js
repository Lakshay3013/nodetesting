const trainingCertificatesSchema = require('../../../models/trainingCertificates.model');
const { getServiceResFormat, getFindPagination, getDb } = require('../utils/appHelper');
const httpStatus = require('http-status');
const ApiError = require('../../../helpers/ApiError');

const addTrainingCertificates = async (data) => {
  const res = getServiceResFormat();
       let db = getDb()
  const nameExistData = await queryTrainingCertificatesByFilter({ name: data?.name }, {});
  if (nameExistData && nameExistData?.status) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Training Certificate Name already exists.');
  }
  const shortNameExistData = await queryTrainingCertificatesByFilter({ short_name: data?.short_name }, {});
  if (shortNameExistData && shortNameExistData?.status) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Training Certificate Short Name already exists.');
  }
  const queryRes = await trainingCertificatesSchema(db).create(data);
  if (queryRes) {
    res.data = queryRes;
  } else {
    res.status = false;
  }
  return res;
};

const queryTrainingCertificates = async (filter, options) => {
  const res = getServiceResFormat();
     let db = getDb()
  const totalRecords = await trainingCertificatesSchema(db).find(filter).count();
  const limits = getFindPagination(options, totalRecords);
  const records = await trainingCertificatesSchema(db).find(filter, {}, limits?.limits).allowDiskUse();
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
};

const queryTrainingCertificatesByFilter = async (filter) => {
  const res = getServiceResFormat();
     let db = getDb()
  const queryRes = await trainingCertificatesSchema(db).find(filter, { label: "$name", value: "$_id", _id: 1, name: 1, short_name: 1, is_active: 1 }).allowDiskUse();
  if (queryRes && queryRes?.length) {
    res.data = queryRes;
  } else {
    res.status = false;
  }
  return res;
}

const updateTrainingCertificates = async (filter, update) => {
     let db = getDb()
  const existData = await queryTrainingCertificatesByFilter({ $or: [{ name: update?.name }, { short_name: update?.short_name }] }, {});
  if (existData?.status) {
    const filteredName = existData?.data?.filter((item) => (item?.name == update?.name && item?._id != update?._id));
    if (filteredName && filteredName?.length > 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Training Certificate Name already exists.');
    }
    const filteredShortName = existData?.data?.filter((item) => (item?.short_name == update?.short_name && item?._id != update?._id));
    if (filteredShortName && filteredShortName?.length > 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Training Certificate Short Name already exists.');
    }
  }
  const queryRes = await trainingCertificatesSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true });
  if (queryRes?._id) {
    queryRes.data = queryRes;
  } else {
    queryRes.status = false;
  }
  return queryRes;
};

module.exports = {
  addTrainingCertificates,
  queryTrainingCertificates,
  queryTrainingCertificatesByFilter,
  updateTrainingCertificates,
};