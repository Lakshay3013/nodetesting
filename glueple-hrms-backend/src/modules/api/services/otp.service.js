const otpSchema = require('../../../models/otp.model');
const { getServiceResFormat, getDb } = require('../utils/appHelper');

const addOtp = async (data) => {
  const res = getServiceResFormat();
  let db = getDb()
  const queryRes = await otpSchema(db).create(data);
  if(queryRes){
    res.data = queryRes;
  }else{
    res.status = false;
  }
  return res;
};

const queryOtpByFilter = async (filter, project) => {
  const res = getServiceResFormat();
    let db = getDb()
  const queryRes = await otpSchema(db).findOne(filter,project).sort({'created_at': -1});
  if(queryRes && queryRes?._id){
      res.data = queryRes;
  }else{
      res.status = false;
  }
  return res;
};

module.exports = {
    addOtp,
    queryOtpByFilter,
};