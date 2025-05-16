const httpStatus = require('http-status');
const moment = require("moment");
const catchAsync = require('../../../helpers/catchAsync.js');
const {
  attendanceService,
  employeeService,
  shiftManagementService,
  shortLeaveConfigurationService,
  leaveService,
  approvalManagementService,
  approverService,
  roleService,
  holidayService,
  clientService,
} = require('../services');
const { successResponse, errorResponse } = require('../../../helpers');
const { messages, woStatus, ipWiseDoorInfo } = require('../../../config/constants.js');
const { getSessionData, getShiftDetails, getServiceResFormat, getShiftDetailsDateWise, getEmployeeOffs,checkAttendanceStatus ,createFolder, checkAttendanceWithStatus, getBaseUrl} = require('../utils/appHelper.js');
const ApiError = require('../../../helpers/ApiError');
const { convertDate, convertDateByMoment, subtractFromMomentDate, addInMomentDate, getDatesBetweenDateRange, isSunday, isSaturday, countOfSaturday, isWeekOffDayData, getMomentDuration, getHours, getMinutes, getSeconds, getDurationDifference, convertTimeByMoment, dateIsBetweenDates, compareTime, addInMomentTime, subtractFromMomentTime, getStartOrEndDate, calculateWorkingDetails,convertDateByMoments,timeToSeconds,
  secondsToTime,isWeekend,currentDate
 } = require('../utils/dateTimeHelper.js');
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const filePath = path.join(__dirname, '..', '..', '..', '..', 'public/');
const axoisHelper = require('../../../helpers/axois.js')
const fs = require('fs');
const { use } = require('passport');

const checkInCheckOut = catchAsync(async (req, res) => {
  const user = getSessionData(req);
  createFolder('./public/attendance_image');
  req.body['emp_id'] = user?.id;
  req.body['emp_code'] = user?.emp_id
  req.body['user_agent'] = req.body.user_agent || req.headers['user-agent'] || "";
  let filename = `${Date.now()}_${user?.id}.png`
  const saveImage = await axoisHelper.saveImageInS3({ image: req.body.emp_img, clientCode: 'G100', fileName: 'attendance_images' })
  if (saveImage.error) {
    const base64Data = req.body.emp_img.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const filePath = path.join(__dirname, '../../../../public/attendance_image/', filename);

    if (!fs.existsSync(path.join(__dirname, '../../../../public/attendance_image/'))) {
      fs.mkdirSync(path.join(__dirname, '../../../../public/attendance_image/'));
    }
    fs.writeFile(filePath, buffer, (err) => {
      if (err) {
        return errorResponse(req, res, messages.alert.IMAGE_SAVE_FAILED, httpStatus.BAD_REQUEST);
      }
    });
    req.body['capture_file'] = filename
  } else {
    req.body['image_type'] = "s3"
    req.body['capture_file'] = saveImage?.data?.Location
  }
  const addressByLatLng = await axoisHelper.geocodeAddress({ lat: req.body.latitude, lng: req.body.longitude });
  let latLngAddress = ''
  if (addressByLatLng?.results?.length) {
    const results = addressByLatLng?.results;
    latLngAddress = results[0]?.formatted_address || '';

    const addressArr = [];
    if (!latLngAddress && results[0]?.address_components?.length) {
      for (let i = 0; i < results[0].address_components.length; i++) {
        const addressType = results[0]?.address_components[i]?.types[0] || '';
        if (addressType === 'plus_code') addressArr.push(results[0].address_components[i]['plus_code']);
        else if (addressType === 'political') addressArr.push(results[0].address_components[i]['political']);
        else if (addressType === 'locality') addressArr.push(results[0].address_components[i]['locality']);
        else if (addressType === 'administrative_area_level_3') addressArr.push(results[0].address_components[i]['administrative_area_level_3']);
        else if (addressType === 'administrative_area_level_2') addressArr.push(results[0].address_components[i]['administrative_area_level_2']);
        else if (addressType === 'administrative_area_level_1') addressArr.push(results[0].address_components[i]['administrative_area_level_1']);
        else if (addressType === 'country') addressArr.push(results[0].address_components[i]['country']);
        else if (addressType === 'postal_code') addressArr.push(results[0].address_components[i]['postal_code']);
      }
      if (addressArr?.length) {
        latLngAddress = addressArr.join(', ')
      }
    }
  }
  req.body['punch_address'] = latLngAddress
  const rawEntryData = await attendanceService.addRawEntryData(req.body);
  return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, rawEntryData, httpStatus.OK);
});



const getCheckInCheckOut = catchAsync(async (req, res) => {
  const response = getServiceResFormat();
  const user = getSessionData(req);
  let punchData = {
    $gte: moment().format("YYYY-MM-DD"),
    $lt: moment().add(1, "day").format("YYYY-MM-DD")
  }
// console.log("check server time",moment().format() ,moment().format('YYYY-MM-DD HH:mm:ss')  ,moment().format('hh:mm A')  ,moment().format('HH:mm:ss'))
  let calculatedLogs = {}
  let shiftDetails = await getShiftDetailEmployeeWise(user?.id)
  const getAttendanceRawData = await attendanceService.getRawEntryData({ emp_id: mongoose.Types.ObjectId(user.id), punch_time: punchData });

  if (getAttendanceRawData.status) {
    calculatedLogs = calculateAttendanceLogTime(getAttendanceRawData?.data, "IN/OUT", "", false, moment().format("YYYY-MM-DD"));
    calculatedLogs["shift_full_day_working_hours"] = shiftDetails?.full_day_policy_time
  }
  let data = {
    attendanceLog: getAttendanceRawData.status ? getAttendanceRawData?.data[getAttendanceRawData?.data?.length - 1] : [],
    attendanceAllLog : getAttendanceRawData.status
  ? getAttendanceRawData?.data?.map(data => {
      const punch_address = data?.punch_address || '';
      data.activity_name = data?.punch_address
        ? (ipWiseDoorInfo?.[data.punch_address] || punch_address)
        : punch_address;
      return data; 
    })
  : [],
    attendanceTime: calculatedLogs
  }
  response.data = data;
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK);
})

const getShiftDetailEmployeeWise = async (employee_id) => {
  //get default shift data
  const getDefaultShiftData = await shiftManagementService.getDefaultShiftData();
  if (!getDefaultShiftData?.status) {
    throw new ApiError(httpStatus.BAD_REQUEST, messages.alert.DEFAULT_SHIFT_NA);
  }
  let getActiveEmployees = await employeeService.queryUserForAttendance({ account_status: 'active', _id: mongoose.Types.ObjectId(employee_id) });
  let getActiveEmployeess = getActiveEmployees?.status ? getActiveEmployees.data : [];
  const { shiftDetails } = getShiftDetails(getActiveEmployeess, getDefaultShiftData?.data, moment().format('YYYY-MM-DD'), []);
  return shiftDetails
}

const calculateAttendance = catchAsync(async (req, res) => {
  const { start_date, end_date, is_show_to_user, log_format,emp_id } = req.body;
  const response = await calculateAttendanceFunction({ start_date, end_date, is_show_to_user, log_format,emp_id });
  return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, response, httpStatus.OK);
});

