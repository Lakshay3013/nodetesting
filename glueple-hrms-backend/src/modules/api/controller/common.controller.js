const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const { successResponse, errorResponse, encryptPassword } = require('../../../helpers/index.js');
const common = require('../../../config/constants.js');
const { messages,appConstants } = require('../../../config/constants.js');
const { getServiceResFormat } = require('../utils/appHelper.js')
const {formatExcelDate, currentDate, valueOfData, currentDateTOString} = require('../utils/dateTimeHelper.js')
const XLSX = require('xlsx');
const path = require('path');
const mongoose = require('mongoose');
const { employeeService, attendanceService } = require('../services/index.js');
const axoisHelper = require('../../../helpers/axois.js');
const filePath = path.join(__dirname, '..', '..', '..', '..', 'public/');
const qs = require('qs');
const moment = require("moment")

const getAppConstantData = catchAsync(async (req, res) => {
  const response = getServiceResFormat();
  response.data = common.appConstants;
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK);
});

const getDateConstant = catchAsync(async (req, res) => {
  const response = getServiceResFormat();
  const result = [];
  for (let i = 1; i <= 31; i++) {
    result.push({ id: i, label: i, value: i });
  }
  response.data = result;
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK);
});

const getConstantByCategorySubcategory = catchAsync(async (req, res) => {
  const {category, subcategory} = req.query;
  const response = getServiceResFormat();
  if(subcategory){
    const data = common[category];
    response.data = data[subcategory] || [];
  }else{
    response.data = common[category] || [];
  }
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK);
});

const getEmployeeDetailsByExcel = catchAsync(async(req, res)=>{
  const response = getServiceResFormat();
  const wb = XLSX.readFile(`${filePath}/employee_details/employee_details.csv`);
  const ws = wb.Sheets["Sheet1"];
  const data = XLSX.utils.sheet_to_json(ws);
  console.log("dfsdf", data.length)
  let obj = {}
  let createEmployeeData
  for(let i =0; i<data.length;i++){
    const user = await employeeService.getSingleUser({ emp_id:  data[i]?.emp_id },{});
    if(!user.status){
    obj['password'] = await encryptPassword((data[i]?.random_string).toString() || 0);
    obj["account_status"] = data[i]?.account_status;
    obj['name'] = `${data[i]?.first_name} ${data[i]?.last_name}`
    obj['email'] = data[i]?.email
    obj['department_id'] = mongoose.Types.ObjectId("673c2d78ab960b1318a501f0")
    obj['designation_id'] = mongoose.Types.ObjectId("673c356eab960b1318a5027a")
    obj['position_id'] = mongoose.Types.ObjectId("673c3bdbab960b1318a505fb")
    obj['location'] = mongoose.Types.ObjectId('66ff907998f41a1cf85c6d35')
    obj['emp_id'] = data[i]?.emp_id
    obj['joining_date'] = formatExcelDate(data[i]?.joining_date)
    obj['notice_period'] = data[i]?.notice_period
    obj['salt'] = data[i]?.salt
    obj['role_id'] = mongoose.Types.ObjectId('673d7ead20b35998765d338d')
    obj['working_from'] = null
    obj['type'] = null
    obj['primary_company_id'] = null
    obj['primary_sub_company_id'] = null
    obj['company_ids'] = []
    obj["sub_company_ids"] = [],
    obj["candidate_id"] = null,
    obj["device_id"] = null,
    obj["installed_app_version"] = null,
    obj["app_platform"] = null,
    obj["fcm_token"] = null,
    obj["token"] = null,
    obj["login_attempt"] = null,
    obj["last_login"] = null,
    obj["dob"] = null,
    obj["gender"] = null,
    obj["marital_status"] = null,
    obj["personal_mobile"]  =data[i]?.mobile || 0,
    obj["personal_email"] = data[i]?.email || '',
    obj["esic_no"] = "",
    obj["uan_no"] = "",
    obj["pan_no"]= "",
    obj["pf_no"]= null,
    obj["aadhar_no"] = null,
    obj["is_aadhar_verified"] = false,
    obj["blood_group"]=null,
    obj["emergency_mobile"]= null,
    obj["present_address"]=null,
    obj["permanent_address"] ="jaipur",
    obj["present_city"]= "jaipur",
    obj["present_state"]="jaipur",
    obj["present_postal_code"] = "302001",
    obj["permanent_city"]= "jaipur",
    obj["permanent_state"]= "jaipur",
    obj["permanent_postal_code"]= "302018",
    obj["fathers_name"]= "test1",
    obj["mothers_name"]= "test2",
    obj["fathers_dob"]= "02/02/85",
    obj["mothers_dob"]="02/01/86",
    obj["education_details"]= [],
    obj["ifsc_code"]= null,
    obj["bank_name"]= null,
    obj["branch_name"]= null,
    obj["bank_account_holder_name"]= null,
    obj["bank_account_no"]= null,
    obj["nominee_name"]= null,
    obj["relation_with_nominee"]= null,
    obj["linkedin_id"]= null,
    obj["facebook_id"]= null,
    obj["twitter_id"]= null,
    obj["instagram_id"]= null,
    obj["work_experience_details"]= [],
    obj["reference_details"]= [],
    obj["accepted_policies"]= null,
    obj["branch_office"]= null,
    obj["mobile"] =data[i]?.mobile || 0,
    obj["additional_family_details"] = {},
    obj["additional_personal_details"]= {}
    createEmployeeData = await employeeService.createEmployee(obj);
    }
  }
  response.data =  createEmployeeData
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK);

}) 

