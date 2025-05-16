const CryptoJS = require('crypto-js');
const moment = require('moment');
const fs = require("fs");
const path = require('path');
const pathTemplate = path.join(__dirname, '../../../views/');
const {checkAttendanceWithAllStatus,styles} = require('../../../config/constants')
const { getDatesBetweenDateRange, isSaturday, countOfSaturday, isSunday, isWeekOffDayData, addInMomentDate, subtractFromMomentDate, convertDateByMoment, moments } = require('./dateTimeHelper');
const { config } = require('bluebird');
const { AsyncLocalStorage } = require('async_hooks');

const asyncLocalStorage = new AsyncLocalStorage();



const getSessionData = (req) => {
  const data = req?.session?.authData?.user;
  return data;
}

const getServiceResFormat = () => {
  return { status: true, data: null }
}

const decryptValue = (cipherText, secret = '123456') => {
  const secretHex = stringToHash(secret);
  const bytes = CryptoJS.AES.decrypt(cipherText, secretHex);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
};

const stringToHash = secret => {
  return CryptoJS.SHA256(secret).toString();
};

const getFindPagination = (options, totalRecords) => {
  options['limit'] = options && options['limit'] ? parseInt(options['limit']) : 10;
  const totalPages = Math.ceil(totalRecords / options['limit']);
  const start = options && options?.page ? (parseInt(options?.page) - 1) * parseInt(options?.limit) : 0;
const limits = options && options?.limit ? { skip: start, limit: parseInt(options?.limit) } : { skip: start, limit: 10 };
  return { limits, totalPages };
};

const getAggregatePagination = (options, totalRecords) => {
  const limit = options && options?.limit ? parseInt(options?.limit) : 10;
  const totalPages = Math.ceil(totalRecords / limit);
  const limits = { "$limit": limit };
  const skips = options && options?.page ? { "$skip": parseInt((options?.page - 1) * options?.limit) } : { "$skip": 0 };
  return { limits, skips, totalPages };
};

const getDatesBetweenDates = (startDate, endDate) => {
  let date = []
  while (moment(startDate) <= moment(endDate)) {
    date.push({ date: startDate, day: moment(startDate).format("dddd") });
    startDate = moment(startDate).add(1, 'days').format("YYYY-MM-DD");
  }
  return date;
}

const is_Sunday = function (date) {
  let tempDate = new Date(date);
  return (tempDate.getDay() === 0)
}

const is_Saturday = function (date) {
  let tempDate = new Date(date);
  return (tempDate.getDay() === 6)
}

const isWeekend = function (date) {
  let tempDate = new Date(date);
  return (tempDate.getDay() === 6 || tempDate.getDay() === 0)
}

// to find a date is sunday or not
const is_sunday = function (date) {
  return date === moment(date).format("YYYY-MM-DD")
};

const isWeekOffDay = (weekOffs, date) => {
  // let tempArr=weekOffs.split(",");
  let weekNo = moment(date).isoWeekday();
  if (weekOffs.includes(weekNo)) {
    return true
  } else {
    return false
  }
}

const count_of_saturday = function (date, arr) {
  let tempDate = new Date(date);
  var firstWeekday = new Date(tempDate.getFullYear(), tempDate.getMonth(), 1).getDay();
  var offsetDate = tempDate.getDate() + firstWeekday - 1;
  let countOfSaturday = Math.floor(offsetDate / 7);  // thisreturns result from indexing 0
  countOfSaturday += 1;
  if (arr.includes(countOfSaturday)) {
    return true
  } else {
    return false
  }
}

const isSandwichPolicy = (params) => {
  const leaveStatus1 = ['Full Day', 'Second Half Day'];
  const leaveStatus2 = ['Full Day', 'First Half Day'];
  const result = [];
  const { leaveTypeData, leaveDates, employeeOffs, employeeLeaves } = params;
  const appliedLeaveDates = leaveDates.map(item => {
    return item.leave_date;
  });
  const previousLeaveDates = employeeLeaves.map(item => {
    return item.leave_start_date;
  });
  const employeeOffsDates = employeeOffs.map(item => {
    return item.date;
  });
  if (employeeOffs?.length < 0) {
    return false;
  } else if (!leaveTypeData?.count_weekend_as_leave && !leaveTypeData?.count_holiday_as_leave) {
    return false;
  }
  for (let i = 0; i < employeeOffs?.length; i++) {
    const data = employeeOffs[i];
    const prevDate = subtractFromMomentDate(data?.date, 1, 'day', "YYYY-MM-DD");
    const nextDate = addInMomentDate(data?.date, 1, 'day', "YYYY-MM-DD");
    // if(leaveTypeData?.count_weekend_as_leave && data.type == "WO" && leaveTypeData?.count_weekend_as_leave_days > appliedLeaveDates?.length){
    //   return false;
    // }else if(leaveTypeData?.count_holiday_as_leave && data.type == "PH" && leaveTypeData?.count_holiday_as_leave_days > appliedLeaveDates?.length){
    //   return false;
    // }else 
    if (leaveTypeData?.count_weekend_as_leave && data.type == "WO") {
      if (((appliedLeaveDates.includes(prevDate) || previousLeaveDates.includes(prevDate) || result.includes(prevDate))
        && (leaveStatus1.includes(leaveDates[0]?.leave_status) || leaveStatus1.includes(employeeLeaves[0]?.leave_status) || result.includes(prevDate)))
        && ((appliedLeaveDates.includes(nextDate) || previousLeaveDates.includes(nextDate) || result.includes(nextDate) || employeeOffsDates.includes(nextDate))
          && (leaveStatus2.includes(leaveDates[0]?.leave_status) || leaveStatus2.includes(employeeLeaves[0]?.leave_status) || result.includes(nextDate) || employeeOffsDates.includes(nextDate))
        )) {
        result.push(data?.date);
      }
    } else if (leaveTypeData?.count_holiday_as_leave && data.type == "PH") {
      if (((appliedLeaveDates.includes(prevDate) || previousLeaveDates.includes(prevDate) || result.includes(prevDate))
        && (leaveStatus1.includes(leaveDates[0]?.leave_status) || leaveStatus1.includes(employeeLeaves[0]?.leave_status) || result.includes(prevDate)))
        && ((appliedLeaveDates.includes(nextDate) || previousLeaveDates.includes(nextDate) || result.includes(nextDate) || employeeOffsDates.includes(nextDate))
          && (leaveStatus2.includes(leaveDates[0]?.leave_status) || leaveStatus2.includes(employeeLeaves[0]?.leave_status) || result.includes(nextDate) || employeeOffsDates.includes(nextDate))
        )) {
        result.push(data?.date);
      }
    }
  }
  return result;
}

const getEmployeeOffs = (params) => {
  const { employeeData, defaultShiftData, startDate, endDate, holidayData } = params;
  const result = [];
  const dateArray = getDatesBetweenDateRange(startDate, endDate);
  for (let i = 0; i < dateArray?.length; i++) {
    const { workingDay, alternativeSaturdayOff, weekOffs, holidays } = getShiftDetails(employeeData, defaultShiftData, dateArray[i]?.date, [], holidayData);
    let obj = {};
    if (workingDay === "alternative_saturday") {
      if (isSaturday(dateArray[i]?.date)) {
        if (countOfSaturday(dateArray[i]?.date, alternativeSaturdayOff)) {
          obj.type = "WO";
          obj.status = "Full Day";
          obj.date = dateArray[i]?.date;
        }
      } else if (isSunday(dateArray[i]?.date)) {
        obj.type = "WO";
        obj.status = "Full Day";
        obj.date = dateArray[i]?.date;
      }
    }
    if (weekOffs) {
      if (isWeekOffDayData(weekOffs, dateArray[i]?.date)) {
        obj.type = "WO";
        obj.status = "Full Day";
        obj.date = dateArray[i]?.date;
      }
    }
    if (holidays?.length) {
        const holidayAvailable = holidays?.filter(item => item?.date === dateArray[i]?.date);
        if (holidayAvailable && holidayAvailable?.length) {
          obj.status = holidayAvailable[0]?.apply_for;
          obj.type = "PH";
          obj.date = dateArray[i]?.date;
        }
    }
    if (Object.keys(obj).length !== 0) {
      result.push(obj);
    }
  }
  return result;
}