const calculateAttendanceFunction = async (params) => {
  const { start_date, end_date, is_show_to_user, log_format,emp_id } = params;
  const attendanceData = [];

  //get attendance logs data
  // let getAttendanceRawData = await attendanceService.getRawEntryData({
  //   punch_time: {
  //     $gte: convertDate(subtractFromMomentDate(start_date, 1, 'day', "YYYY-MM-DD HH:mm:ss")),
  //     $lte: convertDate(addInMomentDate(end_date, 1, 'day', "YYYY-MM-DD HH:mm:ss")),
  //   }
  // });
  //date saved in moment format, that's why removed the function
  let condition = { "account_status": "active" }
  let attendanceFilter = {
    punch_time: {
      $gte: subtractFromMomentDate(start_date, 1, 'day', "YYYY-MM-DD HH:mm:ss"),
      $lte: addInMomentDate(end_date, 1, 'day', "YYYY-MM-DD HH:mm:ss"),
    }}
  if(emp_id){
    condition = {_id: mongoose.Types.ObjectId(emp_id),"account_status": "active" }
    attendanceFilter = {
      emp_id: mongoose.Types.ObjectId(emp_id),
      punch_time: {
        $gte: subtractFromMomentDate(start_date, 1, 'day', "YYYY-MM-DD HH:mm:ss"),
        $lte: addInMomentDate(end_date, 1, 'day', "YYYY-MM-DD HH:mm:ss"),
      }}
  }
  let getAttendanceRawData = await attendanceService.getRawEntryData(attendanceFilter);
  getAttendanceRawData = getAttendanceRawData?.status ? getAttendanceRawData.data : [];

  //get active employees data
  let getActiveEmployees = await employeeService.queryUserForAttendance(condition);
  getActiveEmployees = getActiveEmployees?.status ? getActiveEmployees.data : [];

  //get short leave configuration
  let getActiveShortLeaveConfiguration = await shortLeaveConfigurationService.queryConfiguration({ is_active: true, used_as: 'attendance_calculation', deleted_at: { $eq: null } });
  getActiveShortLeaveConfiguration = getActiveShortLeaveConfiguration?.status ? getActiveShortLeaveConfiguration.data : [];

  //get default shift data
  const getDefaultShiftData = await shiftManagementService.getDefaultShiftData();
  if (!getDefaultShiftData?.status) {
    throw new ApiError(httpStatus.BAD_REQUEST, messages.alert.DEFAULT_SHIFT_NA);
  }

  //get holidays between dates
  const getHolidayData = await holidayService.queryHolidays({
    '$or': [
      { from_date: { $gte: convertDateByMoment(start_date, "YYYY-MM-DD"), $lte: convertDateByMoment(end_date, "YYYY-MM-DD") } },
      { to_date: { $gte: convertDateByMoment(start_date, "YYYY-MM-DD"), $lte: convertDateByMoment(end_date, "YYYY-MM-DD") } }
    ]
  });

  //get dates array and apply loop
  const getDates = getDatesBetweenDateRange(start_date, end_date);
  for (let i = 0; i < getDates?.length; i++) {
    const dateData = getDates[i];
    const attendanceDate = convertDateByMoment(dateData?.date, "YYYY-MM-DD");
    const prevAttendanceDate = subtractFromMomentDate(dateData?.date, 1, 'day', "YYYY-MM-DD");
    for (let j = 0; j < getActiveEmployees?.length; j++) {
      const employeeData = getActiveEmployees[j];
      const obj = {
        emp_id: employeeData?._id,
        attendance_date: dateData?.date,
        day_of_week: dateData?.day,
        first_half_status: 'AB',
        second_half_status: 'AB',
        attendance_status: 'AB',
        first_check_in_time: '',
        last_check_out_time: '',
        total_working_hours: '',
        total_break_time: '',
        total_overtime_hours: '',
        duration: '',
        log_ids: [],
        is_show_to_user: is_show_to_user,
        is_late: '',
        is_early_exit: '',
        late_duration: '',
        early_exit_duration: '',
        is_sandwich: false,
        actual_status: '',
      };

      //get shift related details and add tolerance for coming and going
      const { shiftDetails, workingDay, alternativeSaturdayOff, weekOffs, shortLeaves, holidays } = getShiftDetails(employeeData, getDefaultShiftData?.data, attendanceDate, getActiveShortLeaveConfiguration, getHolidayData?.data);
      const shiftStartTime = compareTime(`${shiftDetails?.shift_end_time}:00`, `${shiftDetails?.shift_start_time}:00`, "HH:mm:ss") ? convertDateByMoment(`${prevAttendanceDate} ${shiftDetails?.shift_start_time}:00`, "YYYY-MM-DD HH:mm:ss") : convertDateByMoment(`${attendanceDate} ${shiftDetails?.shift_start_time}:00`, "YYYY-MM-DD HH:mm:ss");
      const shiftEndTime = convertDateByMoment(`${attendanceDate} ${shiftDetails?.shift_end_time}:00`, "YYYY-MM-DD HH:mm:ss");
      const earlyTolerance = shiftDetails?.early_arrival_tolerance?.split(':');
      const lateTolerance = shiftDetails?.late_departure_tolerance?.split(':');
      let punchStartTime = earlyTolerance?.length ? subtractFromMomentDate(shiftStartTime, earlyTolerance[0], 'hours', 'YYYY-MM-DD HH:mm:ss') : punchStartTime;
      punchStartTime = earlyTolerance?.length ? subtractFromMomentDate(punchStartTime, earlyTolerance[1], 'minutes', 'YYYY-MM-DD HH:mm:ss') : punchStartTime;
      let punchEndTime = lateTolerance?.length ? addInMomentDate(shiftEndTime, lateTolerance[0], 'hours', 'YYYY-MM-DD HH:mm:ss') : punchEndTime;
      punchEndTime = lateTolerance?.length ? addInMomentDate(punchEndTime, lateTolerance[1], 'minutes', 'YYYY-MM-DD HH:mm:ss') : punchEndTime;
      //fetch employee logs on the basis of date-time and employee id
      const employeeLogs = getAttendanceRawData?.filter((item, key) => {
        const date = convertDateByMoment(item.punch_time, 'YYYY-MM-DD HH:mm:ss');
        if (dateIsBetweenDates(date, punchStartTime, punchEndTime)&& item.emp_id.toString() == employeeData?._id) {
          return item;
        }
      });
      //get employee working hours, break time and other details
      const calculatedLogs = calculateAttendanceLogTime(employeeLogs, log_format, shiftDetails, true, attendanceDate);
      obj['duration'] = calculatedLogs?.totalWorkingTime || '';
      obj['total_working_hours'] = calculatedLogs?.totalRealWorkingTime || '';
      obj['total_break_time'] = calculatedLogs?.totalBreakTime || '';
      obj['first_check_in_time'] = calculatedLogs?.firstEntryTime || '';
      obj['last_check_out_time'] = calculatedLogs?.lastExitTime || '';

      const leaveData = await leaveService.queryApprovedLeave({ leave_start_date: attendanceDate, emp_id: employeeData?._id });

      //filter attendance status on the basis of conditions
      const attendanceStatus = await getAttendanceStatus({ shiftDetails, calculatedLogs, workingDay, alternativeSaturdayOff, weekOffs, shortLeaves, leaveData, shiftStartTime, shiftEndTime, holidays,obj });
      obj['first_half_status'] = attendanceStatus?.firstHalfStatus;
      obj['second_half_status'] = attendanceStatus?.secondHalfStatus;
      obj['attendance_status'] = attendanceStatus?.attendanceStatus;
      obj['is_late'] = attendanceStatus?.isLate;
      obj['is_early_exit'] = attendanceStatus?.isEarlyExit;
      obj['late_duration'] = attendanceStatus?.lateDuration;
      obj['early_exit_duration'] = attendanceStatus?.earlyExitDuration;
      obj['is_sandwich'] = attendanceStatus.isSandwich;
      obj['actual_status'] = attendanceStatus.actualStatus;
      attendanceData.push(obj);
    }
  }
  const response = await attendanceService.bulkAddUpdateCalculatedAttendance(attendanceData);
  return response;
};


//get attendance log time related details
const calculateAttendanceLogTime = (employeeLogs, log_format, shiftDetails, isLastElem, date) => {
  let totalBreakDuration = getMomentDuration(0);
  let firstEntryTime = null;
  let lastExitTime = null;
  let tmpLastExitTime = null;

  let currTime = convertDateByMoment('', 'YYYY-MM-DD HH:mm:ss');
  for (const log of employeeLogs) {
    const timestamp = convertDateByMoment(log.punch_time, 'YYYY-MM-DD HH:mm:ss');
    const eventType = log.log_type.toLowerCase();
    if (eventType == 'in') {
      if (!firstEntryTime) {
        firstEntryTime = convertDateByMoment(timestamp, 'YYYY-MM-DD HH:mm:ss');
      }

      if (lastExitTime !== tmpLastExitTime && log_format != "IN") {
        tmpLastExitTime = lastExitTime;
        const breakDuration = getDurationDifference(timestamp, lastExitTime, 'YYYY-MM-DD HH:mm:ss');
        totalBreakDuration.add(breakDuration);
      } else if (log_format == "IN") {
        lastExitTime = convertDateByMoment(timestamp, 'YYYY-MM-DD HH:mm:ss');
      }
    } else if (eventType == 'out') {
      lastExitTime = timestamp;
    }
  }
  currTime = isLastElem && employeeLogs?.length ? convertDateByMoment(employeeLogs[employeeLogs?.length - 1]?.punch_time, 'YYYY-MM-DD HH:mm:ss') : currTime;
  const outTime = currTime || null;
  const totalWorkDuration = getDurationDifference(outTime, firstEntryTime, 'YYYY-MM-DD HH:mm:ss');
  const workHours = Math.floor(getHours(totalWorkDuration)) || 0;
  const workMinutes = Math.floor(getMinutes(totalWorkDuration)) % 60 || 0;
  const workSeconds = Math.floor(getSeconds(totalWorkDuration)) % 60 % 60 || 0;
  const breakHours = Math.floor(getHours(totalBreakDuration)) || 0;
  const breakMinutes = Math.floor(getMinutes(totalBreakDuration)) % 60 || 0;
  const breakSeconds = Math.floor(getSeconds(totalBreakDuration)) % 60 % 60 || 0;

  let totalWorkingTime = convertTimeByMoment(`${workHours}:${workMinutes}:${workSeconds}`, 'HH:mm:ss');
  let totalBreakTime = convertTimeByMoment(`${breakHours}:${breakMinutes}:${breakSeconds}`, 'HH:mm:ss');
  const diffTime = getDurationDifference(totalWorkingTime, totalBreakTime, 'HH:mm:ss');
  const realWorkingHours = Math.floor(getHours(diffTime)) || 0;
  const realWorkingMinutes = Math.floor(getMinutes(diffTime)) % 60 || 0;
  const realWorkingSeconds = Math.floor(getSeconds(diffTime)) % 60 % 60 || 0;
  const totalRealWorkingTime = convertTimeByMoment(`${realWorkingHours}:${realWorkingMinutes}:${realWorkingSeconds}`, 'HH:mm:ss');


  return {
    firstEntryTime: firstEntryTime || null,
    lastExitTime: lastExitTime || null,
    currTime: convertDateByMoment(currTime, ''),
    workHours, workMinutes, workSeconds, workTotalMilliseconds: 0,
    breakHours, breakMinutes, breakSeconds, breakTotalMilliseconds: 0,
    realWorkingHours, realWorkingMinutes, realWorkingSeconds,
    totalWorkingTime: convertTimeByMoment(totalWorkingTime, 'HH:mm:ss'),
    totalBreakTime: convertTimeByMoment(totalBreakTime, 'HH:mm:ss'),
    totalRealWorkingTime: convertTimeByMoment(totalRealWorkingTime, 'HH:mm:ss'),
    date,
  };
};

