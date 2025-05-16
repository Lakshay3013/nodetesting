const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const { successResponse, errorResponse, encryptPassword } = require('../../../helpers/index.js');
const common = require('../../../config/constants.js');
const { messages,appConstants } = require('../../../config/constants.js');
const { getServiceResFormat, getSessionData } = require('../utils/appHelper.js')
const {formatExcelDate, currentDate, valueOfData, currentDateTOString} = require('../utils/dateTimeHelper.js')
const XLSX = require('xlsx');
const path = require('path');
const mongoose = require('mongoose');
const { clientService, attendanceService } = require('../services/index.js');
const axoisHelper = require('../../../helpers/axois.js');
const filePath = path.join(__dirname, '..', '..', '..', '..', 'public/');
const qs = require('qs');
const moment = require("moment")

const addClient = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    console.log("sdfdf",user.id)
    req.body["created_by"] = mongoose.Types.ObjectId(user.id)
    const addClient = await clientService.createClient(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, addClient, httpStatus.OK);
});

const getClient = catchAsync(async(req, res)=>{
    const getClient = await clientService.getClient({}, req.query)
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getClient, httpStatus.OK);

})

const updateClient = catchAsync(async(req, res)=>{
    const updateClient = await clientService.updateClient({_id:mongoose.Types.ObjectId(req.body._id)},req.body);
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, updateClient, httpStatus.Ok);

});

const deleteClient = catchAsync(async(req, res)=>{
    const deleteClient = await clientService.deleteClient({_id:mongoose.Types.ObjectId(req.body._id)});
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, deleteClient, httpStatus.OK)
})





module.exports = {
    addClient,
    getClient,
    updateClient,
    deleteClient,
};