const getShiftDetails = (employeeData, defaultShiftData, date, shortLeaveConfigurations, holidayData) => {
  const shiftData = {}
  //add default shift data
  shiftData['workingDay'] = defaultShiftData && defaultShiftData?.shift_week_offs ? defaultShiftData?.shift_week_offs?.working_days : '';
  shiftData["alternativeSaturdayOff"] = defaultShiftData && defaultShiftData?.shift_week_offs ? defaultShiftData?.shift_week_offs?.alternative_saturday_off : [];
  shiftData["shiftDetails"] = defaultShiftData || {};
  shiftData["weekOffs"] = defaultShiftData && defaultShiftData?.shift_week_offs ? defaultShiftData?.shift_week_offs?.week_off : [];
  shiftData['shortLeaves'] = {};
  shiftData['holidays'] = [];

  //get short leaves data
  if (shortLeaveConfigurations?.length) {
    for (let i = 0; i < shortLeaveConfigurations?.length; i++) {
      const item = shortLeaveConfigurations[i];
      if (item?.applicable_employee?.includes(employeeData?._id)) {
        shiftData['shortLeaves'] = item;
        break;
      } else if (item?.applicable_designation?.includes(employeeData?._id)) {
        shiftData['shortLeaves'] = item;
        break;
      } else if (item?.applicable_department?.includes(employeeData?._id)) {
        shiftData['shortLeaves'] = item;
        break;
      } else if (item?.applicable_location?.includes(employeeData?._id)) {
        shiftData['shortLeaves'] = item;
        break;
      } else if (item?.applicable_role?.includes(employeeData?._id)) {
        shiftData['shortLeaves'] = item;
        break;
      } else if (item?.applicable_for == "all") {
        shiftData['shortLeaves'] = item;
      }
    }
  }

  //get holidays
  if(holidayData?.length){
    for(let i=0; i<holidayData?.length; i++){
      const data = holidayData[i];
      let getCity = data?.city?.filter(item =>item?.toString() === employeeData?.location_data?.city?.toString());
      let getGender = data.gender.filter(item =>item == employeeData?.gender);
      if((data.gender[0] == "all" || getGender.length) && getCity.length){
        shiftData['holidays'].push(data?.holiday_data);
      }
    }
  }
  shiftData['holidays'] = shiftData['holidays'].flat()

  //if assigned shift is available then update the data
  if (employeeData?.shift_data && employeeData?.shift_data?.length) {
    shiftData['shiftDetails'] = employeeData.shift_data[0];
    shiftData['workingDay'] = employeeData && employeeData?.shift_week_offs?.length ? employeeData.shift_week_offs[0].working_days : '';
    shiftData['alternativeSaturdayOff'] = employeeData && employeeData?.shift_week_offs?.length ? employeeData.shift_week_offs[0].alternative_saturday_off : [];
    shiftData['weekOffs'] = employeeData && employeeData?.shift_week_offs?.length ? employeeData.shift_week_offs[0].week_off : [];
  }

  //if other shift data is available
  if (employeeData?.assigned_other_shift && employeeData?.assigned_other_shift?.length) {
    const otherShiftData = employeeData?.assigned_other_shift?.filter((item, key) => {
      const shiftDate = convertDateByMoment(item.start_date, 'YYYY-MM-DD');
      if (date == shiftDate) {
        return item;
      }
    });
    if (otherShiftData?.length) {
      shiftData['shiftDetails'] = otherShiftData[0]?.other_shift_data;
      shiftData['workingDay'] = otherShiftData[0]?.other_shift_data && otherShiftData[0]?.other_shift_data?.other_shift_calendars ? otherShiftData[0]?.other_shift_data.other_shift_calendars.working_days : '';
      shiftData['alternativeSaturdayOff'] = otherShiftData[0]?.other_shift_data && otherShiftData[0]?.other_shift_data?.other_shift_calendars ? otherShiftData[0]?.other_shift_data.other_shift_calendars.alternative_saturday_off : [];
      shiftData['weekOffs'] = otherShiftData[0]?.other_shift_data && otherShiftData[0]?.other_shift_data?.other_shift_calendars ? otherShiftData[0]?.other_shift_data.other_shift_calendars.week_off : [];
    }
  }

  //if week off data is available then update the week off
  if (employeeData?.week_off_data && employeeData?.week_off_data?.length) {
    shiftData['weekOffs'] = employeeData?.week_off_data[0]?.number_of_week || [];
  }
  return shiftData;
};


const getShiftDetailsDateWise = (params) => {
  const { employeeData, defaultShiftData, startDate, endDate } = params;
  const result = [];
  const dateArray = getDatesBetweenDateRange(startDate, endDate);
  for(let i=0; i<dateArray?.length; i++){
    const {shiftDetails, workingDay, alternativeSaturdayOff, weekOffs } = getShiftDetails(employeeData, defaultShiftData, dateArray[i]?.date, []);
    let obj = {};
    obj.type = `${shiftDetails?.shift_code} (${shiftDetails?.shift_start_time}-${shiftDetails?.shift_end_time})`
    obj.shift_start_time = shiftDetails?.shift_start_time
    obj.shift_end_time = shiftDetails?.shift_end_time
    obj.date = dateArray[i]?.date;
    obj.color = shiftDetails.color
    if (workingDay === "alternative_saturday") {
      if (isSaturday(dateArray[i]?.date)) {
        if (countOfSaturday(dateArray[i]?.date, alternativeSaturdayOff)) {
          obj.type = "WO"
          obj.date = dateArray[i]?.date;
        }
  
      } else if (isSunday(dateArray[i]?.date)) {
          obj.type = "WO"
          obj.date = dateArray[i]?.date;
      }
    }
    if (weekOffs) {
      if (isWeekOffDayData(weekOffs, dateArray[i]?.date)) {
          obj.type = "WO"
          obj.date = dateArray[i]?.date;
      }
    }
    if(Object.keys(obj).length !== 0){
      result.push(obj);
    }
  }
  return result;
}

const isExistLeave = (leaveDetails, appliedLeave) => {
  let result = {
    status: true,
    msg: ``
  };
  for(let i=0; i<leaveDetails?.length; i++){
    let leave_status = ``;
      const leave_status_lc = leaveDetails[i]?.leave_status || '';
      if(leave_status_lc == "Full Day" || leave_status_lc == 'Full Day'){
        leave_status = 'Full Day';
      }
      else if(leave_status_lc == "First Half Day" || leave_status_lc == 'First Half Day'){
        leave_status = 'First Half Day';
      }
      else if(leave_status_lc == "Second Half Day" || leave_status_lc == 'Second Half Day'){
        leave_status = 'Second Half Day';
      }
      
      for(let j=0; j<appliedLeave?.length; j++){
        if(moment(appliedLeave[j]?.leave_start_date).format('YYYY-MM-DD') == moment(leaveDetails[i]?.leave_date).format('YYYY-MM-DD')){
          if(appliedLeave[j]?.leave_status == 'Full Day'){
            result['status'] = false;
            result['msg'] = result['msg'] + ` ${leaveDetails[i]?.leave_date} (Full Day),`
          }else if(leave_status == 'Full Day'){
            result['status'] = false;
            result['msg'] = result['msg'] + `${leaveDetails[i]?.leave_date} (${appliedLeave[j]?.leave_status}),`
          }else if(leave_status == appliedLeave[j]?.leave_status) {
            result['status'] = false;
            result['msg'] = result['msg'] + `${leaveDetails[i]?.leave_date} (${appliedLeave[j]?.leave_status}),`
          }
        }
    }
  }
  return result;
};

const removeSpecialCharacters = (str)=>{
  const regex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/g;
  const result = str.replace(regex, ' ');
  return result
}

const toTitleCaseLowerCase = (data)=>{
  return data
  ?.split(' ')
  ?.map(word => word.toLowerCase())
  ?.join('_');

}

