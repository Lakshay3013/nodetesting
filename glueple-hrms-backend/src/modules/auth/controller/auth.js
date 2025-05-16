const httpStatus = require('http-status');
const { ObjectId } = require('mongodb');
const authService = require('../services/service');
const userService = require('../../employee/services/service');
const { authenticatePass } = require('../../../helpers');
const catchAsync = require('../../../helpers/catchAsync');
const config = require('../../../config/config.js');
const { signinToken } = require('../../../helpers/auth.js');
const { successResponse, errorResponse } = require('../../../helpers');
const { messages } = require('../../../config/constants.js');

const login = catchAsync(async (req, res) => {
  let { email, device_id, password } = req.body;
  email = email.toLowerCase();
  const filter = { email };
  const user = await userService.getSingleUser(filter, 'account_status');
  if (!user) {
    return errorResponse(req, res, messages.alert.CRED_MSG, httpStatus.BAD_REQUEST);
  }
  if (user.account_status === 'active') {
    const userDetail = await authService.getEmployeeLoginData(email);
    if (!userDetail.length) {
      return errorResponse(req, res, messages.alert.CRED_MSG, httpStatus.BAD_REQUEST);
    }
    const empId = userDetail[0]._id;
    // add device ID
    await userService.updateUserByFilter({ _id: new ObjectId(empId) }, { $set: { device_id } });
    if (!userDetail || !userDetail.length) {
      return errorResponse(req, res, messages.alert.SERVER_MSG, httpStatus.BAD_REQUEST);
    }
    const checkPassword = authenticatePass(userDetail[0].password, password, userDetail[0].salt);
    if (!checkPassword) {
      return errorResponse(req, res, messages.alert.CRED_MSG, httpStatus.BAD_REQUEST);
    }
    const token = signinToken(email);
    req.session.authData = { user, token };
    req.session.save(function (err) {
      res.redirect(`${config.url}administration/dashboard`);
    });
  }
  return errorResponse(req, res, messages.alert.ACCOUNT_STATUS_ERR, httpStatus.BAD_REQUEST);
});

const logout = catchAsync(async (req, res) => {
  const { user } = req;
  await userService.updateUserByFilter(new ObjectId(user._id), { token: '' });
  req.session.destroy();
  res.redirect(`${config.url}`);
});

module.exports = {
  login,
  logout,
};
