const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const {
    financialYearService, 
  employeeService,
} = require('../services');
const { successResponse, } = require('../../../helpers');
const { messages } = require('../../../config/constants.js');
const { getSessionData, getServiceResFormat, getFinancialMonth } = require('../utils/appHelper.js');
const mongoose = require('mongoose');
const ApiError = require('../../../helpers/ApiError.js');
const { moments } = require('../utils/dateTimeHelper.js');


const addFinancialYear = catchAsync(async (req, res) => {
  const user = getSessionData(req);
  req.body['created_by'] = user?.id;
  const financialYearData = await financialYearService.addFinancialYear(req.body);
  return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, financialYearData,  httpStatus.OK);
});

const updateFinancialYear = catchAsync(async (req, res) => {
  const financialYearData = await financialYearService.updateFinancialYear({_id: req.body._id}, req.body);
  return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, financialYearData,  httpStatus.OK);
});

const getAllFinancialYear = catchAsync(async (req, res) => {
    const financialYearData = await financialYearService.getAllFinancialYear({}, req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, financialYearData,  httpStatus.OK);
});  

const getFinancialYearList = catchAsync (async (req, res) => {
  const filters = {
    is_active: true,
  };
    financialYearData = await financialYearService.getFinancialYearList(filters);
  
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, financialYearData,  httpStatus.OK);
});

const getFinancialYearWiseMonth = catchAsync(async(req, res)=>{
  const response = getServiceResFormat();
  const {financial_id} = req.query;
  const getFinancialYearList = await financialYearService.getFinancialYearList({_id:mongoose.Types.ObjectId(financial_id)})
  if(!getFinancialYearList.status){
    throw new ApiError(httpStatus.BAD_REQUEST, messages.alert.FINANCIAL_YEAR_NOT_FOUND);
  }
  response.data = getFinancialMonth(getFinancialYearList.data[0].from,getFinancialYearList.data[0].to)
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK)
})


module.exports = {
    addFinancialYear,
    getAllFinancialYear,
    updateFinancialYear,
    getFinancialYearList,
    getFinancialYearWiseMonth

};