function checkAttendanceStatus(data) {
  const rules = [
      { condition: (fh, sh) => fh === 'AB' && sh === 'PR', status: '1/2AB+1/2P' },
      { condition: (fh, sh) => fh === 'PR' && sh === 'AB', status: '1/2P+1/2AB' },
      { condition: (fh, sh) => fh === 'AB' && sh === 'AB', status: 'AB' },
      { condition: (fh, sh) => fh === 'PR' && sh === 'PR', status: 'P' },
      { condition: (fh, sh) => fh === 'PL' && sh === 'PL', status: 'PL' },
      { condition: (fh, sh) => fh === 'LW' && sh === 'LW', status: 'LW' },
      { condition: (fh, sh) => fh === 'WO' && sh === 'WO', status: 'WO' },
      { condition: (fh, sh) => fh === 'PH' && sh === 'PH', status: 'PH' },
      { condition: (fh, sh) => fh === 'PT' && sh === 'PT', status: 'PT' },
      { condition: (fh, sh) => fh === 'WFH' && sh === 'WFH', status: 'WFH' },
      { condition: (fh, sh) => fh === 'CO' && sh === 'CO', status: 'CO' },
      { condition: (fh, sh) => fh === 'TOD' && sh === 'TOD', status: 'TR' },
      { condition: (fh, sh) => fh === 'M' && sh === 'M', status: 'PL' },
      { condition: (fh, sh) => fh === 'SL' && sh === 'SL', status: 'PL' },
      { condition: (fh, sh) => fh === 'CL' && sh === 'CL', status: 'CL' },
      { condition: (fh, sh) => fh === 'ML' && sh === 'ML', status: 'ML' },
      { condition: (fh, sh) => fh === 'BL' && sh === 'BL', status: 'BL' },
      { condition: (fh, sh) => fh === 'PH' && ['PH_SHP', 'PH_P'].includes(sh), status: 'PH' },
      { condition: (fh, sh) => ['PH_FHP', 'PH_P'].includes(fh) && sh === 'PH', status: 'PH' },
      { condition: (fh, sh) => fh === 'WO' && ['WO_SHP', 'WO_P'].includes(sh), status: 'WO' },
      { condition: (fh, sh) => ['WO_FHP', 'WO_P'].includes(fh) && sh === 'WO', status: 'WO' },
      { condition: (fh, sh) => fh === 'PR' && sh === 'PL', status: '1/2P+1/2PL' },
      { condition: (fh, sh) => fh === 'PL' && sh === 'PR', status: '1/2PL+1/2P' },
      { condition: (fh, sh) => fh === 'PR' && sh === 'LW', status: '1/2P+1/2LW' },
      { condition: (fh, sh) => fh === 'LW' && sh === 'PR', status: '1/2LW+1/2P' },
      { condition: (fh, sh) => fh === 'SL' && sh === 'PR', status: '1/2SL+1/2P' },
      { condition: (fh, sh) => fh === 'PR' && sh === 'SL', status: '1/2P+1/2SL' },
      { condition: (fh, sh) => fh === 'PR' && sh === 'CL', status: '1/2P+1/2CL' },
      { condition: (fh, sh) => fh === 'CL' && sh === 'PR', status: '1/2CL+1/2P' },
  ];
  const match = rules.find(rule => rule.condition(data.first_half_status, data.second_half_status));
  return match ? match.status : 'Unknown';
}

const decodeCharacters = (input) => {
  return input.map((data) => {
    if (data.rules && Array.isArray(data.rules)) {
      data.rules = data.rules.map((item) => {
        if (item?.amount) {
          item.amount = item.amount
            .replaceAll(/&lt;/g, '<')
            .replaceAll(/&gt;/g, '>')
            .replaceAll(/&amp;/g, '&');
        }
        return item;
      });
    }
    return data;
  });
};
const decodeRules = (input) => {
  return input.map((item) => {
        if (item?.amount) {
          item.amount = item.amount
            .replaceAll(/&lt;/g, '<')
            .replaceAll(/&gt;/g, '>')
            .replaceAll(/&amp;/g, '&')
        }
        return item;
      });
};

// creating a folder in live server

const createFolder = (path) => {
  fs.access(path, (error) => {

    if (error) {
      // If current directory does not exist then create it
      fs.mkdir(path, { recursive: true }, (error) => {
        if (error) {
          console.log(error);
        } else {
          console.log("New Directory created successfully !!");
        }
      });
    } else {
      console.log("Given Directory already exists !!");
    }
  });
}

