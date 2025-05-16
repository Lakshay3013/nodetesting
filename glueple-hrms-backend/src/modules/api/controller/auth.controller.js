const catchAsync = require('../../../helpers/catchAsync.js');
const { setCache, getCache, deleteCache, clearCache } = require('../../../helpers/cacheHelper.js');
const config = require('../../../config/config.js');
const {
  authService,
  employeeService,
  permissionService,
  otpService,
} = require('../services');
const { signinToken } = require('../../../helpers/auth.js');
const { successResponse, errorResponse, authenticatePass, encryptPassword, generateRandomNumber, validateEmail, validateMobile } = require('../../../helpers');
const { messages, otpExpiresIn } = require('../../../config/constants.js');
const httpStatus = require('http-status');
const moment = require('moment');
const { decryptValue, getSessionData } = require('../utils/appHelper.js');
const { getServiceResFormat } = require('../utils/appHelper');
const { sendEmail } = require('../../../helpers/mailHelper.js')

const login = catchAsync(async (req, res) => {
  const response = getServiceResFormat();
  let { email, device_id } = req.body;
  // console.log("hello")
  let password = req.header('password');
  if (!password) {
    return errorResponse(req, res, messages.alert.PASSWORD_REQUIRED, httpStatus.BAD_REQUEST);
  }
  password = decryptValue(password);
  let user = await employeeService.getSingleUser({ $or: [{ email: email }, { emp_id: email }] }, { _id: 1, emp_id: 1, name: 1, email: 1, account_status: 1, role_id: 1, department_id: 1, designation_id: 1, position_id: 1, reported_to: 1, hod_id: 1,mobile:1 });
  if (!user?.status) {
    return errorResponse(req, res, messages.alert.CRED_MSG, httpStatus.BAD_REQUEST);
  }
  if (user?.data?.account_status === 'active') {
    const cacheKey = `all_emp_permission_${user.data?._id}`;
    const userDetail = await authService.getEmployeeLoginData({ _id: user.data?._id });
    if (!userDetail.status) {
      return errorResponse(req, res, messages.alert.CRED_MSG, httpStatus.BAD_REQUEST);
    }
    const empId = userDetail.data?.[0]?._id || '';
    // add device ID
    await employeeService.updateUserByFilter({ _id: empId }, { $set: { device_id } });
    if (!userDetail?.data || !userDetail?.data?.length) {
      return errorResponse(req, res, messages.alert.SERVER_MSG, httpStatus.BAD_REQUEST);
    }
    const checkPassword = await authenticatePass(password, userDetail.data?.[0]?.password);
    if (!checkPassword) {
      return errorResponse(req, res, messages.alert.CRED_MSG, httpStatus.BAD_REQUEST);
    }
    const token = signinToken({ email: userDetail.data?.[0]?.email, _id: userDetail.data?.[0]?._id });
    user = user?.data;
    const getPermissionData = await permissionService.getUserAPIRights(user);
    setCache(cacheKey, getPermissionData?.data, 7200);
    req.session.authData = { user, token };
    req.session.save();
    response.data = { user, token };
    return successResponse(req, res, messages.alert.SUCCESS_LOGIN, response, httpStatus.OK);
  }
  return errorResponse(req, res, messages.alert.ACCOUNT_STATUS_ERR, httpStatus.BAD_REQUEST);
});

const logout = catchAsync(async (req, res) => {
  const response = getServiceResFormat();
  req.session.destroy();
  return successResponse(req, res, messages.alert.SUCCESS_LOGOUT, response, httpStatus.OK);
});

const checkSessionStatus = catchAsync(async (req, res) => {
  const response = getServiceResFormat();
  const sessionData = req?.session;
  if (moment(sessionData?.cookie?._expires).format('YYYY-MM-DD HH:mm:ss') > moment().format('YYYY-MM-DD HH:mm:ss')) {
    response.data = { status: true };
  } else {
    response.status = false;
  }
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK);
});