//get attendance statuses of employees
const getAttendanceStatus = async (params) => {
  let { shiftDetails, calculatedLogs, workingDay, alternativeSaturdayOff, weekOffs, shortLeaves, leaveData, shiftStartTime, shiftEndTime, holidays,obj } = params;
  const status = {
    attendanceStatus: 'AB',
    firstHalfStatus: 'AB',
    secondHalfStatus: 'AB',
    isLate: false,
    isEarlyExit: false,
    lateDuration: '',
    earlyExitDuration: '',
    isSandwich: false,
    actualStatus: '',
  }
  shiftStartTime = convertDateByMoment(shiftStartTime, "HH:mm:ss");
  shiftEndTime = convertDateByMoment(shiftEndTime, "HH:mm:ss");
  let shiftEndTimes = convertTimeByMoment(`${shiftEndTime}`, 'HH:mm:ss');
  let shiftStartTimes = convertTimeByMoment(`${shiftStartTime}`, 'HH:mm:ss');
  let difference = getDurationDifference(shiftStartTimes, shiftEndTimes, "HH:mm:ss", shiftDetails.shift_type);   //night type is sent to get the proper time
  let breakEndTime = convertTimeByMoment(`${shiftDetails?.break_start_time}:00`, 'HH:mm:ss');
  let breakStartTime = convertTimeByMoment(`${shiftDetails?.break_end_time}:00`, 'HH:mm:ss');
  let totalBreakTime = getDurationDifference(breakEndTime, breakStartTime, "HH:mm:ss");
  const workHours = Math.floor(getHours(difference)) || 0;
  const workMinutes = Math.floor(getMinutes(difference)) % 60 || 0;
  const workSeconds = Math.floor(getSeconds(difference)) % 60 % 60 || 0;
  const breakHours = Math.floor(getHours(totalBreakTime)) || 0;
  const breakMinutes = Math.floor(getMinutes(totalBreakTime)) % 60 || 0;
  const breakSeconds = Math.floor(getSeconds(totalBreakTime)) % 60 % 60 || 0;
  let totalInTime = getDurationDifference(`${workHours}:${workMinutes}:${workSeconds}`, `${breakHours}:${breakMinutes}:${breakSeconds}`, "HH:mm:ss");
  let totalInHours = Math.floor(getHours(totalInTime)) || 0;
  let totalInMin = Math.floor(getMinutes(totalInTime)) % 60 || 0;
  let totalInSec = Math.floor(getSeconds(totalInTime)) % 60 % 60 || 0;
  totalInTime = convertTimeByMoment(`${totalInHours}:${totalInMin}:${totalInSec}`, 'HH:mm:ss');
  difference = parseInt(getMinutes(difference));
  totalBreakTime = parseInt(getMinutes(totalBreakTime));
  difference = difference - totalBreakTime;
  let differnceInHours = moment.utc().startOf('day').add(difference, 'minutes').format('HH:mm:ss')
  let halfDaytime = convertTimeByMoment(`${shiftDetails?.half_day_policy_time}:00`, 'hh:mm:ss');
  let graceStartHours = Math.floor(getHours(shiftDetails.grace_start_time)) || 0;
  let graceStartMin = Math.floor(getMinutes(shiftDetails.grace_start_time)) % 60 || 0;
  let graceEndHours = Math.floor(getHours(shiftDetails.grace_end_time)) || 0;
  let graceEndMin = Math.floor(getMinutes(shiftDetails.grace_end_time)) % 60 || 0;
  let maxInTime = addInMomentTime(shiftStartTimes, graceStartHours, 'hours', "HH:mm:ss");
  maxInTime = addInMomentTime(maxInTime, graceStartMin, 'minutes', "HH:mm:ss");
  let maxOutTime = subtractFromMomentTime(shiftEndTimes, graceEndHours, 'hours', "HH:mm:ss");
  maxOutTime = subtractFromMomentTime(maxOutTime, graceEndMin, 'minutes', "HH:mm:ss");
  let total_time_for_calculation = differnceInHours;
  let halfDayBreak = Math.ceil(totalBreakTime / 2);
  let totalRealTimeWorkingWithHalfDayBreak = addInMomentDate(`${calculatedLogs?.date} ${calculatedLogs?.totalRealWorkingTime}`, halfDayBreak, 'minutes', 'HH:mm:ss')
  if (calculatedLogs?.totalRealWorkingTime >= totalInTime && convertDateByMoment(calculatedLogs.firstEntryTime, "HH:mm:ss") <= maxInTime) {
    status.attendanceStatus = "PR"
    status.firstHalfStatus = "PR"
    status.secondHalfStatus = "PR"

  } else if (totalRealTimeWorkingWithHalfDayBreak < halfDaytime) {
    status.attendanceStatus = "AB"
    status.firstHalfStatus = "AB"
    status.secondHalfStatus = "AB"
  }
  //else if ((moment(calculatedLogs.firstEntryTime).format("HH:mm:ss")) < maxInTime && calculatedLogs.total_real_time_working_hours > halfDaytime) {
  else if ((convertDateByMoment(calculatedLogs.firstEntryTime, "HH:mm:ss")) < maxInTime && totalRealTimeWorkingWithHalfDayBreak > halfDaytime) {
    const shortLeaveData = await getShortLeaveStatus(shortLeaves, calculatedLogs, maxInTime, maxOutTime, totalInTime);
    if (shortLeaveData) {
      status.attendanceStatus = "SH_SSL"
      status.firstHalfStatus = "PR"
      status.secondHalfStatus = "SSL"
    } else {
      status.attendanceStatus = "FHP"
      status.firstHalfStatus = "PR"
      status.secondHalfStatus = "AB"
      status.isEarlyExit = true;
      const earlyExitDuration = getDurationDifference(totalInTime, calculatedLogs?.totalRealWorkingTime, "HH:mm:ss");
      const workHours = Math.floor(getHours(earlyExitDuration));
      const workMinutes = Math.floor(getMinutes(earlyExitDuration)) % 60;
      const workSeconds = Math.floor(getSeconds(earlyExitDuration)) % 60 % 60;
      status.earlyExitDuration = convertTimeByMoment(`${workHours}:${workMinutes}:${workSeconds}`, 'HH:mm:ss');
    }
  }
  //else if ((moment(calculatedLogs.firstEntryTime).format("HH:mm:ss")) > maxInTime && calculatedLogs.total_real_time_working_hours > halfDaytime) {
  else if (calculatedLogs.firstEntryTime && (convertDateByMoment(calculatedLogs.firstEntryTime, "HH:mm:ss")) > maxInTime && totalRealTimeWorkingWithHalfDayBreak > halfDaytime) {
    const shortLeaveData = await getShortLeaveStatus(shortLeaves, calculatedLogs, maxInTime, maxOutTime, totalInTime);
    if (shortLeaveData) {
      status.attendanceStatus = "FH_SSL"
      status.firstHalfStatus = "SSL"
      status.secondHalfStatus = "PR"
    } else {
      status.attendanceStatus = "SHP"
      status.firstHalfStatus = "AB"
      status.secondHalfStatus = "PR"
      status.isLate = true
      const lateDuration = getDurationDifference(calculatedLogs.firstEntryTime, `${calculatedLogs?.date} ${maxInTime}`, 'HH:mm:ss');
      const workHours = Math.floor(getHours(lateDuration));
      const workMinutes = Math.floor(getMinutes(lateDuration)) % 60;
      const workSeconds = Math.floor(getSeconds(lateDuration)) % 60 % 60;
      status.lateDuration = convertTimeByMoment(`${workHours}:${workMinutes}:${workSeconds}`, 'HH:mm:ss');
    }
  }

  let presentStatus = '';
  if (status.attendanceStatus === 'PR' || status.attendanceStatus === 'FHP' || status.attendanceStatus === 'SHP') {
    presentStatus = status.attendanceStatus;
  }
  if (workingDay == "5") {
    if (isWeekend(calculatedLogs.date)) {
      status.attendanceStatus = "WO"
      status.secondHalfStatus = "WO"
      status.firstHalfStatus = "WO"
    }
} else if (workingDay == "6") {
    if (isSunday(calculatedLogs.date)) {
      status.attendanceStatus = "WO"
      status.secondHalfStatus = "WO"
      status.firstHalfStatus = "WO"
    }}
  else if (workingDay === "alternative_saturday") {
    if (isSaturday(calculatedLogs.date)) {
      if (countOfSaturday(calculatedLogs.date, alternativeSaturdayOff)) {
        status.attendanceStatus = "WO"
        status.secondHalfStatus = "WO"
        status.firstHalfStatus = "WO"
      }

    } else if (isSunday(calculatedLogs.date)) {
      status.attendanceStatus = "WO"
      status.secondHalfStatus = "WO"
      status.firstHalfStatus = "WO"
    }
  }
  if (weekOffs) {
    if (isWeekOffDayData(weekOffs, calculatedLogs.date)) {
      status.attendanceStatus = "WO"
      status.secondHalfStatus = "WO"
      status.firstHalfStatus = "WO"
    }
  }

  if (presentStatus !== '' && status.attendanceStatus === 'WO') {
    if (presentStatus === 'PR') {
      status.attendanceStatus = "WO_P"
      status.firstHalfStatus = "WO_P"
      status.secondHalfStatus = "WO_P"
    } else if (presentStatus === 'FHP') {
      status.attendanceStatus = "WO_FHP"
      status.firstHalfStatus = "WO_FHP"
      status.secondHalfStatus = "WO"
    } else if (presentStatus === 'SHP') {
      status.attendanceStatus = "WO_SHP"
      status.firstHalfStatus = "WO"
      status.secondHalfStatus = "WO_SHP"
    }
    // await autoApplyForCOff({employee_id:obj.employee_id,date:obj.attendance_date,status:status.attendanceStatus,working_hours:obj?.duration})
  }

  if (holidays?.length) {
    const holidayAvailable = holidays?.filter(item => item?.date === calculatedLogs?.date);
    if (holidayAvailable && holidayAvailable?.length) {
      if (holidayAvailable[0]?.apply_for == "Full Day") {
        status.attendanceStatus = "PH";
        status.secondHalfStatus = "PH";
        status.firstHalfStatus = "PH";
      } else if (holidayAvailable[0]?.apply_for == "First Half Day") {
        status.attendanceStatus = "FH_PH";
        status.secondHalfStatus = "PH";
        // status.firstHalfStatus = "PH"
      } else if (holidayAvailable[0]?.apply_for == "Second Half Day") {
        status.attendanceStatus = "SH_PH";
        status.secondHalfStatus = "PH";
        // status.firstHalfStatus = "PH"
      }
    }
  }
  if (presentStatus !== '' && (status.attendanceStatus === 'PH' || status.attendanceStatus === 'FH_PH' || status.attendanceStatus === 'SH_PH')) {
    if (presentStatus === 'PR' && status.attendanceStatus === 'PH') {
      status.attendanceStatus = "PH_P"
      status.firstHalfStatus = "PH_P"
      status.secondHalfStatus = "PH_P"
    } else if (presentStatus === 'FHP' && status.attendanceStatus === 'PH') {
      status.attendanceStatus = "PH_FHP"
      status.firstHalfStatus = "PH_P"
      status.secondHalfStatus = "PH"
    } else if (presentStatus === 'SHP' && status.attendanceStatus === 'PH') {
      status.attendanceStatus = "PH_SHP"
      status.firstHalfStatus = "PH"
      status.secondHalfStatus = "PH_P"
    } else if (presentStatus === 'PR' && status.attendanceStatus === 'FH_PH') {
      status.attendanceStatus = "PH_FHP"
      status.firstHalfStatus = "PH_P"
    } else if (presentStatus === 'FHP' && status.attendanceStatus === 'FH_PH') {
      status.attendanceStatus = "PH_FHP"
      status.firstHalfStatus = "PH_P"
    } else if (presentStatus === 'PR' && status.attendanceStatus === 'SH_PH') {
      status.attendanceStatus = "PH_SHP"
      status.firstHalfStatus = "PH"
      status.secondHalfStatus = "PH_P"
    } else if (presentStatus === 'SHP' && status.attendanceStatus === 'SH_PH') {
      status.attendanceStatus = "PH_SHP"
      status.secondHalfStatus = "PH_P"
    }
    // await autoApplyForCOff({employee_id:obj.employee_id,date:obj.attendance_date,status:status.attendanceStatus,working_hours:obj?.duration})
  }

  if (leaveData?.data?.length) {
    const leaveTaken = leaveData.data[0];
    if (leaveTaken.leave_status === 'Full Day') {
      if (woStatus.includes(status.attendanceStatus)) {
        status.isSandwich = true;
        status.actualStatus = status.attendanceStatus;
      }
      status.attendanceStatus = leaveTaken.leave_short_name;
      status.secondHalfStatus = leaveTaken.leave_short_name;
      status.firstHalfStatus = leaveTaken.leave_short_name;
    } else if (leaveTaken.leave_status === 'First Half Day') {
      status.attendanceStatus = `FH_${leaveTaken.leave_short_name}`;
      // status.secondHalfStatus = secondHalfStatus;
      status.firstHalfStatus = leaveTaken.leave_short_name;
    } else if (leaveTaken.leave_status === 'Second Half Day') {
      status.attendanceStatus = `SH_${leaveTaken.leave_short_name}`;
      status.secondHalfStatus = leaveTaken.leave_short_name;
      // status.firstHalfStatus = firstHalfStatus;
    }
  }
  return status;
};