const monthlyAttendance = async (attendance_details, month,leaveData) => {
  const start_date = moment(month).startOf('month').format("YYYY-MM-DD");
  const end_date = moment(month).endOf('month').format("YYYY-MM-DD");
  let totalDays = getDatesBetweenDateRange(start_date, end_date);
  let finalData = [];
  const ids = [];
  const finalArr = [];
  let updatedData = {};

  attendance_details.map((val) => {
    if (ids.indexOf(val.emp_id) !== -1) {
      updatedData[val?.emp_id].push(val);
    } else {

      updatedData = { [val.emp_id]: [val] }
      finalArr.push(updatedData);
    }
    ids.push(val?.emp_id);
  });
  let uniqueItems = [...new Set(ids)]
  let finalArray = []

  uniqueItems.forEach((elem, key) => {
    const obj = {};
    let leave = 0;
    let pr = 0;
    let ab = 0;
    let pl = 0;
    let co = 0;
    let ph = 0;
    let wo = 0;
    let tr = 0;
    let ml = 0;
    let lw = 0;
    let bl = 0;
    let p = 0;
    let cl = 0;
    let considerWo = 0;
    obj["emp_id"] = finalArr[key][elem]?.[0]?.emp_id || '';
    obj["candidate_ref_id"] = finalArr[key][elem]?.[0]?.candidate_ref_id || 0,
      obj["employee_name"] = finalArr[key][elem]?.[0]?.name,
      obj["email"] = finalArr[key][elem]?.[0]?.email,
      // obj["department"] = finalArr[key][elem]?.[0]?.department,
      // obj["ctc"] = finalArr[key][elem]?.[0]?.ctc,
      // obj["tax_regime"] = finalArr[key][elem]?.[0]?.tax_regime,
      // obj["is_esi"] = finalArr[key][elem]?.[0]?.is_esi,
      // obj["is_pf"] = finalArr[key][elem]?.[0]?.is_pf,
      // obj["bonus"] = finalArr[key][elem]?.[0]?.bonus,
      // obj["is_manual_tax"] = finalArr[key][elem]?.[0]?.is_manual_tax,
      // obj["is_employee"] = finalArr[key][elem]?.[0]?.is_employee,
      // obj["meal_allowance"] = finalArr[key][elem]?.[0]?.is_meal_allowance,
      // obj["manual_tax"] = finalArr[key][elem]?.[0]?.manual_tax,
      obj["attendance"] = [],
      obj["attendance_data"] = {},
      obj["is_attendance_special"] = false,
      obj["present_count"] = 0,
      obj["absent_count"] = 0,
      obj["pay_count"] = 0,

      finalArr[key][elem].map((val, key) => {
        // if (((!val.releaving_date && val.releaving_date == "") || (val.releaving_date >= start_date || val.releaving_date <= end_date) || (val?.releaving_date == null || val.releaving_date >= val.date)) && val.date >= start_date && val.date <= end_date) {
       
          if (val.first_half_status == 'AB' && val.second_half_status == 'PR') {
            pr = pr + 0.5
            ab = ab + 0.5
          }
          if (val.first_half_status == 'PR' && val.second_half_status == 'AB') {
            pr = pr + 0.5
            ab = ab + 0.5
          }
          if (val.first_half_status == 'AB' && val.second_half_status == 'AB') {
            ab = ab + 1
          }
          if (val.first_half_status == 'PR' && val.second_half_status == 'PR') {
            pr = pr + 1
          }
          if(leaveData.includes(val.first_half_status) && leaveData.includes(val.second_half_status)){
            leave = leave + 1
          }
          if (leaveData.includes(val.first_half_status) && val.second_half_status == 'PR') {
            pr = pr + 0.5
            leave = leave + 0.5
          }
          if (val.first_half_status == 'PR' && leaveData.includes(val.second_half_status)) {
            pr = pr + 0.5
            leave = leave + 0.5
          }

          if (leaveData.includes(val.first_half_status) && (val.second_half_status == 'LW' || val.second_half_status == 'LWP')) {

            leave = leave + 0.5
            lw = lw + 0.5
          }
          if ((val.first_half_status == 'LW' || val.first_half_status == 'LWP') && leaveData.includes(val.second_half_status)) {

            leave = leave + 0.5
            lw = lw + 0.5
          }

          if (leaveData.includes(val.first_half_status) && val.second_half_status == 'PR') {
            leave = leave + 0.5
            pr = pr + 0.5
          }
          if (val.first_half_status == 'PR' && leaveData.includes(val.second_half_status)) {
            leave = leave + 0.5
            pr = pr + 0.5
          }

          if (val.first_half_status == 'AB' && leaveData.includes(val.second_half_status)) {

            ab = ab + 0.5
            leave = leave + 0.5
          }
          if (leaveData.includes(val.first_half_status) && val.second_half_status == 'AB') {

            ab = ab + 0.5
            leave = leave + 0.5
          }


          if ((val.first_half_status == 'LW' || val.first_half_status == 'LWP') && (val.second_half_status == 'LW' || val.second_half_status == 'LWP')) {
            lw = lw + 1
          }
          if (val.first_half_status == 'WO' && val.second_half_status == 'WO') {
            wo = wo + 1
          }
          if (val.first_half_status == 'WO_P' && val.second_half_status == 'WO_P') {
            wo = wo + 1
          }
          if ((val.first_half_status == 'WO_P' || val.first_half_status == 'WO_FHP') && val.second_half_status == 'WO') {
            wo = wo + 1
          }
          if (val.first_half_status == 'WO' && (val.second_half_status == 'WO_P' || val.second_half_status == 'WO_SHP')) {
            wo = wo + 1
          }
          if (val.first_half_status == 'PH' && val.second_half_status == 'PH') {
            ph = ph + 1
          }
          if ((val.first_half_status == 'PH_P' || val.first_half_status == 'PH_FHP') && val.second_half_status == 'PH') {
            ph = ph + 1
          }
          if (val.first_half_status == 'PH' && (val.second_half_status == 'PH_P' || val.second_half_status == 'PH_SHP')) {
            ph = ph + 1
          }
          if (val.first_half_status == 'PH_P' && val.second_half_status == 'PH_P') {
            ph = ph + 1
          }
         
         
          if (val.first_half_status == 'PR' && (val.second_half_status == 'LW' || val.second_half_status == 'LWP')) {
            pr = pr + 0.5
            lw = lw + 0.5
          }
          if ((val.first_half_status == 'LW' || val.first_half_status == 'LWP') && val.second_half_status == 'PR') {
            pr = pr + 0.5
            lw = lw + 0.5
          }
          if (val.first_half_status == 'AB' && (val.second_half_status == 'LW' || val.second_half_status == 'LWP')) {

            ab = ab + 0.5
            lw = lw + 0.5
          }
          if ((val.first_half_status == 'LW' || val.first_half_status == 'LWP') && val.second_half_status == 'AB') {

            ab = ab + 0.5
            lw = lw + 0.5
          }
          if (val.first_half_status == 'CO' && val.second_half_status == 'CO') {
            co = co + 1
          }
          if (val.first_half_status == 'AB' && val.second_half_status == 'CO') {

            ab = ab + 0.5
            co = co + 0.5
          }
          if (val.first_half_status == 'CO' && val.second_half_status == 'AB') {

            ab = ab + 0.5
            co = co + 0.5
          }
         
          
          if (val.first_half_status == 'PR' && val.second_half_status == 'CO') {
            co = co + 0.5
            pr = pr + 0.5
          }
          if (val.first_half_status == 'CO' && val.second_half_status == 'PR') {
            co = co + 0.5
            pr = pr + 0.5
          }
         
          if (val.first_half_status == 'TOD' && val.second_half_status == 'TOD') {
            tr = tr + 1
          }
          if (val.first_half_status == 'PR' && val.second_half_status == 'TOD') {
            tr = tr + 0.5
            pr = pr + 0.5
          }
          if (val.first_half_status == 'TOD' && val.second_half_status == 'PR') {
            tr = tr + 0.5
            pr = pr + 0.5
          }
          if (val.first_half_status == 'AB' && val.second_half_status == 'TOD') {

            tr = tr + 0.5
            ab = ab + 0.5
          }
          if (val.first_half_status == 'TOD' && val.second_half_status == 'AB') {

            tr = tr + 0.5
            ab = ab + 0.5
          }
        
          if (val.first_half_status == 'PR' && leaveData.includes(val.first_half_status)) {
            leave = leave + 0.5
            pr = pr + 0.5
          }
          if (leaveData.includes(val.first_half_status) && val.second_half_status == 'PR') {
            leave = leave + 0.5
            pr = pr + 0.5
          }
          if (val.first_half_status == 'AB' && leaveData.includes(val.first_half_status)) {

            leave = leave + 0.5
            ab = ab + 0.5
          }
          if (leaveData.includes(val.first_half_status) && val.second_half_status == 'AB') {

            leave = leave + 0.5
            ab = ab + 0.5
          }
          if (val.first_half_status == 'PR' && leaveData.includes(val.first_half_status)) {
            leave = leave + 0.5
            pr = pr + 0.5
          }
          if (leaveData.includes(val.first_half_status) && val.second_half_status == 'PR') {
            leave = leave + 0.5
            pr = pr + 0.5
          }
          if (val.first_half_status == 'AB' && leaveData.includes(val.first_half_status)) {

            leave = leave + 0.5
            ab = ab + 0.5
          }
          if (leaveData.includes(val.first_half_status) && val.second_half_status == 'AB') {

            leave = leave + 0.5
            ab = ab + 0.5
          }
        
          if (leaveData.includes(val.first_half_status) && (val.second_half_status == 'LW' || val.second_half_status == 'LWP')) {

            leave = leave + 0.5
            lw = lw + 0.5;
          }
          if ((val.first_half_status == 'LW' || val.first_half_status == 'LWP') && leaveData.includes(val.first_half_status)) {

            leave = leave + 0.5
            lw = lw + 0.5;
          }
          if (leaveData.includes(val.first_half_status) && val.second_half_status == 'CO') {

            leave = leave + 0.5
            co = co + 0.5;
          }
          if (val.first_half_status == 'CO' && leaveData.includes(val.first_half_status)) {

            leave = leave + 0.5
            co = co + 0.5;
          }
          if (leaveData.includes(val.first_half_status) && val.second_half_status == 'TOD') {

            leave = leave + 0.5
            tr = tr + 0.5;
          }
          if (val.first_half_status == 'TOD' && leaveData.includes(val.first_half_status)) {

            leave = leave + 0.5
            tr = tr + 0.5;
          }
          if (leaveData.includes(val.first_half_status) && val.second_half_status == 'TOD') {

            leave = leave + 0.5
            tr = tr + 0.5;
          }
          if (val.first_half_status == 'TOD' && leaveData.includes(val.first_half_status)) {

            leave = leave + 0.5
            tr = tr + 0.5;
          }
          if (leaveData.includes(val.first_half_status) && val.second_half_status == 'CO') {
            leave = leave + 0.5
            co = co + 0.5;
          }
          if (val.first_half_status == 'CO' && val.second_half_status == 'PL') {

            leave = leave + 0.5
            co = co + 0.5;
          }
          if ((totalDays?.length - wo - ph) == ab) {
            considerWo = 1
            ab = ab + wo + ph
            wo = 0
            ph = 0
          }
          else {
            val.attendance_status
          }
          obj["attendance"].push(val);
        // }
      })
    considerWo == 1 && finalArr[key][elem].map((val, key) => {
      val.attendance_status = 'AB'
      obj["attendance"].push(val);
    })
    obj["PR"] = pr
    obj["WO"] = wo
    obj["PL"] = pl
    obj["CL"] = cl
    obj["PH"] = ph
    obj["CO"] = co
    obj["TR"] = tr
    obj["ML"] = ml
    obj["PT"] = p
    obj["BL"] = bl
    obj["LW"] = lw
    obj["AB"] = ab
    obj["leave"] = leave
    obj["total_days"] = pr + wo + pl + ph + co + tr + ml + p + bl + cl + leave + ab + lw;
    obj["present_count"] = pr + wo + pl + ph + co + tr + ml + p + bl + cl + leave;
    obj["pay_count"] = pr;
    obj["absent_count"] = ab + lw;
    finalData.push(obj);
  });
  console.log("attendance data")

  return finalData;
}

const newRegimeRate = () => {
  const rates = [5,10,15,20,30];
  return rates;
}

const oldRegimeRate = () => {
  return 5;
}


