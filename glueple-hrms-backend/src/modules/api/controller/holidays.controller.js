const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const { holidayService,locationService } = require('../services');
const { successResponse, errorResponse, encryptPassword, generateRandomPassword } = require('../../../helpers');
const { messages,sampleHolidayData } = require('../../../config/constants.js');
const {formatExcelDate,getDatesBetweenDateRange} = require('../utils/dateTimeHelper.js')
const {getServiceResFormat} = require('../utils/appHelper.js')
const xlsx = require('xlsx');
const moment = require('moment')
const fs = require('fs');
const path = require('path');
const { enumList } = require('../../../config/enum.js');

const createHolidays = catchAsync(async (req, res) => {
    req.body['gender'] = req.body['gender'] != [] ? req.body['gender'] : enumList?.gender?.default
    const createHolidayData = await holidayService.createHolidays(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, createHolidayData, httpStatus.OK);
});

const getHolidays = catchAsync(async (req, res) => {
    const holidayData = await holidayService.queryGetHoliday({ deleted_at: { $eq: null }, }, req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, holidayData, httpStatus.OK);
});

const updateHoliday = catchAsync(async (req, res) => {
    req.body['gender'] = req.body['gender'] != [] ? req.body['gender'] : enumList?.gender?.default
    const holidayData = await holidayService.updateHoliday({ _id: req.body._id }, req.body);
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, holidayData, httpStatus.OK);
});

const deleteHoliday = catchAsync(async (req, res) => {
    const holidayData = await holidayService.deleteHoliday({ _id: req.body._id });
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, holidayData, httpStatus.OK);
});

const bulkUploadHoliday = catchAsync(async (req, res) => {
    const response = getServiceResFormat();
  const file = req.file
    if (!file) {
        return errorResponse(req, res, messages.alert.FILE_NOT_FOUND, httpStatus.BAD_REQUEST);
    }
    if (!file.originalname.match(/\.(xlsx)$/)) {
        return errorResponse(req, res, messages.alert.INVALID_FILE, httpStatus.BAD_REQUEST);
    }
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const holidaysData = xlsx.utils.sheet_to_json(sheet);

    const countryList = await locationService.getAllCountryList({});
    const countryData = countryList.status ? countryList.data : [];
    // const countryMap = new Map(countryData.map(item => [item.name, item._id]));

    let holidayList = [];
    const groupedHolidays = {};

    // Group holidays by start and end date
    holidaysData.forEach(holiday => {
        const key = `${formatExcelDate(holiday.holiday_start_date)}-${formatExcelDate(holiday.holiday_end_date)}`;

        if (!groupedHolidays[key]) {
            groupedHolidays[key] = {
                country: holiday.country,
                state: holiday.state,
                city: holiday.city,
                branch: holiday.branch,
                gender: holiday.gender,
                description: holiday.description,
                restricted: holiday.restricted,
                notify_before_days: holiday.notify_before_days,
                is_notify_to_employee: holiday.is_notify_to_employee,
                is_reprocess_leave: holiday.is_reprocess_leave,
                name: holiday.name,
                holiday_data: [],
                holiday_start_date: formatExcelDate(holiday.holiday_start_date),
                holiday_end_date: formatExcelDate(holiday.holiday_end_date)
            };
        }

        groupedHolidays[key].holiday_data.push({
            date: formatExcelDate(holiday.date),
            apply_for: holiday.apply_for
        });
    });

    const result = Object.values(groupedHolidays).map(group => ({
        ...group,
        holiday_data: group.holiday_data
    }));

    for(let i = 0; i<result.length;i++){
        let obj = {}
        const holiday = result[i]
        const getCountry = countryData?.filter(item =>item.name === holiday.country)
        console.log("dfsdf", getCountry)
        const getStates = await locationService.getAllStateFromCountryList({country_id:{"$in":getCountry.map(data =>data.id)},name:{"$in":[holiday.state]}})
        const stateData = getStates.status ? getStates?.data : []
        const getCity = await locationService.getCityListFromState({state_id:{"$in":stateData.map(data=>data.id)},name:{"$in":[holiday.city]}})
        

        obj["country"] = getCountry.map(data =>data._id)
        obj["state"] = stateData.map(data=>data._id)
        obj["city"] = getCity.status ? getCity.data.map(item =>item._id) : []
        obj['gender'] = [holiday.gender]
        obj['description'] = holiday.description
        obj['restricted'] = holiday.restricted
        obj['notify_before_days'] = holiday.notify_before_days
        obj['is_reprocess_leave'] = holiday.is_reprocess_leave
        obj['name'] = holiday.name
        obj['holiday_data'] =holiday.holiday_data
        obj['from_date']=holiday.holiday_start_date
        obj['to_date']=holiday.holiday_end_date
        holidayList.push(obj)
    }
    let update =  await holidayService.bulkUploadHoliday(holidayList)

    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, update, httpStatus.OK);
});

const downloadSample = catchAsync(async (req, res) => {
    const response = getServiceResFormat();

    // Convert JSON data to worksheet
    const worksheet = xlsx.utils.json_to_sheet(sampleHolidayData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Define a file path for the Excel file
    const filePath = path.join(__dirname, '../../../../public/holiday/', 'sample.xlsx');

    // Ensure the directory exists
    if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath));
    }

    let filName = `http://localhost:3001/holiday/sample.xlsx`
    response.data = filName

    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK);
})


module.exports = {
    createHolidays,
    getHolidays,
    updateHoliday,
    deleteHoliday,
    bulkUploadHoliday,
    downloadSample,
};