const getShortLeaveStatus = async (shortLeaves, calculatedLogs, maxInTime, maxOutTime, totalInTime) => {
  if (!shortLeaves) {
    return false;
  }
  const getEmployeeLeaves = [{ duration: "01:20" }, { duration: "00:20" }, { duration: "01:00" }]; //get short leaves of employee on the basis of monthly or weekly condition
  if (getEmployeeLeaves?.length >= shortLeaves?.total_allowed_request) {
    return false;
  }
  let timeDifference = null;
  const firstEntryTime = convertDateByMoment(calculatedLogs?.firstEntryTime, 'HH:mm:ss');
  const lastExitTime = convertDateByMoment(calculatedLogs?.lastExitTime, 'HH:mm:ss')
  if (firstEntryTime > maxInTime) {
    timeDifference = getDurationDifference(maxInTime, firstEntryTime, 'HH:mm:ss');
  } else if (lastExitTime < maxOutTime) {
    timeDifference = getDurationDifference(maxOutTime, lastExitTime, 'HH:mm:ss');
  } else if (totalInTime > calculatedLogs?.totalRealWorkingTime) {
    timeDifference = getDurationDifference(calculatedLogs?.totalRealWorkingTime, totalInTime, 'HH:mm:ss');
  }
  const timeDifferenceHours = Math.floor(getHours(timeDifference)) || 0;
  const timeDifferenceMinutes = Math.floor(getMinutes(timeDifference)) % 60 || 0;
  const timeDifferenceSeconds = Math.floor(getSeconds(timeDifference)) % 60 % 60 || 0;
  const totalTimeDifference = convertTimeByMoment(`${timeDifferenceHours}:${timeDifferenceMinutes}:${timeDifferenceSeconds}`, 'HH:mm:ss');
  const maximumTimePerRequest = convertTimeByMoment(`${shortLeaves?.maximum_time_per_request}:00`, 'HH:mm:ss');
  const minimumTimePerRequest = convertTimeByMoment(`${shortLeaves?.minimum_time_per_request}:00`, 'HH:mm:ss');
  if (totalTimeDifference <= minimumTimePerRequest) {
    return false;
  } else if (totalTimeDifference <= maximumTimePerRequest) {
    return true;
  } else {
    const getTotalTimeConsumed = getEmployeeLeaves.reduce((accumulator, item) => {
      return accumulator = addInMomentTime(accumulator, item?.duration);
    }, 0);
    const totalTime = addInMomentTime(getTotalTimeConsumed, totalTimeDifference)
    const totalAllowedTime = convertTimeByMoment(`${shortLeaves?.total_allowed_time}:00`, 'HH:mm:ss');
    if (totalTime > totalAllowedTime) {
      return false;
    } else {
      //insert in leave application short leave data
      return true;
    }
  }
}

const uploadAttendanceLogs = catchAsync(async (req, res) => {
  const wb = XLSX.readFile(`${filePath}logs.csv`);
  const ws = wb.Sheets["Sheet1"];
  const data = XLSX.utils.sheet_to_json(ws);
  for (let i = 0; i < data?.length; i++) {
    await attendanceService.addRawEntryData(data[i]);
  }
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, {}, httpStatus.OK);
});

const getAttendanceDashboard = catchAsync(async (req, res) => {
  const user = getSessionData(req)
  const getStartOrEndDates = getStartOrEndDate()
  const response = getServiceResFormat()
  const attendance_date = {
    $gte: getStartOrEndDates?.startOfMonth,
    $lte: getStartOrEndDates?.endOfMonth
  }
  const getShiftDetails = await getShiftInDateRange({ employee_id: user.id, startDate: getStartOrEndDates?.startOfMonth, endDate: getStartOrEndDates.endOfMonth })
  const attendanceData = await attendanceService.getMonthlyAttendance({ emp_id: user.id, attendance_date: attendance_date })
  const getWorkingData = calculateWorkingDetails(attendanceData.status ? attendanceData.data : [])
  const getAttendanceRowEntryData = await attendanceService.getRawEntryData({ emp_id: mongoose.Types.ObjectId(user.id), punch_time: attendance_date })
  const rowEntryData = getAttendanceRowEntryData.status ? getAttendanceRowEntryData.data : []
  const total_working_days = getShiftDetails.filter(item => item.type !== "WO" && item.type !== "PH")
  const { present_count, absent_count, paid_count } = getAttendanceCount(attendanceData)
  const data = {
    attendanceCount: {
      total_working_days: total_working_days.length,
      present_count,
      absent_count,
      paid_count,
      web_count: rowEntryData.filter(item => item.device_from == "web").length,
      mobile_count: rowEntryData.filter(item => item.device_from == "mobile").length,
      biometric_count: rowEntryData.filter(item => item.device_from == "machine").length
    },
    monthlyAttendanceDetails: getWorkingData
  }
  response.data = data
  return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, response, httpStatus.OK);
})

const getAttendanceSummary = catchAsync(async (req, res) => {
  const user = getSessionData(req)
  const response = getServiceResFormat()
  const { month } = req.query;
  const getStartOrEndDates = getStartOrEndDate(month)
  const attendance_date = {
    $gte: getStartOrEndDates?.startOfMonth,
    $lte: getStartOrEndDates?.endOfMonth
  }
  const getShiftDetails = await getShiftInDateRange({ employee_id: user.id, startDate: getStartOrEndDates?.startOfMonth, endDate: getStartOrEndDates.endOfMonth })
  const attendanceData = await attendanceService.getMonthlyAttendance({ emp_id: user.id, attendance_date: attendance_date })

  let week_count = 0
  let public_holiday_count = 0;
  for (let i = 0; i < getShiftDetails.length; i++) {
    if (getShiftDetails[i].type === "WO") {
      week_count++
    }
    if (getShiftDetails[i].type === "PH") {
      public_holiday_count++
    }
  }
  const { present_count, absent_count, paid_count } = getAttendanceCount(attendanceData)
  const data = {
    present_count,
    absent_count,
    week_count,
    paid_count,
    public_holiday_count,
  }
  response.data = data
  return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, response, httpStatus.OK);
})