//tax slabs table {type,tax_slabs,from,to,tax_percent,is_cess,cess_percent}
const calculateNewRegimeTax = async (salary_details, getTaxSlab,getInvestment) => {
  let total_earnings = 0;
  let result = {};
  let tax = 0;
  let rate = [];
  for (let i = 0; i < salary_details["earnings"].length; i++) {
    total_earnings = total_earnings + parseFloat(salary_details["earnings"][i].yearly);
  }
  result["emp_id"] = salary_details.emp_id;
  result["regime"] = "Opted for 115BAC";
  result["total_earnings"] = total_earnings;
  result["taxable_earnings"] = 0;
  result["income_from_other_sources"] = 0;
  result["standard_deduction"] = 0;
  result["exemptions"] = [];
  result["tax_relaxation"] = 0;
  result["rebate"] = "";
  result["rebate_amount"] = 0;
  result["education_cess"] = 0;
  result["taxable_amount"] = 0;
  const salary_slab = getTaxSlab.filter(item =>item.start <= total_earnings && item.end >= total_earnings && item.type === "new")
  // const salary_slab_query = `select * from tax_slabs where start<=${total_earnings} and end>=${total_earnings} and type like '%new%'`;
  // const salary_slab = await wait(newDb, salary_slab_query);

  if (total_earnings > salary_slab[0].tax_relaxation) {

    //reduce standard deduction
    if (salary_slab[0].is_standard_deduction) {
      total_earnings = total_earnings - parseFloat(salary_slab[0].standard_deduction_value);
      result["standard_deduction"] = salary_slab[0].standard_deduction_value;
    }
    result["taxable_earnings"] = total_earnings;


    const declarations = getInvestment
    if (declarations.length > 0) {
      const Other_Sources_of_Income = jsonParse(declarations[0]?.Other_Sources_of_Income)
      const section_6a_declarations = jsonParse(declarations[0]?.section_6a_declarations)
      let income_from_other_sources = 0;
      if (Other_Sources_of_Income.length > 0) {
        income_from_other_sources = income_from_other_sources + (parseFloat(Other_Sources_of_Income[0]?.income_from_other_sources) || 0) +
          (parseFloat(Other_Sources_of_Income[0]?.saving_deposit_interest) || 0) + (parseFloat(Other_Sources_of_Income[0]?.saving_deposit_interest) || 0) +
          (parseFloat(Other_Sources_of_Income[0]?.fixed_deposit_interest) || 0) + (parseFloat(Other_Sources_of_Income[0]?.national_saving_interest) || 0);
      }
      result["income_from_other_sources"] = income_from_other_sources;
      total_earnings = total_earnings + income_from_other_sources;

      const exemptions_query = `SELECT pic.category, pic.max_limit, pic.amount, pic.is_eligible_for_new,pic.is_eligible_for_old, pi.sub_category FROM payroll_investment_category pic
left join payroll_investment pi on pi.category_id = pic.id where pic.is_eligible_for_new = 1`;
      const exempted_income = await wait(newDb, exemptions_query);
      let exemptions = [];
      if (section_6a_declarations.length) {
        Object.keys(section_6a_declarations[0]).forEach((key) => {
          let amt = 0;
          section_6a_declarations[0][key].forEach(element => {
            if (element.amount && parseFloat(element.amount)) {
              if (element.isMaxLimit == "true") {
                if (parseFloat(element.amount) > parseFloat(element.maxLimit)) {
                  amt = amt + parseFloat(element.maxLimit)
                } else {
                  amt = amt + parseFloat(element.amount);
                }
              } else {
                amt = amt + parseFloat(element.amount);
              }
            }
          });
          exemptions.push({ "name": key, "amount": amt });
        })
      }
      //from database {only investment considered in new regime(NPS)}
      for (let i = 0; i < exempted_income.length; i++) {
        for (let j = 0; j < exemptions.length; j++) {
          let data = {};
          if (exempted_income[i]?.category == exemptions[i]?.name) {
            if (parseFloat(exempted_income[i]?.max_limit)) {
              if (parseFloat(exempted_income[i]?.amount) < exemptions[i]?.amount) {
                total_earnings = total_earnings - parseFloat(exempted_income[i]?.amount);
                data = { "name": exempted_income[i]?.category, "amount": parseFloat(exempted_income[i]?.amount) };
                result["exemptions"].push(data);
              } else {
                data = { "name": exempted_income[i]?.category, "amount": parseFloat(exemptions[i]?.amount) };
                result["exemptions"].push(data);
                total_earnings = total_earnings - parseFloat(exemptions[i]?.amount);
              }
            } else {
              data = { "name": exempted_income[i]?.category, "amount": parseFloat(exemptions[i]?.amount) };
              result["exemptions"].push(data);
              total_earnings = total_earnings - parseFloat(exemptions[i]?.amount);
            }
          }
        }
      }
    }
    const rates = newRegimeRate();
    let tax_percent = 0;
    if (parseFloat(salary_slab[0].start) <= total_earnings && parseFloat(salary_slab[0].end) >= total_earnings) {
      tax_percent = salary_slab[0].tax_percent
    } else {
      const salary_slab_query1 = `select * from tax_slabs where start<=${total_earnings} and end>=${total_earnings} and type like '%new%'`;
      const salary_slab1 = await wait(newDb, salary_slab_query1);
      tax_percent = salary_slab1[0].tax_percent;
    }
    for (let i = 0; i < rates.length; i++) {
      if (rates[i] <= tax_percent) {
        rate.push(rates[i]);
      }
    }
    //tax relaxation
    total_earnings = total_earnings - salary_slab[0].tax_relaxation;
    result["tax_relaxation"] = salary_slab[0].tax_relaxation;

    for (let i = 0; i < rate.length; i++) {
      if (total_earnings < salary_slab[0].tax_relaxation || rate[i] == 30) {
        tax = tax + ((total_earnings * rate[i]) / 100);
        break;
      }
      tax = tax + ((salary_slab[0].constant_difference * rate[i]) / 100);
      total_earnings = total_earnings - salary_slab[0].constant_difference;
    }

    if (salary_slab[0].is_rebate_allowed) {
      const rules = jsonParse(salary_slab[0].rebate_rules);
      if (Math.round(tax) <= eval(rules?.amount)) {
        result["rebate"] = rules?.name;
        result["rebate_amount"] = rules?.amount;
        tax = 0;
      }
    }

    // education cess 4 %
    if (tax > 0 && salary_slab[0].is_include_cess) {
      const cess = ((tax * salary_slab[0].cess_percentage) / 100);
      result["education_cess"] = Math.round(cess);
      tax = tax + cess;
    }
    result["taxable_amount"] = Math.round(tax);
    result["monthly_tax"] = Math.round(tax / 12);
  }
  return result;
}