const resetPassword = catchAsync(async (req, res) => {
  const user = getSessionData(req);
  const { current_password, new_password, confirm_password } = req.body;
  if (new_password == current_password) {
    return errorResponse(req, res, messages.alert.SAME_CRED, httpStatus.BAD_REQUEST);
  }
  if (new_password != confirm_password) {
    return errorResponse(req, res, messages.alert.CRED_NOT_MATCH, httpStatus.BAD_REQUEST);
  }
  const userDetail = await employeeService.getSingleUser({ _id: user?.id }, { _id: 1, emp_id: 1, name: 1, email: 1, password: 1 });
  const checkPassword = await authenticatePass(current_password, userDetail.data?.password);
  if (!checkPassword) {
    return errorResponse(req, res, messages.alert.CRED_MSG, httpStatus.BAD_REQUEST);
  }
  const encryptedPassword = await encryptPassword(new_password);
  const updatedEmployee = await employeeService.updateUserByFilter({ _id: user?.id }, { password: encryptedPassword });
  return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, updatedEmployee, httpStatus.OK);
});

const forgotPassword = catchAsync(async (req, res) => {
  const { new_password, confirm_password, email_mobile } = req.body;
  if (new_password != confirm_password) {
    return errorResponse(req, res, messages.alert.CRED_NOT_MATCH, httpStatus.BAD_REQUEST);
  }
  const user = await employeeService.getSingleUser({ $or: [{ email: email_mobile }, { mobile: email_mobile }], account_status: 'active' }, { _id: 1 });
  if(user?.status){
    const encryptedPassword = await encryptPassword(new_password);
    const updatedEmployee = await employeeService.updateUserByFilter({ _id: user?.id }, { password: encryptedPassword });
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, updatedEmployee, httpStatus.OK);
  }else{
    return errorResponse(req, res, messages.alert.Data_NOT_FOUND, httpStatus.BAD_REQUEST);
  }
});

const sendOtp = catchAsync(async (req, res) => {
  const { email_mobile } = req.body;
  const user = await employeeService.getSingleUser({ _id: user?.id }, { _id: 1 });
  const otp = generateRandomNumber(6);
  const expiresAt = moment().add(otpExpiresIn?.value, otpExpiresIn?.type).format("YYYY-MM-DD HH:mm:ss");
  const text = `Dear user,
  To reset your password, please use OTP: ${otp}
  If you did not request any password resets, then ignore this.`;
  await otpService.addOtp({
    employee_id: user?._id,
    email: email_mobile,
    otp: otp,
    type: 'forgot_password',
    expires_at: expiresAt,
  });
  if(validateEmail(email_mobile)){
    await sendEmail(user?.email, "Forgot Password", text);
  }else if(validateMobile(email_mobile)){

  }
  return successResponse(req, res, messages.alert.OTP_SENT, updatedEmployee, httpStatus.OK);
});

const verifyOtp = catchAsync(async (req, res) => {
  const { otp, email_mobile, otp_id } = req.query;
  const otpData = await otpService.queryOtpByFilter({
    _id: otp_id,
    email_mobile: email_mobile,
    otp: otp,
    type: 'forgot_password',
  });
  if(otpData?.status){
    return successResponse(req, res, messages.alert.OTP_VALID, otpData, httpStatus.OK);
  }else{
    return errorResponse(req, res, messages.alert.OTP_INVALID, httpStatus.BAD_REQUEST);
  }
});

const forgotPasswordForAdmin = catchAsync(async (req, res) => {
  const { new_password, confirm_password, _id } = req.body;
  if (new_password != confirm_password) {
    return errorResponse(req, res, messages.alert.CRED_NOT_MATCH, httpStatus.BAD_REQUEST);
  }
  const user = await employeeService.getSingleUser({_id:_id, account_status: 'active' }, { _id: 1 });
  if(user?.status){
    const encryptedPassword = await encryptPassword(new_password);
    const updatedEmployee = await employeeService.updateUserByFilter({ _id: user?.data?._id }, { password: encryptedPassword });
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, updatedEmployee, httpStatus.OK);
  }else{
    return errorResponse(req, res, messages.alert.Data_NOT_FOUND, httpStatus.BAD_REQUEST);
  }
});

module.exports = {
  login,
  logout,
  checkSessionStatus,
  resetPassword,
  forgotPassword,
  sendOtp,
  verifyOtp,
  forgotPasswordForAdmin
};
