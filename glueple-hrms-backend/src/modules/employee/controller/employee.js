const httpStatus = require('http-status');
const { ObjectId } = require('mongodb');
const { ObjectID } = require('mongodb');
const userService = require('../services/service.js');
const { successResponse, errorResponse } = require('../../../helpers');
const catchAsync = require('../../../helpers/catchAsync');

const getProfile = catchAsync(async (req, res) => {
  const { user } = req;
  const userData = await userService.queryUsers({ _id: new ObjectId(user._id) });
  res.render('pages/profile', {
    success: res.locals.flashSuccess || undefined,
    error: res.locals.flashError || undefined,
    userData,
  });
});

module.exports = {
  getProfile,
};