const calculateOldRegimeTax = async (salary_details,getTaxSlab,getInvestment) => {
  let total_earnings = 0;
  let basic = 0;
  let tax = 0;
  let result = {};

  //calculate gross salary
  for (let i = 0; i < salary_details["earnings"].length; i++) {
    if (salary_details["earnings"][i].name == "basic") {
      basic = parseFloat(salary_details["earnings"][i].yearly);
    }
    total_earnings = total_earnings + parseFloat(salary_details["earnings"][i].yearly);
  }
  result["emp_id"] = salary_details.emp_id;
  result["regime"] = "Not Opted for 115BAC";
  result["total_earnings"] = total_earnings;
  result["taxable_earnings"] = 0;
  result["income_from_other_sources"] = 0;
  result["standard_deduction"] = 0;
  result["exemptions"] = [];
  result["tax_relaxation"] = 0;
  result["rebate"] = "";
  result["rebate_amount"] = 0;
  result["education_cess"] = 0;
  result["taxable_amount"] = 0;
  const salary_slab = getTaxSlab.filter(item =>item.start <= total_earnings && item.end >= total_earnings && item.type === "old")

  const declarations =getInvestment
  //reduce standard deduction
  if (salary_slab[0].is_standard_deduction) {
    total_earnings = total_earnings - parseFloat(salary_slab[0].standard_deduction_value);
    result["standard_deduction"] = salary_slab[0].standard_deduction_value;
  }
  console.log("fsdfs" , result)
  result["taxable_earnings"] = total_earnings;
  if (declarations.length > 0) {
    const allowances_declarations = jsonParse(declarations[0]?.allowances_declarations)
    const house_rent_declarations = jsonParse(declarations[0]?.house_rent_declarations)
    const let_out_property_declarations = jsonParse(declarations[0]?.let_out_property_declarations)
    const section_6a_declarations = jsonParse(declarations[0]?.section_6a_declarations)
    const Other_Sources_of_Income = jsonParse(declarations[0]?.Other_Sources_of_Income)
    const Home_Loan_Declarations = jsonParse(declarations[0]?.Home_Loan_Declarations)
    for (let i = 0; i < allowances_declarations.length; i++) {
      total_earnings = total_earnings - (parseFloat(allowances_declarations[i].amount) * 12);
    }
    for (let i = 0; i < house_rent_declarations.length; i++) {
      let hra = ((parseFloat(house_rent_declarations[i].amount) * 12) - ((basic * 10) / 100));
      if (hra > 0) {
        total_earnings = total_earnings - ((parseFloat(house_rent_declarations[i].amount) * 12) - ((basic * 10) / 100));
      }
    }
    result["taxable_earnings"] = total_earnings;
    //income from
    let income_from_other_sources = 0;
    if (Other_Sources_of_Income.length > 0) {
      income_from_other_sources = income_from_other_sources + (parseFloat(Other_Sources_of_Income[0]?.income_from_other_sources) || 0) +
        (parseFloat(Other_Sources_of_Income[0]?.saving_deposit_interest) || 0) + (parseFloat(Other_Sources_of_Income[0]?.saving_deposit_interest) || 0) +
        (parseFloat(Other_Sources_of_Income[0]?.fixed_deposit_interest) || 0) + (parseFloat(Other_Sources_of_Income[0]?.national_saving_interest) || 0);
    }
    result["income_from_other_sources"] = income_from_other_sources;
    total_earnings = total_earnings + income_from_other_sources;
    let taxable_home_loan = 0;
    if (Home_Loan_Declarations.length > 0) {
      //24(b) exemption on interest, max-limit 200000
      if (parseFloat(Home_Loan_Declarations[0].interest) > 200000) {
        taxable_home_loan = taxable_home_loan + 200000;
      } else {
        taxable_home_loan = taxable_home_loan + parseFloat(Home_Loan_Declarations[0].interest);
      }
      //80C Exemption on principal, max-limit 150000
      if (parseFloat(Home_Loan_Declarations[0].principal) > 150000) {
        taxable_home_loan = taxable_home_loan + 150000;
      } else {
        taxable_home_loan = taxable_home_loan + parseFloat(Home_Loan_Declarations[0].principal);
      }
    }
    total_earnings = total_earnings - taxable_home_loan;
    let taxable_let_out_property = 0;
    if (let_out_property_declarations.length > 0) {
      taxable_let_out_property = parseFloat(let_out_property_declarations[0].net_annual) - parseFloat(let_out_property_declarations[0].standard_deduction);
      if (let_out_property_declarations[0].is_loan_taken) {
        taxable_let_out_property = taxable_let_out_property + parseFloat(let_out_property_declarations[0].interest);
        if (parseFloat(let_out_property_declarations[0].principal) > 150000) {
          taxable_let_out_property = taxable_let_out_property + 150000;
        } else {
          taxable_let_out_property = taxable_let_out_property + parseFloat(let_out_property_declarations[0].principal);
        }
      }
    }
    total_earnings = total_earnings - taxable_let_out_property;

    const exemptions_query = `SELECT pic.category, pic.max_limit, pic.amount, pic.is_eligible_for_new,pic.is_eligible_for_old, pi.sub_category FROM payroll_investment_category pic
left join payroll_investment pi on pi.category_id = pic.id where pic.is_eligible_for_old = 1`;
    const exempted_income = await wait(newDb, exemptions_query);
    console.log("Hello")
    let exemptions = [];
    if (section_6a_declarations.length) {
      Object.keys(section_6a_declarations[0]).forEach((key) => {
        let amt = 0;
        section_6a_declarations[0][key].forEach(element => {
          if (element.amount && parseFloat(element.amount)) {
            if (element.isMaxLimit == "true") {
              if (parseFloat(element.amount) > parseFloat(element.maxLimit)) {
                amt = amt + parseFloat(element.maxLimit)
              } else {
                amt = amt + parseFloat(element.amount);
              }
            } else {
              amt = amt + parseFloat(element.amount);
            }
          }
        });
        exemptions.push({ "name": key, "amount": amt });
      })
    }

    for (let i = 0; i < exempted_income.length; i++) {
      for (let j = 0; j < exemptions.length; j++) {
        let data = {};
        if (exempted_income[i]?.category == exemptions[i]?.name) {
          if (parseFloat(exempted_income[i]?.max_limit)) {
            if (parseFloat(exempted_income[i]?.amount) < exemptions[i]?.amount) {
              total_earnings = total_earnings - parseFloat(exempted_income[i]?.amount);
              data = { "name": exempted_income[i]?.category, "amount": parseFloat(exempted_income[i]?.amount) };
              result["exemptions"].push(data);
            } else {
              data = { "name": exempted_income[i]?.category, "amount": parseFloat(exemptions[i]?.amount) };
              result["exemptions"].push(data);
              total_earnings = total_earnings - parseFloat(exemptions[i]?.amount);
            }
          } else {
            data = { "name": exempted_income[i]?.category, "amount": parseFloat(exemptions[i]?.amount) };
            result["exemptions"].push(data);
            total_earnings = total_earnings - parseFloat(exemptions[i]?.amount);
          }
          break;
        }
      }
    }
  }

  //after exemptions calculations
  if (total_earnings > salary_slab[0].tax_relaxation) {
    let constantRate = oldRegimeRate();
    if (total_earnings > salary_slab[0].constant_difference) {
      total_earnings = total_earnings - salary_slab[0].constant_difference;
      tax = tax + ((total_earnings * salary_slab[0].tax_percent) / 100);
      tax = tax + ((salary_slab[0].tax_relaxation * constantRate) / 100);
    }
    else {
      tax = tax + ((total_earnings * salary_slab[0].tax_percent) / 100);
    }
    //section 87A Rebate
    if (salary_slab[0].is_rebate_allowed) {
      const rules = jsonParse(salary_slab[0].rebate_rules);
      if (Math.round(tax) <= eval(rules?.amount)) {
        result["rebate"] = rules?.name;
        result["rebate_amount"] = Math.round(tax) || rules?.amount;
        tax = 0;
      }
    }

    // education cess 4 %
    if (tax > 0 && salary_slab[0].is_include_cess) {
      const cess = ((tax * salary_slab[0].cess_percentage) / 100);
      result["education_cess"] = Math.round(cess);
      tax = tax + cess;
    }
    result["taxable_amount"] = Math.round(tax);
    result["monthly_tax"] = Math.round(tax / 12);

  } else {
    result["tax_relaxation"] = total_earnings;
    result["monthly_tax"] = 0;
  }
  return result;
}

const checkAttendanceWithStatus = (data, leave, first_half_status, second_half_status, name, color) => {
  if (!data) {
    // return [{ status: name, style: { color, background: "#FFF0B9", borderLeftColor: "#BE930A" } }];
    let nameData =  name == "WO" ? "Week Off" : name
    return [{ status: nameData, style: {...styles.default, color } }];
  }
  let result = checkAttendanceWithAllStatus[data];
  if (!result) {
    let leaveStatus = data.split("_");

    if (leaveStatus.length === 1) {
      let filterLeave = leave?.find(item => item?.short_name === leaveStatus[0]);
      if (filterLeave) {
        return [{ status: filterLeave.name, style: styles.leave }];
      }
    } else if (leaveStatus.length === 2) {
      let filterLeave = leave?.find(item => item?.short_name === leaveStatus[1]);
      if (filterLeave) {
        return leaveStatus[0] === "FH"
          ? [
              { status: `1st Half ${filterLeave.name}`, style: styles.leave },
              { status: second_half_status === "PR" ? "2nd Half Present" : "2nd Half Absent", style: styles.weekOff }
            ]
          : [
              { status: first_half_status === "PR" ? "1st Half Present" : "1st Half Absent", style: styles.weekOff },
              { status: `2nd Half ${filterLeave.name}`, style: styles.leave }
            ];
      }
    }
  }

  return result;
};

const checkAttendanceWithStatuss = (data, leave, first_half_status, second_half_status, name, color) => {
  let result
  if (!data) {
    result = [
      {
        status: name,
        style: {
          background: "#00376a1a",
          borderLeftColor: "#00376a" ,
          color: color,
        }
      }
    ]
  } else {
    result = checkAttendanceWithAllStatus[data]
    if (!result) {
      let leaveStatus = data.split("_")
      if (leaveStatus.length == 1) {
        let filterLeave = leave?.find(item => item?.short_name === leaveStatus[0]);
        if (filterLeave) {
          result = [
            {
              status: filterLeave?.name,
              style: {
                "color": "#00376A",
                "background": "rgba(40, 87, 131, 0.1)",
                "border-left-color": "#00376A"
              }
            }
          ]
        }
      } else if (leaveStatus.length == 2) {
        let filterLeave = leave?.find(item => item?.short_name === leaveStatus[1]);
        if (filterLeave) {
          if (leaveStatus[0] == "FH") {
            result = [
              {
                status: `1st Half ${filterLeave?.name}`,
                style: {
                  "color": "#089792",
                  "background": "#D2FFFD",
                  "border-left-color": "#089792"
                }
              },
              {
                status: `${second_half_status == "PR" ? "2nd Half Present" : "2st Half Absent"}`,
                style: {
                  "color": "#5c5959",
                  "background": "#212529",
                  "border-left-color": "#212529"
                }
              }
            ]
          } else if (leaveStatus[0] == "SH") {
            result = [
              {
                status: `${first_half_status == "PR" ? "1nd Half Present" : "1st Half Absent"}`,
                style: {
                  "color": "#5c5959",
                  "background": "#212529",
                  "border-left-color": "#212529"
                }
              },
              {
                status: `2st Half ${filterLeave?.name}`,
                style: {
                  "color": "#089792",
                  "background": "#D2FFFD",
                  "border-left-color": "#089792"
                }
              },
            ]
          }
        }
      }
    }
  }
  return result
}