const getAttendanceCount = (attendanceData) => {
  let present_count = 0;
  let absent_count = 0;
  let paid_count = 0;

  let leave_without_count = 0;
  let tour_count = 0;
  let c_off = 0;

  if (attendanceData.status) {
    let get_present_absent = attendanceData.data
    for (let i = 0; i < get_present_absent.length; i++) {
      if (get_present_absent[i].first_half_status == "PR" && get_present_absent[i].second_half_status == "PR") {
        present_count++;
      }
      if (get_present_absent[i].first_half_status == "AB" && get_present_absent[i].second_half_status == "AB") {
        absent_count++;
      }
      if (get_present_absent[i].first_half_status == "PR" && get_present_absent[i].second_half_status == "AB") {
        present_count = present_count + 0.5
        absent_count = absent_count + 0.5
      }
      if (get_present_absent[i].first_half_status == "AB" && get_present_absent[i].second_half_status == "PR") {
        present_count = present_count + 0.5
        absent_count = absent_count + 0.5
      }
      if (get_present_absent[i].first_half_status == "PL" && get_present_absent[i].second_half_status == "PR") {
        present_count = present_count + 0.5
        paid_count = paid_count + 0.5
      }
      if (get_present_absent[i].first_half_status == "PR" && get_present_absent[i].second_half_status == "PL") {
        present_count = present_count + 0.5
        paid_count = paid_count + 0.5
      }
      if (get_present_absent[i].first_half_status == "PL" && get_present_absent[i].second_half_status == "AB") {
        absent_count = absent_count + 0.5
        paid_count = paid_count + 0.5
      }
      if (get_present_absent[i].first_half_status == "AB" && get_present_absent[i].second_half_status == "PL") {
        absent_count = absent_count + 0.5
        paid_count = paid_count + 0.5
      }
      if (get_present_absent[i].first_half_status == "CL" && get_present_absent[i].second_half_status == "PR") {
        present_count = present_count + 0.5
      }
      if (get_present_absent[i].first_half_status == "PR" && get_present_absent[i].second_half_status == "CL") {
        present_count = present_count + 0.5
      }
      if (get_present_absent[i].first_half_status == "CL" && get_present_absent[i].second_half_status == "AB") {
        absent_count = absent_count + 0.5
      }
      if (get_present_absent[i].first_half_status == "AB" && get_present_absent[i].second_half_status == "CL") {
        absent_count = absent_count + 0.5
      }
      if (get_present_absent[i].first_half_status == "TOD" && get_present_absent[i].second_half_status == "TOD") {
        present_count++;
      }
      if (get_present_absent[i].first_half_status == "PR" && get_present_absent[i].second_half_status == "TOD") {
        present_count = present_count++
      }
      if (get_present_absent[i].first_half_status == "TOD" && get_present_absent[i].second_half_status == "PR") {
        present_count = present_count++
      }
      if (get_present_absent[i].first_half_status == "AB" && get_present_absent[i].second_half_status == "TOD") {
        present_count = present_count + 0.5
        absent_count = absent_count + 0.5
      }
      if (get_present_absent[i].first_half_status == "TOD" && get_present_absent[i].second_half_status == "AB") {
        present_count = present_count + 0.5
        absent_count = absent_count + 0.5
      }
      if ((get_present_absent[i].first_half_status == "LW" || get_present_absent[i].first_half_status == "LWP") && get_present_absent[i].second_half_status == "PR") {
        present_count = present_count + 0.5
      }
      if (get_present_absent[i].first_half_status == "PR" && (get_present_absent[i].second_half_status == "LW" || get_present_absent[i].second_half_status == "LWP")) {
        present_count = present_count + 0.5
      }
      if ((get_present_absent[i].first_half_status == "LW" || get_present_absent[i].first_half_status == "LWP") && get_present_absent[i].second_half_status == "AB") {
        absent_count = absent_count + 0.5
      }
      if (get_present_absent[i].first_half_status == "AB" && (get_present_absent[i].second_half_status == "LW" || get_present_absent[i].second_half_status == "LWP")) {
        absent_count = absent_count + 0.5
      }
      if (get_present_absent[i].first_half_status == "CO" && get_present_absent[i].second_half_status == "PR") {
        present_count = present_count + 0.5
      }
      if (get_present_absent[i].first_half_status == "PR" && get_present_absent[i].second_half_status == "CO") {
        present_count = present_count + 0.5
      }
      if (get_present_absent[i].first_half_status == "CO" && get_present_absent[i].second_half_status == "AB") {
        absent_count = absent_count + 0.5
      }
      if (get_present_absent[i].first_half_status == "AB" && get_present_absent[i].second_half_status == "CO") {
        absent_count = absent_count + 0.5
      }
      if (get_present_absent[i].first_half_status == "PL" && get_present_absent[i].second_half_status == "PL") {
        paid_count = paid_count + 1
      }
    }
  }
  return { absent_count, paid_count, present_count }
}


const getMonthlyAttendance = catchAsync(async (req, res) => {
  const user = getSessionData(req)
  const response = getServiceResFormat()
  const { month } = req.query
  const getStartOrEndDates = getStartOrEndDate(month)
  const attendance_date = {
    $gte: getStartOrEndDates?.startOfMonth,
    $lte: getStartOrEndDates?.endOfMonth
  }
  let getAllLeaveType = await leaveService.getLeaveTypeList({is_active:true});
  getAllLeaveType = getAllLeaveType.status ? getAllLeaveType.data : []
  const getShiftDetails = await getShiftInDateRange({ employee_id: user.id, startDate: getStartOrEndDates?.startOfMonth, endDate: getStartOrEndDates.endOfMonth })
  const responseData = await attendanceService.getMonthlyAttendance({ emp_id: user.id, attendance_date: attendance_date })
  const attendanceData = responseData?.status ? responseData.data : [];
  const mergedData = getShiftDetails.map(shift => {
    const attendance = attendanceData.find(
      item => item.attendance_date === shift.date
    );

    if (attendance) {
      return {
        ...attendance.toObject(),
        status:checkAttendanceWithStatus(attendance.toObject().attendance_status,getAllLeaveType,attendance?.first_half_status,attendance?.second_half_status),
        shift_type: shift.type,
        shift_start_time: shift.shift_start_time,
        shift_end_time: shift.shift_end_time,
        date:shift.date,
      };
    } else {
      return {
        attendance_date: shift.date,
        date:shift.date,
        shift_type: shift.type,
        status:checkAttendanceWithStatus(null,getAllLeaveType,null,null,shift.type,shift.color),
        first_half_status: null,
        second_half_status: null,
        attendance_status: null,
        first_check_in_time: null,
        last_check_out_time: null,
        total_working_hours: '00:00:00',
        total_break_time: '00:00:00',
        total_overtime_hours: '00:00:00',
        duration: '00:00:00',
      };
    }
  });
  response.data = mergedData
  return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, response, httpStatus.OK);
})

const getShiftInDateRange = async (params) => {
  const { employee_id, startDate, endDate } = params
  const defaultShiftData = await shiftManagementService.getDefaultShiftData();
  if (!defaultShiftData?.status) {
    throw new ApiError(httpStatus.BAD_REQUEST, messages.alert.DEFAULT_SHIFT_NA);
  }
  let getActiveEmployees = await employeeService.queryUserForAttendance({ account_status: 'active', _id: mongoose.Types.ObjectId(employee_id) });
  let employeeData = getActiveEmployees?.status ? getActiveEmployees.data : [];
  return getShiftDetailsDateWise({ employeeData: employeeData, defaultShiftData: defaultShiftData?.data, startDate: startDate, endDate: endDate })
}

const applyAttendanceCorrection = catchAsync(async (req, res) => {
  const user = getSessionData(req);
  req.body['created_by'] = user?.id;
  let approvalData = [];
  let getApprovalHierarchy = await approvalManagementService.querySingleHierarchy({ type: 'attendance_correction', department_id: user?.department_id, designation_id: user?.designation_id, position_id: user?.position_id });
  if (getApprovalHierarchy?.status) {
    approvalData = getApprovalHierarchy?.data;
  } else {
    getApprovalHierarchy = await approvalManagementService.querySingleHierarchy({ type: 'attendance_correction', department_id: user?.department_id, designation_id: user?.designation_id });
    if (getApprovalHierarchy?.status) {
      approvalData = getApprovalHierarchy?.data;
    } else {
      getApprovalHierarchy = await approvalManagementService.querySingleHierarchy({ type: 'attendance_correction', department_id: user?.department_id });
      if (getApprovalHierarchy?.status) {
        approvalData = getApprovalHierarchy?.data;
      } else {
        getApprovalHierarchy = await approvalManagementService.querySingleHierarchy({ type: 'attendance_correction', department_id: null });
        if (getApprovalHierarchy?.status) {
          approvalData = getApprovalHierarchy?.data;
        } else {
          return errorResponse(req, res, messages.alert.LEAVE_HIERARCHY_ERR, httpStatus.BAD_REQUEST);
        }
      }
    }
  }
  const attendanceCorrection = await attendanceService.attendanceCorrection(req.body);
  if (attendanceCorrection?.status) {
    let attendanceCorrectionData = attendanceCorrection?.data
    let approverData = {
      "type": "attendance_correction",
      "collection_id": attendanceCorrectionData?._id || '',
      "approver_id": [],
    }
    approvalData.forEach(async (data) => {
      let approverId = [];
      if (data?.id) {
        approverId = [mongoose.Types.ObjectId(data?.id)];
      } else {
        const getRoleData = await roleService.querySingleRoleData({ _id: data?.role_id });
        if (getRoleData.data?.short_name == 'manager' || getRoleData.data?.short_name == 'hod') {
          let userData = await employeeService.queryUserByFilter({ "_id": mongoose.Types.ObjectId(user?.id) }, {});
          if (userData?.status) {
            data = userData?.data[0];
          }
          approverId = getRoleData.data?.short_name == 'manager' ? [mongoose.Types.ObjectId(data?.reported_to)] : [mongoose.Types.ObjectId(user?.hod_id)];
        } else {
          let userData = await employeeService.queryUserByFilter({ "role_id": data?.role_id }, {});
          if (userData?.status) {
            data = userData?.data;
            for (let j = 0; j < data?.length; j++) {
              approverId.push(mongoose.Types.ObjectId(data[j]?._id));
            }
          }
        }}
        if (approverId.length) {
          approverData["approver_id"] = approverId;
          await approverService.addApproverData(approverData)
      }
    })
  }
  return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, attendanceCorrection, httpStatus.OK);
})

