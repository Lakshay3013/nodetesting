const httpStatus = require('http-status');
const { errorResponse } = require('../helpers/index');
const { messages } = require('../config/constants');
const { getCache } = require('../helpers/cacheHelper');
const { getSessionData } = require('../modules/api/utils/appHelper');
//uncomment it when server will get live
const checkPermission = async (req, res, next) => {
  // try {
  //   const path = req.path;
  //   const user = getSessionData(req);
  //   const cachedData = getCache(`all_emp_permission_${user?.id}`);
  //   if (cachedData) {
  //       if(cachedData.includes(path)){
  //           next();
  //       }else{
  //           return errorResponse(req, res, messages.validation.ACCESS_NOT_AVAILABLE, httpStatus.FORBIDDEN);
  //       }
  //   } else {
  //       return errorResponse(req, res, messages.validation.SESSION_NOT_AVAILABLE, httpStatus.UNAUTHORIZED);
  //   }
  // } catch (error) {
  //   return errorResponse(req, res, messages.validation.ACCESS_NOT_AVAILABLE, httpStatus.FORBIDDEN);
  // }
  next();
}


module.exports = checkPermission;