const getFinancialMonth = (from,to)=>{
  const start = moments(from);
    const end = moments(to);
    const months = [];
    while (start.isSameOrBefore(end, 'month')) {
      months.push({
        value: start.format('YYYY-MM'), 
        label: start.format('MMMM YYYY'),
        months: start.format("MM"),
      });
      start.add(1, 'month');
    }
    return months
}

const convertToSnakeCase = (value) => {
  if (!value) return '';
  return value?.trim()?.toLowerCase()?.replace(/\s+/g, '_');
};

const generateSalarySlipPDF = function (data) {
  console.log("pathTemplate",pathTemplate)
  let slipHtml = fs.readFileSync(pathTemplate + '\pay_slip.html', 'utf8');
  console.log("slipHtml",)
  let grossEarning = 0;
  let monthlyGrossEarning = 0;
  let totalDeduction = 0;
  let table1 = ``;
  let count = 0;
  let earningDeductionTr = '';
  const earningLen = data.earnings.length;
  const deductionLen = data.deductions.length;
  let printDeductionTr = 0;
  let extraFixedRows = earningLen > deductionLen ? earningLen : deductionLen;
  extraFixedRows = extraFixedRows + 1;
  const isShowDeductionRow = (data) => {
    if (data.payslip_name.match(/Employee/i) || data.payslip_name.match(/TDS/i)) {
      return true;
    }
    return false
  }

  for (let i = 0; i < deductionLen; i++) {
    if (isShowDeductionRow(data.deductions[i])) {
      printDeductionTr = printDeductionTr + 1;
    }
  }
  for (let i = 0; i < earningLen; i++) {
    let name = data.earnings[i].payslip_name.replace(/Allowance/g, " ");
    grossEarning += data.earnings[i].monthly;
    monthlyGrossEarning += data.earnings[i].real;

    let trStyle = 'border-top: 1px solid #fff; border-bottom: 1px solid #fff;';
    if (i === 0) trStyle = 'border-bottom: 1px solid #fff;';

    earningDeductionTr += `<tr style="${trStyle}">`;
    earningDeductionTr += `<td>${name}</td><td style="text-align: right;">${data.earnings[i].monthly}</td><td style="text-align: right;">${data.earnings[i].real}</td>`;
    if (printDeductionTr >= (i + 1)) {
      earningDeductionTr += `<td>##DEDUCTION_NAME_${i}##</td><td style="text-align: right;">##DEDUCTION_AMOUNT_${i}##</td>`;
    } else {
      earningDeductionTr += `<td>&nbsp;</td><td>&nbsp;</td>`;
    }
    earningDeductionTr += `</tr>`
  }
  for (let i = 0; i < deductionLen; i++) {
    let name = '';
    let realAmount = '';
    if (isShowDeductionRow(data.deductions[i])) {
      name = data.deductions[i].name == "pf_employee" ? "PF" : data.deductions[i].name == "esi_employee" ? "ESI" : data.deductions[i].payslip_name;
      realAmount = data.deductions[i].real;
      totalDeduction += data.deductions[i].real;
      earningDeductionTr = earningDeductionTr.replace(`##DEDUCTION_NAME_${count}##`, name);
      earningDeductionTr = earningDeductionTr.replace(`##DEDUCTION_AMOUNT_${count}##`, realAmount);
      count += 1;
    }

  }

  for (let i = 0; i < extraFixedRows - 2; i++) {
    let style = 'border-top: 1px solid #fff; border-bottom: 1px solid #fff;';
    if (i === 0 || i === (extraFixedRows - 1)) style = '';
    earningDeductionTr += `<tr style="${style}"><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>`;
  }

  const netPayInWords = convertAmountToWords(data?.take_home?.real || 0);
  const salaryMonth = data.MONTH ? moment(`${data.MONTH}-01`).format('MMM-YYYY') : '';
  slipHtml = slipHtml.replace('#EMP_ID#', data.emp_id || "")
    .replace('#EMP_NAME#', data.name || "")
    .replace('#PF_NO#', data.pf_no || "0")
    .replace('#ESI_NO#', data.esic_no || "0")
    .replace('#PAY_DAYS#', data.present_days || 0)
    .replace('#PRESENT_DAYS#', data.total_days || 0)
    .replace('#PAY_DAYS#', data.present_days || "")
    .replace('#DOJ#', data.joining_date || "")
    .replace('#DESIGNATION#', data.designation || "")
    // .replace('#PROCESS#', data.PROCESS || "")
    .replace('#DEPARTMENT#', data.department || "")
    .replace('#LOCATION#', data.location || "")
    .replace('#BANK_ACC#', data.bank_account_no || "")
    .replace('#IFSC#', data.ifsc_code || "")
    .replace('#PAN_NO#', data.pan_no || "")
    .replace('#PAY_MODE#', data?.PAY_MODE || "")
    .replace('#DOB#', data.dob || "")
    .replace('#UAN_NO#', data.uan_no || "")
    .replace('#ABSENT_DAYS#', data.ABSENT_DAYS || 0)
    .replace('#AADHAR#', data?.aadhar_no || "")
    .replace('#MONTH#', data?.year_mon || "")
    .replace('#EARNINGS_DEDUCTIONS#', earningDeductionTr)
    .replace('#TOTAL_ER_GROSS#', grossEarning)
    .replace('#TOTAL_ER_AMOUNT#', monthlyGrossEarning)
    .replace('#TOTAL_DD_AMOUNT#', totalDeduction)
    .replace('#NET_PAY#', data?.take_home?.real)
    .replace('#NET_PAY_IN_WORDS#', netPayInWords)
  return slipHtml;
}


const generatePDFPassword = (data) => {
  const { emp_name, doj } = data;
  const formattedName = emp_name.replace(/\s+/g, ''); // Remove all spaces
  const pdfpwd = formattedName.slice(0, 3).toUpperCase() + moment(doj).format("MMYYYY");
  //const pdfpwd = emp_name.trim().slice(0,3).toUpperCase() + moment(doj).format("MMYYYY");
  return pdfpwd;
}