const checkInCheckOutMachine = catchAsync(async (req, res) => {
  const response = getServiceResFormat();
  let {emp_id} = req.query
  const getRawEntryData = await checkInCheckOutMachineFunction({emp_id :emp_id === undefined ? '' :emp_id})
  // console.log("dfsdfsdf", getRawEntryData)
  response.data = getRawEntryData
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK);
});

const checkInCheckOutMachineFunction = async(params)=>{
  const today = currentDate();
  const {emp_id} = params
  try {
    let deleteData = {
      device_from: 'machine',
      punch_time: currentDateTOString()
    }
    if(emp_id){
      deleteData = {
        emp_code: emp_id,
        device_from: 'machine',
        punch_time: currentDateTOString()
      }
    }
    const [userResponse, deleteRawEntryData] = await Promise.all([
      employeeService.getAllEmployee({}),
      attendanceService.deleteRawEntryData(deleteData)
    ]);

    // Convert employees to a Map for quick lookups
    const userMap = new Map((userResponse.status ? userResponse.data : []).map(emp => [emp.emp_id, emp._id]));

    // Construct API query
    const queryString = new URLSearchParams({
      emp_id: emp_id,
      type: "attendance_logs",
      start_date: encodeURIComponent(today),
      end_date: encodeURIComponent(today)
    }).toString();

    const apiRes = await axoisHelper.getLiveDBdata({
      url: `http://glueple.com:3002/rest_api/get-live-data?${queryString}`
    });

    let attendanceData = [];
    if (apiRes?.code === 200 && apiRes?.data?.length) {
      attendanceData = apiRes.data
        .filter(data => userMap.has(data.employeeNoString)) 
        .map(data => ({
          major: data.major,
          minor: data.minor,
          punch_time: data.time, 
          emp_id: mongoose.Types.ObjectId(userMap.get(data.employeeNoString)),
          log_type: data.attendenceStatus,
          serial_no: data.serialNo,
          label: data.label,
          device_from: 'machine',
          emp_code: data.employeeNoString,
          punch_address: data.ip_address,
          created_at:currentDateTOString()
        }))
        .sort((a, b) => valueOfData(a.punch_time) - valueOfData(b.punch_time));
    }
    const rawEntryData = await attendanceService.bulkUpdateRawEntry(attendanceData);

  return rawEntryData
  } catch (error) {
    return error
  }
}



module.exports = {
  getAppConstantData,
  getDateConstant,
  getConstantByCategorySubcategory,
  getEmployeeDetailsByExcel,
  checkInCheckOutMachine,
  checkInCheckOutMachineFunction,
};