const getAttendanceCorrectionRequest = catchAsync(async (req, res) => {
  const user = getSessionData(req);
  const { request_for, parameter, status, limit, page } = req.query;
  const getData = await attendanceService.getAttendanceCorrectionRequest({ request_for, parameter, status, limit, page, user },{ limit, page,});
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getData, httpStatus.OK);
})

const getAttendanceCorrectionApproval = catchAsync(async (req, res) => {
  const user = getSessionData(req)
  const { request_for, parameter, status, limit, page } = req.query
  const getData = await attendanceService.getAttendanceCorrectionApproval({ approver_id: user?.id, type: parameter, action_type: status == '' ? 'pending' : status }, { limit, page, })
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getData, httpStatus.OK);
})

const approveRejectAttendanceCorrection = catchAsync(async (req, res) => {
  const user = getSessionData(req)
  const { correction_id, status, comment } = req.body
  const approverData = await approverService.queryApproverData({ _id: mongoose.Types.ObjectId(correction_id), action_type: { $in: ['approve', 'reject'] } });
  if (approverData?.status) {
    return errorResponse(req, res, messages.alert.LEAVE_ACTION, httpStatus.BAD_REQUEST);
  }

  const attendanceCorrectionData = await approverService.updateApproverData({ _id: mongoose.Types.ObjectId(correction_id) }, {
    $set: {
      comment: comment || '',
      action_type: status,
      action_by: user?.id,
      action_date: new Date(),
    }
  });
  let updateAttendance = null
  const approval_pending = await approverService.getApprovalPendingApprovedCount({collection_id:attendanceCorrectionData?.data?.collection_id})
  if (status == "approve") {
    if(approval_pending?.status && approval_pending?.data?.approval_pending === 0){
    const correctionDetails = await attendanceService.correctionDetail({ _id: mongoose.Types.ObjectId(correction_id) })
    let obj = {}
    if (correctionDetails.status) {
      // if(correctionDetails?.data[0]?.approver_details?.find(item=>item?.action_type === 'approve')){
      let shiftDetails = await getShiftDetailEmployeeWise(correctionDetails?.data[0]?.emp_id)
      const correctionLogsDetails = correctionDetails?.data[0];
      let attendanceDate = correctionLogsDetails?.date || '';
      let firstCheckTime = correctionLogsDetails?.correction_check_in_time || '';
      let lastCheckTime = correctionLogsDetails?.correction_check_out_time || '';
      const employeeLogs = [];

      if (correctionDetails?.data?.attendance_logs?.length) {
        correctionDetails?.data?.attendance_logs?.map(data => {
          employeeLogs.push({
            punch_time: data.punch_time,
            log_type: data.log_type
          });
        })
      } else {
        employeeLogs.push({
          punch_time: firstCheckTime,
          log_type: 'IN'
        });
        employeeLogs.push({
          punch_time: lastCheckTime,
          log_type: 'OUT'
        });
      }
      const calculatedLogs = calculateAttendanceLogTime(employeeLogs, "IN/OUT", "", true, attendanceDate);
      obj['duration'] = calculatedLogs?.totalWorkingTime || '';
      obj['total_working_hours'] = calculatedLogs?.totalRealWorkingTime || '';
      obj['total_break_time'] = calculatedLogs?.totalBreakTime || '';
      obj['first_check_in_time'] = calculatedLogs?.firstEntryTime || '';
      obj['last_check_out_time'] = calculatedLogs?.lastExitTime || '';
      const calculateStatus = calculateAttendanceStatus({ shiftDetails: shiftDetails, calculatedLogs })
      obj['first_half_status'] = calculateStatus?.firstHalfStatus;
      obj['second_half_status'] = calculateStatus?.secondHalfStatus;
      obj['attendance_status'] = calculateStatus?.attendanceStatus;

      updateAttendance = await attendanceService.updateAttendance({ emp_id: mongoose.Types.ObjectId(correctionDetails?.data[0]?.emp_id), attendance_date: attendanceDate }, obj)
  }
  }}
  return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, attendanceCorrectionData, httpStatus.OK);
})

const calculateAttendanceStatus = (params) => {
  const { shiftDetails, calculatedLogs } = params
  const status = {
    attendanceStatus: 'AB',
    firstHalfStatus: 'AB',
    secondHalfStatus: 'AB',
  }
  let shiftEndTimes = convertDateByMoments(shiftDetails.shift_start_time, 'HH:mm', "HH:mm:ss");
  let shiftStartTimes = convertDateByMoments(shiftDetails.shift_end_time, "HH:mm", "HH:mm:ss");

  let difference = getDurationDifference(shiftStartTimes, shiftEndTimes, "HH:mm:ss", shiftDetails.shift_type);   //night type is sent to get the proper time
  let breakEndTime = convertTimeByMoment(`${shiftDetails?.break_start_time}:00`, 'HH:mm:ss');
  let breakStartTime = convertTimeByMoment(`${shiftDetails?.break_end_time}:00`, 'HH:mm:ss');
  let totalBreakTime = getDurationDifference(breakEndTime, breakStartTime, "HH:mm:ss");
  const workHours = Math.floor(getHours(difference)) || 0;
  const workMinutes = Math.floor(getMinutes(difference)) % 60 || 0;
  const workSeconds = Math.floor(getSeconds(difference)) % 60 % 60 || 0;
  const breakHours = Math.floor(getHours(totalBreakTime)) || 0;
  const breakMinutes = Math.floor(getMinutes(totalBreakTime)) % 60 || 0;
  const breakSeconds = Math.floor(getSeconds(totalBreakTime)) % 60 % 60 || 0;
  let totalInTime = getDurationDifference(`${workHours}:${workMinutes}:${workSeconds}`, `${breakHours}:${breakMinutes}:${breakSeconds}`, "HH:mm:ss");
  let totalInHours = Math.floor(getHours(totalInTime)) || 0;
  let totalInMin = Math.floor(getMinutes(totalInTime)) % 60 || 0;
  let totalInSec = Math.floor(getSeconds(totalInTime)) % 60 % 60 || 0;
  totalInTime = convertTimeByMoment(`${totalInHours}:${totalInMin}:${totalInSec}`, 'HH:mm:ss');
  difference = parseInt(getMinutes(difference));
  totalBreakTime = parseInt(getMinutes(totalBreakTime));
  difference = difference - totalBreakTime;
  let differnceInHours = moment.utc().startOf('day').add(difference, 'minutes').format('HH:mm:ss')
  let halfDaytime = convertTimeByMoment(`${shiftDetails?.half_day_policy_time}:00`, 'hh:mm:ss');
  let graceStartHours = Math.floor(getHours(shiftDetails.grace_start_time)) || 0;
  let graceStartMin = Math.floor(getMinutes(shiftDetails.grace_start_time)) % 60 || 0;
  let graceEndHours = Math.floor(getHours(shiftDetails.grace_end_time)) || 0;
  let graceEndMin = Math.floor(getMinutes(shiftDetails.grace_end_time)) % 60 || 0;
  let maxInTime = addInMomentTime(shiftStartTimes, graceStartHours, 'hours', "HH:mm:ss");
  maxInTime = addInMomentTime(maxInTime, graceStartMin, 'minutes', "HH:mm:ss");
  let maxOutTime = subtractFromMomentTime(shiftEndTimes, graceEndHours, 'hours', "HH:mm:ss");
  maxOutTime = subtractFromMomentTime(maxOutTime, graceEndMin, 'minutes', "HH:mm:ss");
  let halfDayBreak = Math.ceil(totalBreakTime / 2);
  let totalRealTimeWorkingWithHalfDayBreak = addInMomentDate(`${calculatedLogs?.date} ${calculatedLogs?.totalRealWorkingTime}`, halfDayBreak, 'minutes', 'HH:mm:ss')
  if (calculatedLogs?.totalRealWorkingTime >= totalInTime && convertDateByMoment(calculatedLogs.firstEntryTime, "HH:mm:ss") <= maxInTime) {
    status.attendanceStatus = "PR"
    status.firstHalfStatus = "PR"
    status.secondHalfStatus = "PR"

  } else if (totalRealTimeWorkingWithHalfDayBreak < halfDaytime) {
    status.attendanceStatus = "AB"
    status.firstHalfStatus = "AB"
    status.secondHalfStatus = "AB"
  }
  else if ((convertDateByMoment(calculatedLogs.firstEntryTime, "HH:mm:ss")) < maxInTime && totalRealTimeWorkingWithHalfDayBreak > halfDaytime) {
    status.attendanceStatus = "FHP"
    status.firstHalfStatus = "PR"
    status.secondHalfStatus = "AB"
  }
  else if (calculatedLogs.firstEntryTime && (convertDateByMoment(calculatedLogs.firstEntryTime, "HH:mm:ss")) > maxInTime && totalRealTimeWorkingWithHalfDayBreak > halfDaytime) {
    status.attendanceStatus = "SHP"
    status.firstHalfStatus = "AB"
    status.secondHalfStatus = "PR"

  }
  return status
}

const getAttendanceLogs = catchAsync(async (req, res) => {
  const BaseUrl = getBaseUrl()
  const user = getSessionData(req)
  const { date } = req.query
  const response = getServiceResFormat()
  const emp_id = req.query.emp_id ? req.query.emp_id : user.id
  let punchData = {
    $gte: moment(date).format("YYYY-MM-DD"),
    $lt: moment(date).add(1, "day").format("YYYY-MM-DD")
  }
  const getAttendanceRawData = await attendanceService.getAttendanceLogs({ emp_id: mongoose.Types.ObjectId(emp_id), punch_time: punchData })
  if (getAttendanceRawData.status) {
    getAttendanceRawData?.data.map(item => {
      if (item.image_type === 'file') {
        item.capture_file = `${BaseUrl}/attendance_image/${item.capture_file}`;
      }
      if (item.punch_time && item.punch_time.includes(' ')) {
        const [datePart, timePart] = item.punch_time.split(' ');
        item['punch_date'] = datePart;
        item['punch_time'] = timePart;
      }

    });
  }
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getAttendanceRawData, httpStatus.OK);
})