const convertAmountToWords = (amount) => {
  const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const number = parseFloat(amount).toFixed(2).split(".");
  const num = parseInt(number[0]);
  const digit = parseInt(number[1]);
  //console.log(num);
  if ((num.toString()).length > 9) return 'overflow';
  const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  const d = ('00' + digit).substr(-2).match(/^(\d{2})$/);;
  if (!n) return; var str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
  str += (n[5] != 0) ? (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Rupee ' : '';
  str += (d[1] != 0) ? ((str != '') ? "and " : '') + (a[Number(d[1])] || b[d[1][0]] + ' ' + a[d[1][1]]) + 'Paise ' : 'Only!';
  return str;
}

const offerLetter = function (details, recruiter) {
  let letterHtml = fs.readFileSync(pathTemplate + '\offer_letter_qds.html', 'utf8');
  const earnings = details?.earnings;
  const deductions = details?.deductions;
  const gross = details?.gross;
  const total_employee = details?.total_employee;
  const total_employer = details?.total_employer;
  const ctc_A = details?.ctc;
  const bonus = details?.bonus;
  const total_ctc = details?.total_ctc;
  const take_home = details?.take_home;
  const benefits = details?.benefits || [];
  let table = ``;
  for (let i = 0; i < earnings.length; i++) {
    table = table + `<tr> 
      <td style="width:40%;font-size: 10px;">${earnings[i]?.payslip_name} </td> <td align='center' style="font-size: 10px;">${earnings[i]?.monthly} </td> <td align='center' style="font-size: 10px;">${earnings[i]?.yearly} </td> </tr>`
  }
  table = table + `<tr style="background-color: #D8E4BC">
       <td style="width:40%;font-size: 11px; font-weight: 700;">Gross </td>
       <td align='center' style="width:40%;font-size: 11px;"><b> ${gross?.monthly}</b></td>
       <td align='center' style="width:40%;font-size: 11px;"><b> ${gross?.yearly}</b></td>
        </tr>
        <tr>`;
  if (details?.is_pf == true) {
    table = table + `<td style="width:40%;font-size: 11px; font-weight: 700;">Employee's contribution </td>
                    <td></td>
                    <td></td>
                </tr>`;
    for (let i = 0; i < deductions.length; i++) {
      if (deductions[i].name.match(/employee/i)) {
        table = table + `<tr> 
          <td style="width:40%;font-size: 10px;">${deductions[i]?.payslip_name} </td> <td align='center' style="font-size: 10px;">${deductions[i]?.monthly} </td> <td align='center' style="font-size: 10px;">${deductions[i]?.yearly} </td> </tr>`
      }
    }
    table = table + `<tr>
        <td style="width:40%;font-size: 11px; font-weight: 700;">Total Employee's contribution </td>
          <td align='center' style="font-size: 11px;"><b> ${total_employee?.monthly}</b></td>
          <td align='center' style="font-size: 11px;"><b> ${total_employee?.yearly}</b></td>
          </tr>
          <tr>`
  }
  table = table + `<td style="width:40%;font-size: 11px; font-weight: 700;">Employer's contribution </td>
          <td></td>
          <td></td>
      </tr>`;
  for (let i = 0; i < deductions.length; i++) {
    if (deductions[i].name.match(/employer/i) || deductions[i].name.match(/gmc/i)) {
      table = table + `<tr> 
        <td style="width:40%;font-size: 10px;">${deductions[i]?.payslip_name} </td> <td align='center' style="font-size: 10px;">${deductions[i]?.monthly} </td> <td align='center' style="font-size: 10px;">${deductions[i]?.yearly} </td> </tr>`
    }
  }

  table = table + `<tr>
        <td style="width:40%;font-size: 11px; font-weight: 700;">Total Employer's contribution </td>
          <td align='center' style="font-size: 11px;"><b> ${total_employer?.monthly}</b></td>
          <td align='center' style="font-size: 11px;"><b> ${total_employer?.yearly}</b></td>
          </tr>
          <tr>
          <td style="width:40%;font-size: 10px;">CTC </td>
          <td align='center' style="font-size: 10px;"> ${ctc_A?.monthly} </b></td>
          <td align='center' style="font-size: 10px;"> ${ctc_A?.yearly} </b></td>
        </tr>`
  if ((details?.is_include_bonus == 1) || (details?.is_include_bonus_new == 1)) {
    table = table + `<tr>
        <td style="width:40%;font-size: 10px;">BONUS</td>
        <td align='center' style="font-size: 10px;"> ${bonus?.monthly} </b></td>
        <td align='center' style="font-size: 10px;"> ${bonus?.yearly} </b></td>
      </tr>`}
  table = table + `<tr style="background-color: #90EE90;">
      <td style="width:40%;font-size: 11px; font-weight: 700;">Total CTC </td>
          <td align='center' style="font-size: 11px;"><b> ${total_ctc?.monthly}</b></td>
          <td align='center' style="font-size: 11px;"><b> ${total_ctc?.yearly}</b></td>
        </tr>
        <tr style="background-color: #90EE90;">
      <td style="width:40%;font-size: 11px; font-weight: 700;">Take Home </td>
          <td align='center' style="font-size: 11px;"><b> ${take_home?.monthly}</b></td>
          <td align='center' style="font-size: 11px;"><b> ${take_home?.yearly}</b></td>
        </tr>
    `;
  for (let i = 0; i < benefits.length; i++) {
    table = table + `<tr>
      <td colspan="3" style="width:40%;font-size: 11px; font-weight: 700;">** ${benefits[i]}</td>
  </tr>`
  }
  letterHtml = letterHtml.replace('#CANDIDATE_NAME#', details.name)
    .replace('#CANDIDATE_NAME#', details?.name || "")
    .replace('#CURRENT_DATE#', moment().format("DD-MM-YYYY"))
    .replace('#DESIGNATION#', details?.designation || "")
    .replace('#DESIGNATION#', details?.designation || "")
    .replace('#LOCATION#', details?.location || "")
    .replace('#LOCATION#', details?.location || "")
    .replace('#JOINING_DATE#', moment(details?.joining_date).format("DD-MM-YYYY") || moment(details?.joining_date).format("DD-MM-YYYY"))
    .replace('#DEPARTMENT#', details?.department || "")
    .replace('#RECRUITER#', recruiter || "")
    .replace('#RECRUITER#', recruiter || "")
    .replace('#NOTICE#', details.notice_period || 30)
    .replace('#PROBATION#', numberToWords(details?.probation_period) || "three")
    .replace('#PROBATION#', numberToWords(details?.probation_period) || "three")
    // .replace('#GROSS_AMT#', numberToWords(details.gross_amount) || "one")
    .replace('#TABLE#', table || "");
  return letterHtml;
}


const numberToWords = (value) => {
  const arr = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
  return arr[value];
}

const getBaseUrl = () => {
  const baseUrl = process.env.BASEURL;

  switch (process.env.NODE_ENV) {
    case 'development':
    case 'production':
      return baseUrl;
    default:
      return baseUrl; 
  }
};

exports.calculateAverageRating = async (result) => {
  let averageRating = 0;
  let newCount = 0;
  let kra_rating_type = 0;
  await result.forEach(em => {
    kra_rating_type = em.kra_rating_type;

    if (
      parseInt(em.rating_remark) &&
      em.kpi_weightage &&
      em.kra_rating_type == 5
    ) {
      newCount =
        parseInt(newCount) +
        parseInt(em.rating_remark) * parseInt(em.kpi_weightage);
    } else if (
      parseInt(em.rating_remark) &&
      em.kpi_weightage &&
      em.kra_rating_type == 6
    ) {
      newCount =
        parseInt(newCount) +
        (parseInt(em.rating_remark) * parseInt(em.kpi_weightage)) /
        parseInt(em.kpi_target);
    }
  });

  averageRating = await findFinalRatingAverage(newCount, kra_rating_type);
  return averageRating;
};

const findFinalRatingAverage = (count, type) => {
  if (type == 5) {
    if (count >= 0 && count <= 100) return 0;
    if (count > 100 && count <= 199) return 1;
    if (count >= 200 && count <= 299) return 2;
    if (count >= 300 && count <= 399) return 3;
    if (count >= 400 && count <= 449) return 4;
    if (count >= 450) return 5;
  } else if (type == 6) {
    if (count <= 80) return 0;
    if (count > 80 && count < 86) return 1;
    if (count >= 86 && count <= 95) return 2;
    if (count > 95 && count <= 100) return 3;
    if (count > 100 && count <= 110) return 4;
    if (count > 110) return 5;
  } else {
    return 0;
  }
};

const requestContext = {
  run: (data, callback) => {
    // console.log("Data", data)
    asyncLocalStorage.run(data, callback);
  },
  get: () => {
    // console.log("hello1",asyncLocalStorage.getStore())
    return asyncLocalStorage.getStore();
  },
};

const getDb = () => {
  const context = requestContext.get() ;
  // if (!context || !context.db) {
  //   throw new Error('Database connection not found in context');
  // }
  return context?.db || null;
};

module.exports = {
  getSessionData,
  getServiceResFormat,
  decryptValue,
  getFindPagination,
  getAggregatePagination,
  getDatesBetweenDates,
  is_Sunday,
  is_Saturday,
  isWeekend,
  isWeekOffDay,
  is_sunday,
  count_of_saturday,
  isSandwichPolicy,
  getShiftDetails,
  getEmployeeOffs,
  getShiftDetailsDateWise,
  isExistLeave,
  removeSpecialCharacters,
  toTitleCaseLowerCase,
  checkAttendanceStatus,
  decodeCharacters,
  decodeRules,
  createFolder,
  monthlyAttendance,
  newRegimeRate,
  oldRegimeRate,
  checkAttendanceWithStatus,
  calculateNewRegimeTax,
  calculateOldRegimeTax,
  getFinancialMonth,
  convertToSnakeCase,
  generateSalarySlipPDF,
  generatePDFPassword,
  offerLetter,
  getBaseUrl,
  requestContext,
  getDb
};