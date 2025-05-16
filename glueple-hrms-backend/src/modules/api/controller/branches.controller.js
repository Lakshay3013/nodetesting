const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const {
    branchService,
} = require('../services/index.js');
const { successResponse, errorResponse } = require('../../../helpers/index.js');
const { messages } = require('../../../config/constants.js');
const mongoose = require('mongoose')

const getAllBranches = catchAsync(async (req, res) => {
    const city_ids = req.body?.city_id ? req.body?.city_id : [];
    let idsData = city_ids.map(data => mongoose.Types.ObjectId(data))
    const branchData = await branchService.queryAllBranches({deleted_at: {$eq: null}});
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, branchData, httpStatus.OK);
});

module.exports = {
    getAllBranches,
};