const updateAttendanceLog = catchAsync(async (req, res) => {
  const { logs, date } = req.body
  const user = getSessionData(req)
  const response = getServiceResFormat()
  const getAttendanceLog = await attendanceService.getRawEntryData({ emp_id: mongoose.Types.ObjectId(user?.id), punch_time: { $regex: new RegExp(date) } });
  if (getAttendanceLog.status) {
    const updateLogs = calculateAttendanceLogTime(logs, "IN/OUT", "", false, moment(date).format("YYYY-MM-DD"));
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, updateLogs, httpStatus.OK);
  }
});

const getSelfAttendance = catchAsync(async(req, res)=>{
  const user = getSessionData(req);
  const {emp_id,start_date, end_date} = req.query;
  const employee_id = emp_id ? emp_id : user.id;
  let attendance_date = {
    $gte: convertDateByMoment(start_date,"YYYY-MM-DD") || '',
    $lte: convertDateByMoment(end_date,"YYYY-MM-DD") || ''
  }
  const getSelfAttendanceData = await attendanceService.getSelfAttendance({emp_id:mongoose.Types.ObjectId(employee_id),attendance_date},req.query);
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA,getSelfAttendanceData, httpStatus.OK);
});

const getMyTeamAttendance = catchAsync(async(req, res)=>{
  const user = getSessionData(req);
  const employee_id = user.id;
  const {start_date,end_date} = req.query
  let attendance_date = {
    $gte: convertDateByMoment(start_date,"YYYY-MM-DD") || '',
    $lte: convertDateByMoment(end_date,"YYYY-MM-DD") || ''
  }
  const getEmployeeAttendance  = await attendanceService.getEmployeeAttendance({attendance_date:attendance_date})
  const getSelfAttendanceData = await attendanceService.getMyTeamAttendance({reported_to:mongoose.Types.ObjectId(employee_id),start_date,end_date},req.query);
  getSelfAttendanceData?.data?.data?.map(item=>{
    item.total_working_days = secondsToTime(getEmployeeAttendance.status && getEmployeeAttendance?.data.filter(record => record?.emp_id?.toString() == item?._id?.toString() && record.total_working_hours !== '00:00:00' && record.total_working_hours !== null)
    .reduce((sum, record) => sum + timeToSeconds(record.total_working_hours), 0))
  })
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA,getSelfAttendanceData, httpStatus.OK);
});

const getAllTeamAttendance = catchAsync(async(req, res)=>{
  const user = getSessionData(req);
  const employee_id = user.id;
  const getAllTeamAttendance = await attendanceService.getAllTeamAttendance({},req.query);
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA,getAllTeamAttendance, httpStatus.OK);
})
const getDetailedReport = (data)=>{
  return data.map(item =>{
    item.emp_final_attendance_status = checkAttendanceStatus(item)
    return item
  })
}

const attendanceReport = catchAsync(async(req,res)=>{
  const user = getSessionData(req);
  const baseUrl = getBaseUrl();
  const response = getServiceResFormat();
  const {start_date, end_date, report_type,employees_ids,department_ids} = req.body;
  let employeeIds = employees_ids == undefined ? []: employees_ids
  let FileName;
  let workSheet;
  let getData;

  const reportData = await attendanceService.attendanceReport({start_date,end_date,employeeIds})
  if(report_type === "detailed_report"){
    getData = getDetailedReport(reportData.status ? reportData.data: [])
    workSheet = XLSX.utils.json_to_sheet(getData);
    FileName = `Attendance_detailed_report.xlsx`
  }else if(report_type === "muster_roll_report"){

  }
  if (getData) {
    const workBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, `${start_date}-${end_date}`);
    XLSX.write(workBook, { bookType: 'xlsx', type: "buffer" });
    XLSX.write(workBook, { bookType: "xlsx", type: "binary" });
    XLSX.writeFile(workBook, `./public/emp_attendance/${FileName}`)
    let data = {
        filePath: `${baseUrl}/emp_attendance/${FileName}`
    };
    response.data = data
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA,response, httpStatus.OK);
}
return errorResponse(req, res, messages.alert.SERVER_MSG, httpStatus.BAD_REQUEST)
})

const autoApplyForCOff = async(params)=>{
    const {employee_id, date, status, working_hours} = params
    let coffStatus = (status == 'WO' || status == 'PH')  ? 'Full Day' : (status == 'WO_FHP' || status == 'PH_FHP') ? 'First Half Day' : 'Second Half Day'
    let user = await employeeService.queryUserByFilter({_id:mongoose.Types.ObjectId(employee_id)})
    user = user.status ? user.data[0] : []
    let approvalData = [];
    let getApprovalHierarchy = await approvalManagementService.querySingleHierarchy({ type: 'C_off', department_id: user?.department_id, designation_id: user?.designation_id, position_id: user?.position_id });
    if (getApprovalHierarchy?.status) {
      approvalData = getApprovalHierarchy?.data;
    } else {
      getApprovalHierarchy = await approvalManagementService.querySingleHierarchy({ type: 'C_off', department_id: user?.department_id, designation_id: user?.designation_id });
      if (getApprovalHierarchy?.status) {
        approvalData = getApprovalHierarchy?.data;
      } else {
        getApprovalHierarchy = await approvalManagementService.querySingleHierarchy({ type: 'C_off', department_id: user?.department_id });
        if (getApprovalHierarchy?.status) {
          approvalData = getApprovalHierarchy?.data;
        } else {
          getApprovalHierarchy = await approvalManagementService.querySingleHierarchy({ type: 'C_off', department_id: null });
          if (getApprovalHierarchy?.status) {
            approvalData = getApprovalHierarchy?.data;
          } else {
            return errorResponse(req, res, messages.alert.LEAVE_HIERARCHY_ERR, httpStatus.BAD_REQUEST);
          }
        }
      }
    }
    const applyCOff = await attendanceService.compOffApplication({emp_id:mongoose.Types.ObjectId(employee_id),date,status:coffStatus,working_hours,reason:'Auto Apply'});
    if (applyCOff?.status) {
      let applyCOffData = applyCOff?.data
      let approverData = {
        "type": "attendance_correction",
        "collection_id": applyCOffData?._id || '',
        "approver_id": [],
      }
      approvalData.forEach(async (data) => {
        let approverId = [];
        if (data?.id) {
          approverId = [data?.id];
        } else {
          const getRoleData = await roleService.querySingleRoleData({ _id: data?.role_id });
          if (getRoleData.data?.short_name == 'manager' || getRoleData.data?.short_name == 'hod') {
            let userData = await employeeService.queryUserByFilter({ "_id": mongoose.Types.ObjectId(user?.id) }, {});
            if (userData?.status) {
              data = userData?.data[0];
            }
            approverId = getRoleData.data?.short_name == 'manager' ? [data?.reported_to] : [user?.hod_id];
          } else {
            let userData = await employeeService.queryUserByFilter({ "role_id": data?.role_id }, {});
            if (userData?.status) {
              data = userData?.data;
              for (let j = 0; j < data?.length; j++) {
                approverId.push(data[j]?._id);
              }
            }
          }}
          if (approverId.length) {
            approverData["approver_id"] = approverId;
            await approverService.addApproverData(approverData)
        }
      })
    }  
}

const getCompOffApproval = catchAsync(async (req, res) => {
  const user = getSessionData(req)
  const { request_for, parameter, status, limit, page } = req.query
  const getData = await attendanceService.getCompOffApproval({ approver_id: user?.id, type: parameter, action_type: status == '' ? 'pending' : status }, { limit, page, })
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getData, httpStatus.OK);
})

const approveRejectCompOff = catchAsync(async (req, res) => {
  const user = getSessionData(req)
  const { correction_id, status, comment } = req.body
  const approverData = await approverService.queryApproverData({ _id: mongoose.Types.ObjectId(correction_id), action_type: { $in: ['approve', 'reject'] } });
  if (approverData?.status) {
    return errorResponse(req, res, messages.alert.LEAVE_ACTION, httpStatus.BAD_REQUEST);
  }
  const approvalData = await approverService.updateApproverData({ _id: mongoose.Types.ObjectId(correction_id) }, {
    $set: {
      comment: comment || '',
      action_type: status,
      action_by: user?.id,
      action_date: new Date(),
    }
  });
  const getCompOffDetails = await attendanceService.getCompOffDetails({_id:correction_id})
  const approval_pending = await approverService.getApprovalPendingApprovedCount({ collection_id: correction_id })
  if (status == "approve") {
    if (approval_pending?.status && approval_pending?.data?.approval_pending === 0) {
      await leaveService.creditDebitLeave({ emp_id: getCompOffDetails?.data[0]?.emp_id, leave_type_id: getCompOffDetails?.data[0]?.leave_type, added_from_value: mongoose.Types.ObjectId(user?.id) || '', leave_value: getCompOffDetails?.data[0]?.status === 'Full Day' ? 1 : 0.5, status: 'CR', added_from: 'leave' })
    }
  }
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getData, httpStatus.OK);

});

const getApprovalHierarchy = async()=>{
  
}

const applyTours = catchAsync(async(req, res)=>{
  console.log("Hello")
  const user = getSessionData(req);
  const {destination,reason,tourDetails} = req.body

  let approvalData = [];
  let getApprovalHierarchy = await approvalManagementService.querySingleHierarchy({ type:'tour', department_id: user?.department_id, designation_id: user?.designation_id, position_id: user?.position_id });
  if (getApprovalHierarchy?.status) {
    approvalData = getApprovalHierarchy?.data;
  } else {
    getApprovalHierarchy = await approvalManagementService.querySingleHierarchy({ type:'tour', department_id: user?.department_id, designation_id: user?.designation_id });
    if (getApprovalHierarchy?.status) {
      approvalData = getApprovalHierarchy?.data;
    } else {
      getApprovalHierarchy = await approvalManagementService.querySingleHierarchy({ type:'tour', department_id: user?.department_id });
      if (getApprovalHierarchy?.status) {
        approvalData = getApprovalHierarchy?.data;
      } else {
        getApprovalHierarchy = await approvalManagementService.querySingleHierarchy({ type:'tour', department_id: null });
        if (getApprovalHierarchy?.status) {
          approvalData = getApprovalHierarchy?.data;
        } else {
          return errorResponse(req, res, messages.alert.LEAVE_HIERARCHY_ERR, httpStatus.BAD_REQUEST);
        }
      }
    }
  }
  let tour_applied_from =  tourDetails[0].tour_date
  let tour_applied_to = tourDetails[tourDetails.length - 1].tour_date
  let no_of_days = tourDetails.length
  const applyTours = await attendanceService.tourApplication({employee_id:mongoose.Types.ObjectId(employee_id),tour_applied_from,tour_applied_to,no_of_days,visiting_destination:destination,reason});
    if (applyTours?.status) {
      let applyToursData = applyTours?.data
      let approverData = {
        "type": "attendance_correction",
        "collection_id": applyToursData?._id || '',
        "approver_id": [],
      }
      approvalData.forEach(async (data) => {
        let approverId = [];
        if (data?.id) {
          approverId = [data?.id];
        } else {
          const getRoleData = await roleService.querySingleRoleData({ _id: data?.role_id });
          if (getRoleData.data?.short_name == 'manager' || getRoleData.data?.short_name == 'hod') {
            let userData = await employeeService.queryUserByFilter({ "_id": mongoose.Types.ObjectId(user?.id) }, {});
            if (userData?.status) {
              data = userData?.data[0];
            }
            approverId = getRoleData.data?.short_name == 'manager' ? [data?.reported_to] : [user?.hod_id];
          } else {
            let userData = await employeeService.queryUserByFilter({ "role_id": data?.role_id }, {});
            if (userData?.status) {
              data = userData?.data;
              for (let j = 0; j < data?.length; j++) {
                approverId.push(data[j]?._id);
              }
            }
          }}
          if (approverId.length) {
            approverData["approver_id"] = approverId;
            await approverService.addApproverData(approverData)
        }
      })
    }  
  return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, applyTours, httpStatus.OK);
});

const getTours = catchAsync(async(req, res)=>{
  const user = getSessionData(req)
  const {parameter, status, limit, page } = req.query
  const getData = await attendanceService.getTourApproval({ approver_id: user?.id, type: parameter, action_type: status == '' ? 'pending' : status }, { limit, page, })
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getData, httpStatus.OK);

});

const approveRejectTours = catchAsync(async (req, res) => {

  const user = getSessionData(req)
  const { correction_id, status, comment } = req.body
  const approverData = await approverService.queryApproverData({ _id: mongoose.Types.ObjectId(correction_id), action_type: { $in: ['approve', 'reject'] } });
  if (approverData?.status) {
    return errorResponse(req, res, messages.alert.LEAVE_ACTION, httpStatus.BAD_REQUEST);
  }
  const approvalData = await approverService.updateApproverData({ _id: mongoose.Types.ObjectId(correction_id) }, {
    $set: {
      comment: comment || '',
      action_type: status,
      action_by: user?.id,
      action_date: new Date(),
    }
  });
  const getCompOffDetails = await attendanceService.getTourDetails({ _id: correction_id })
  const approval_pending = await approverService.getApprovalPendingApprovedCount({ collection_id: correction_id })
  if (status == "approve") {
    if (approval_pending?.status && approval_pending?.data?.approval_pending === 0) {
      if (getCompOffDetails.status) {
        const getDateBetweenDateRange = getDatesBetweenDateRange(getCompOffDetails?.data[0]?.tour_applied_from, getCompOffDetails?.data[0]?.tour_applied_to)
        for (let i = 0; i < getDateBetweenDateRange.length; i++) {
          let date = getDateBetweenDateRange[i].date
          const getAttendanceData = await attendanceService.getMonthlyAttendance({ emp_id: getCompOffDetails?.data[0]?.employee_id, attendance_date: date })
          let obj = {
            first_half_status: "TOD",
            second_half_status: "TOD",
            attendance_status: "TOD",
            day_of_week: moment(date).format('dddd'),
            total_working_hours: "00:00:00",
            total_break_time: "00:00:00",
            duration: "00:00:00"
          }
          if (getAttendanceData.status) {
            let updateAttendance = await attendanceService.updateAttendance({ emp_id: getCompOffDetails?.data[0]?.employee_id, attendance_date: date }, obj)
          } else {
            obj['emp_id'] = getCompOffDetails?.data[0]?.employee_id;
            obj['attendance_date'] = date
            let addAttendance = await attendanceService.addAttendance(obj)
          }
        }
      }

    }
  }
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getData, httpStatus.OK);
});


const getCorrectionNotification = catchAsync(async (req, res) => {
  const response = getServiceResFormat()
  const user = getSessionData(req);
  let getClientSetting = await clientService.getAllClient({ code: "QD100",is_active:true });
  getClientSetting = getClientSetting.status ? getClientSetting.data : []
  let attendanceCount = getClientSetting[0]?.attendance_correction_days || 7

  let current_date = currentDate();
  let lastMonth = subtractFromMomentDate(current_date, '1', "month", "YYYY-MM-DD")
  let lastOfMonth = moment(lastMonth).endOf('month').format("YYYY-MM-DD");
  let startOfMonth = moment().startOf('month').format("YYYY-MM-DD");
  let endOfMonth = moment().endOf('month').format("YYYY-MM-DD");
  let before7Days = moment(current_date).subtract(attendanceCount, 'days').format("YYYY-MM-DD");
  let startAndEndDateBetween = getDatesBetweenDateRange(before7Days, current_date)
  let combineDateAfter = startAndEndDateBetween.reduce((acc, curr) => [...acc, curr.date], [])

  let name = user.name;
  let message;

  if (current_date === startOfMonth) {
    message = `<p><b>Hey ${name}, your attendance correction till <strong style="color: red;"><em>${moment(lastOfMonth).format("DD MMM YYYY")}</em></strong> will get locked by today, please check your calendar and do corrections if required before <strong style="color: red;"><em>5 PM</em></strong>. If not done, it may impact your <strong style="color: red;"><em>salary due by 10th of next month</em></strong>.</b></p>`
  }
  else if (current_date === endOfMonth) {
    message = `<p><b>Hey ${name}, your attendance correction till <strong style="color: red;"><em>${moment(endOfMonth).format("DD MMM YYYY")}</em></strong> will get locked by tomorrow <strong style="color: red;"><em>5 PM</em></strong>, please check your calendar and do corrections if required.  If not done, it may impact your <strong style="color: red;"><em>salary due by 10th of next month</em></strong>.</b></p>`
  }
  else if (moment(combineDateAfter[0]).format("YYYY-MM") !== moment(current_date).format("YYYY-MM")) {
    message = `<p><b>Hey ${name},please remember to update your attendance correction, leave, or any tours on a daily basis. If not done, it may impact your <strong style="color: red;"><em>salary due by 10th of next month</em></strong>.</b></p>`
  }
  else {
    message = `<p><b>Hey ${name}, your attendance correction of <strong style="color: red;"><em>${moment(combineDateAfter[0]).format("DD MMM YYYY")}</em></strong> will get locked by today, please check your calendar and do corrections if required before <strong style="color: red;"><em>12 AM</em></strong>. If not done, it may impact your <strong style="color: red;"><em>salary due by 10th of next month</em></strong>.</b></p>`
  }

  let obj = {
    "correction_allow_dates": combineDateAfter,
    "message": message
  }
  response.data = obj
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK);

})

const attendanceLock = catchAsync(async(req, res)=>{
  const user = getSessionData(req);
  const {year, month} = req.body
  req.body["lock_by"] = user.id
  const checkLockMonth = await attendanceService.getAttendanceLock({month,year})
  if(checkLockMonth.status){
    return errorResponse(req, res, messages.alert.ATTENDANCE_LOCK_ERROR, httpStatus.BAD_REQUEST)
  }
  const addAttendanceLock = await attendanceService.createAttendanceLock(req.body)
  return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, addAttendanceLock, httpStatus.OK)
})

const getAttendanceLock = catchAsync(async(req, res)=>{
  const getAttendanceLock = await attendanceService.getAllAttendanceLock({},req.query);
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getAttendanceLock, httpStatus.OK);
})

const updateAttendanceLock = catchAsync(async(req, res)=>{
  
  const updateAttendanceLock = await attendanceService.updateAttendanceLock({_id:mongoose.Types.ObjectId(req.body?._id)}, req.body);
  return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, updateAttendanceLock, httpStatus.OK);

})

module.exports = {
  checkInCheckOut,
  calculateAttendance,
  getCheckInCheckOut,
  getAttendanceSummary,
  uploadAttendanceLogs,
  getMonthlyAttendance,
  getAttendanceDashboard,
  applyAttendanceCorrection,
  getAttendanceCorrectionRequest,
  getAttendanceCorrectionApproval,
  approveRejectAttendanceCorrection,
  updateAttendanceLog,
  getAttendanceLogs,
  getShiftInDateRange,
  calculateAttendanceLogTime,
  calculateAttendanceStatus,
  getSelfAttendance,
  getMyTeamAttendance,
  getAllTeamAttendance,
  attendanceReport,
  getCompOffApproval,
  approveRejectCompOff,
  applyTours,
  getTours,
  approveRejectTours,
  calculateAttendanceFunction,
  getCorrectionNotification,
  attendanceLock,
  getAttendanceLock,
  updateAttendanceLock
};