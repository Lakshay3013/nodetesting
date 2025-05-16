const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const {payrollService,attendanceService,shiftManagementService,employeeService, leaveService, approvalManagementService, roleService, approverService} = require('../services');
const { successResponse, errorResponse,validateFormula } = require('../../../helpers');
const attendanceController = require('./attendance.controller.js');
const { messages } = require('../../../config/constants.js');
const { getSessionData,getShiftDetails ,toTitleCaseLowerCase, getServiceResFormat,decodeCharacters,decodeRules, checkAttendanceStatus, monthlyAttendance,getHierarchy, calculateOldRegimeTax, calculateNewRegimeTax, createFolder, generateSalarySlipPDF, createPDF, addPasswordToPDF, offerLetter, getBaseUrl} = require('../utils/appHelper.js');
const {convertDateByMoment,currentDate, getMonthStartAndEnd, getNumberOfDaysInMonth, addInMomentDate, countOfSaturday, filterMonth} = require('../utils/dateTimeHelper.js')
const mongoose = require('mongoose');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const pdf = require('html-pdf-node');


//attendance tracking api
const getEmployeeDetailsByPayDays = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    const {department_id,designation_id,employee_ids,month_year,page,limit} = req.body
    // let filter = {
    //     department_id:department_id ? mongoose.Types.ObjectId(department_id) : '',
    //     designation_id:designation_id ? mongoose.Types.ObjectId(designation_id) : '',
    //     _id:{$in:employee_ids?.map(mongoose.Types.ObjectId(item)) || []}
    // }
    const employeeDetails = await payrollService.getEmployeeDetails({},{page,limit})
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, employeeDetails, httpStatus.OK);
})
const getAttendanceStatus = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    const {start_date,end_date, emp_id} = req.body
    let attendance_date = {
        $gte: convertDateByMoment(start_date,'YYYY-MM-DD'),
        $lt: convertDateByMoment(end_date,'YYYY-MM-DD')
      }
    const attendanceData = await attendanceService.getMonthlyAttendance({ emp_id: mongoose.Types.ObjectId(emp_id), attendance_date: attendance_date })
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, attendanceData, httpStatus.OK);
})

const updateAttendance = (date, updated_status,shiftDetails) => {
    let updateFields = {};
    let first_check_in_time = `${date} ${shiftDetails?.shift_start_time}:00`
    let last_check_out_time = `${date} ${shiftDetails?.shift_end_time}:00`
    let day_of_week = moment(date).format('dddd')
    if (updated_status === 'PR') {
        updateFields = {
            first_half_status: 'PR',
            second_half_status: 'PR',
            first_check_in_time: first_check_in_time,
            last_check_out_time: last_check_out_time,
            attendance_status: 'PR',
            day_of_week :day_of_week
        };
    } else if (updated_status === 'FHP') {
        updateFields = {
            first_half_status: 'PR',
            second_half_status: 'AB',
            first_check_in_time: first_check_in_time,
            last_check_out_time: last_check_out_time,
            attendance_status: 'FHP',
            day_of_week :day_of_week
        };
    } else if (updated_status === 'SHP') {
        updateFields = {
            first_half_status: 'AB',
            second_half_status: 'PR',
            first_check_in_time: first_check_in_time,
            last_check_out_time: last_check_out_time,
            attendance_status: 'SHP',
            day_of_week :day_of_week
        };
    } else if (updated_status === 'AB') {
        updateFields = {
            first_half_status: 'AB',
            second_half_status: 'AB',
            first_check_in_time: null,
            last_check_out_time: null,
            attendance_status: 'AB',
            day_of_week :day_of_week
        };
    } else {
        updateFields = {
            first_half_status: updated_status,
            second_half_status: updated_status,
            first_check_in_time: null,
            last_check_out_time: null,
            attendance_status: updated_status,
            day_of_week :day_of_week
        };
    }
    return updateFields;
};

const updateAttendanceTracking = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    const { emp_id, attendance_date, updated_status, type, punch_in_time, punch_out_time } = req.body;
    const getDefaultShiftData = await shiftManagementService.getDefaultShiftData();
    const getActiveEmployees = await employeeService.queryUserForAttendance({ account_status: 'active', _id: mongoose.Types.ObjectId(emp_id) });
    if(!getActiveEmployees.status){
        return errorResponse(req, res, messages.alert.EMPLOYEE_ID, httpStatus.BAD_REQUEST);
    }
    const { shiftDetails } = getShiftDetails(getActiveEmployees?.data, getDefaultShiftData?.data, attendance_date, []);
    let updateStatus
    if (type == "present_absent") {
        const updateAttendanceData = updateAttendance(attendance_date, updated_status, shiftDetails);
        const getAttendanceData = await attendanceService.getMonthlyAttendance({ emp_id: mongoose.Types.ObjectId(emp_id), attendance_date: attendance_date });
        if (getAttendanceData.status) {
            updateStatus = await attendanceService.updateAttendance({ emp_id: mongoose.Types.ObjectId(emp_id), attendance_date: attendance_date }, updateAttendanceData);
        } else {
            updateAttendanceData['emp_id'] = mongoose.Types.ObjectId(emp_id);
            updateAttendanceData['attendance_date'] = attendance_date;
            updateStatus = await attendanceService.addAttendance(updateAttendanceData);
        }
    } else if (type == 'punchInTime_punchOutTime') {
        const employeeLogs = [];
        if (punch_in_time && punch_out_time) {
            employeeLogs.push({
                punch_time: punch_in_time,
                log_type: 'IN'
            });
            employeeLogs.push({
                punch_time: punch_out_time,
                log_type: 'OUT'
            });
        }
        let obj = {};
        const calculatedLogs = attendanceController.calculateAttendanceLogTime(employeeLogs, "IN/OUT", "", true, attendance_date);
        obj['duration'] = calculatedLogs?.totalWorkingTime || '';
        obj['total_working_hours'] = calculatedLogs?.totalRealWorkingTime || '';
        obj['total_break_time'] = calculatedLogs?.totalBreakTime || '';
        obj['first_check_in_time'] = calculatedLogs?.firstEntryTime || '';
        obj['last_check_out_time'] = calculatedLogs?.lastExitTime || '';
        obj['day_of_week'] = moment(attendance_date).format('dddd');
        const calculateStatus = attendanceController.calculateAttendanceStatus({ shiftDetails: shiftDetails, calculatedLogs });
        obj['first_half_status'] = calculateStatus?.firstHalfStatus;
        obj['second_half_status'] = calculateStatus?.secondHalfStatus;
        obj['attendance_status'] = calculateStatus?.attendanceStatus;
        updateStatus = await attendanceService.updateAttendance({ emp_id: mongoose.Types.ObjectId(emp_id), attendance_date: attendance_date }, obj);
    }
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, updateStatus, httpStatus.OK);
})

const updateAttendanceTrackingInBulk = catchAsync( async(req, res)=>{
    const user = getSessionData(req);
    const {emp_id, type, attendance_details} = req.body
    let attendance_date = {
        $gte: convertDateByMoment(attendance_details[0]?.attendance_date,'YYYY-MM-DD'),
        $lt: convertDateByMoment(attendance_details[attendance_details?.length - 1]?.attendance_date,'YYYY-MM-DD')
      }
    const attendanceData = await attendanceService.getMonthlyAttendance({emp_id: mongoose.Types.ObjectId(emp_id), attendance_date: attendance_date});
    let attendanceDetails = []
    if(attendanceData?.status){
        attendanceData?.data?.map(item=>{
            attendance_details.map(data =>{
                if(item.attendance_date === data.attendance_date){
                    if(item.attendance_status !== data.attendance_status || item.first_check_in_time !== data.first_check_in_time || item.last_check_out_time !== data.last_check_out_time){
                        attendanceDetails.push(data) 
                    }
                }
            })
        })
    }

    
})

const addLoans = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    let current_date = currentDate()
    const {employee_id, loan_type, amount, start_date, end_date, tenure_duration,installments} = req.body;
    if(start_date < current_date){
        return errorResponse(req, res, messages.alert.EFFECTIVE_DATE, httpStatus.BAD_REQUEST); 
    }
    const addLoans = await payrollService.addLoans({employee_id:mongoose.Types.ObjectId(employee_id),loan_type,amount,start_date,end_date,tenure_duration})
    if(addLoans.status){
        for(let i =0; i< installments.length;i++){
            let item = installments[i]
            const addLoanEmi = await payrollService.addLoanEmi({loan_id:addLoans.data.id,emi_amount:item.amount,paid_amount:amount,payment_date:item.date,installment_number:item.installment,statue:"pending"})
        }
    }
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, addLoans, httpStatus.OK);

})

const getLoans = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    const getLoans = await payrollService.getLoans({},req.query)
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getLoans, httpStatus.OK);
})


const addEarnings = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    req.body['name'] = toTitleCaseLowerCase(req.body.payslip_name);
    req.body['rules'] = decodeRules(req.body.rules)
    const addEarnings = await payrollService.addEarnings(req.body)
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, addEarnings, httpStatus.OK);
})

const updateEarning = catchAsync(async(req, res)=>{
    req.body['name'] = toTitleCaseLowerCase(req.body.payslip_name);
    const updateEarning = await payrollService.updateEarning({_id:mongoose.Types.ObjectId(req.body._id)},req.body)
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, updateEarning,httpStatus.OK)
})

const addDeductions = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    req.body['name'] = toTitleCaseLowerCase(req.body.payslip_name);
    req.body['rules'] = decodeRules(req.body.rules)
    const addDeductions = await payrollService.addDeductions(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, addDeductions, httpStatus.OK);
})

const updateDeductions = catchAsync(async(req, res)=>{
    req.body['name'] = toTitleCaseLowerCase(req.body.payslip_name);
    const updateDeduction = await payrollService.updateDeduction({_id:mongoose.Types.ObjectId(req.body._id)},req.body);
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA,updateDeduction,httpStatus.OK);
})

const getEarnings = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    const getEarnings = await payrollService.getEarnings({},req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getEarnings, httpStatus.OK);
})

const getDeductions = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    const getDeductions = await payrollService.getDeductions({},req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getDeductions, httpStatus.OK);
})

const addTaxSlabs = catchAsync(async(req, res)=>{
    const user = getSessionData(req)

})

const addEarningTypes = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    req.body['earning_type'] = toTitleCaseLowerCase(req.body.earning_type_name);
    
    const addEarnings = await payrollService.addEarningTypes(req.body);
    return successResponse(req ,res, messages.alert.SUCCESS_SAVE_DATA, addEarnings, httpStatus.OK);
})

const getEarningType = catchAsync(async(req,res)=>{
    const getEarningType = await payrollService.getEarningType({},req.parse);
    return successResponse(req, res,messages.alert.SUCCESS_GET_DATA, getEarningType,httpStatus.OK);
})

const getEarningTypeById = catchAsync(async(req, res)=>{
    const {id} = req.query
    const getEarning = await payrollService.getEarningTypeById({_id:mongoose.Types.ObjectId(id)});
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA,getEarning, httpStatus.OK)  
})

const updateEarningType = catchAsync(async(req, res)=>{
    const {_id}=req.body
    const updateEarningTypes = await payrollService.updateEarningType({_id:mongoose.Types.ObjectId(_id)},req.body)
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA,updateEarningTypes, httpStatus.OK)
})

const getAllEarningType = catchAsync(async(req, res)=>{
    const getAllEarningTypes = await payrollService.getAllEarningType({});
    return successResponse(req, res,messages.alert.SUCCESS_GET_DATA, getAllEarningTypes, httpStatus.OK) 
})

const addDeductionsType = catchAsync(async(req, res)=>{
    // const user = getAttendanceStatus(req);
    // req.body['created_by'] = user.id
    req.body['deduction_type'] = toTitleCaseLowerCase(req.body.earning_type_name);
    const addDeductions = await payrollService.addDeductionTypes(req.body);
    return successResponse(req,res, messages.alert.SUCCESS_SAVE_DATA, addDeductions, httpStatus.OK);

})
const getDeductionsType = catchAsync(async(req, res)=>{
    const getDeductionType = await payrollService.getDeductionsType({},req.parse)
    return successResponse(req, res,messages.alert.SUCCESS_GET_DATA, getDeductionType,httpStatus.OK)

})

const getDeductionsTypeById = catchAsync(async(req, res)=>{
    const {id} = req.query
    const getDeduction = await payrollService.getDeductionTypeById({_id:mongoose.Types.ObjectId(id)});
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA,getDeduction, httpStatus.OK)  
})

const updateDeductionType = catchAsync(async(req, res)=>{
    const {_id}=req.body
    const updateTypes = await payrollService.updateDeductionType({_id:mongoose.Types.ObjectId(_id)},req.body)
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA,updateTypes, httpStatus.OK)

})

const getAllDeductionType = catchAsync(async(req, res)=>{
    const getAllDeductionTypes = await payrollService.getAllDeductionType({});
    return successResponse(req, res,messages.alert.SUCCESS_GET_DATA, getAllDeductionTypes, httpStatus.OK) 
})

const getAllEarning = catchAsync(async(req, res)=>{
    const getAllEarning = await payrollService.getAllEarning({});
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA,getAllEarning, httpStatus.OK);
});

const getAllDeduction = catchAsync(async(req, res)=>{
   const getAllDeduction = await payrollService.getAllDeduction({});
   return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getAllDeduction, httpStatus.OK)
});
const generateSalaryTemplate = catchAsync(async (req, res) => {
    const response = getServiceResFormat();
    let { is_include_bonus, ctc, meal_allowance,template_id } = req.body;
    is_include_bonus = is_include_bonus == 1 ? 1 : 0;
    meal_allowance = meal_allowance == 1 ? 1 : 0;
    ctc = ctc ? parseInt(ctc) : 0;

    if (ctc < 0 || ctc > 5000000) {
        return errorResponse(req, res, messages.alert.VALID_CTC, httpStatus.BAD_REQUEST);
    }

    // Fetching earnings and deductions dynamically
    let getRules = {
        $elemMatch: {
            from: { $lte: ctc },
            to: { $gte: ctc }
        }
    }
    let optional = {
        rules: {
          $map: {
            input: "$rules",
            as: "rule",
            in: {
              from: { $toDouble: "$$rule.from" },
              to: { $toDouble: "$$rule.to" },
              amount: "$$rule.amount"
            }
          }
        }
      }
    let earnings = await payrollService.getEarning({ rules: getRules, is_active: true },optional);
    let deductions = await payrollService.getDeduction({ rules: getRules, is_active: true },optional);

    earnings = earnings.status ? earnings.data : [];
    deductions = deductions.status ? deductions.data : [];
    if(template_id){
        let getTemplate = await payrollService.getAllSalaryTemplate({_id:mongoose.Types.ObjectId(template_id)})
        getTemplate = getTemplate.status ? getTemplate.data : []
        earnings = decodeCharacters(getTemplate[0].earnings),
        deductions = decodeCharacters(getTemplate[0].deductions)
    }
    const result = await calculateSalary({ctc,earnings,deductions,is_include_bonus,meal_allowance})
    response.data = result;
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK)
});


const calculateCtc = catchAsync(async(req, res)=>{
    const response = getServiceResFormat()
    const {ctc,is_include_bonus,meal_allowance} = req.body;
    let earnings = req?.body?.earnings;
    let deductions = req?.body?.deductions;
    const result = await calculateSalary({ctc,earnings:decodeCharacters(earnings),deductions:decodeCharacters(deductions),is_include_bonus,meal_allowance});
    response.data = result;
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK);
});

const calculateSalary = async(params)=>{
    const {ctc,earnings,deductions,is_include_bonus,meal_allowance} = params;
    let allowances = ctc;
    let result = {};
    let gross = 0;
    let basic = 0;
    let isEsi = false;
    let isMeal = false;
    if (is_include_bonus) {
        let bonus = deductions.filter(item => item.name === 'bonus');
        let rules = bonus[0]?.rules;
        for (let i = 0; i < rules?.length; i++) {
            if (parseFloat(rules[i].from) <= ctc && parseFloat(rules[i].to) >= ctc) {
                let amount = eval(rules[i].amount);
                result["bonus"] = {
                    "payslip_name": "Bonus",
                    "name": bonus[0].name,
                    "value": bonus[0].value,
                    "value_in": bonus[0].value_in,
                    "monthly": Math.round(amount),
                    "yearly": Math.round(amount * 12)
                };
                allowances -= amount; 
            }
        }
    } else {
        result["bonus"] = {
            "payslip_name": "Bonus",
            "name": "bonus",
            "value": 0,
            "value_in": "fixed",
            "monthly": 0,
            "yearly": 0
        };
    }

    // Dynamically process earnings
    let earningsObj = [];
    for (let i = 0; i < earnings.length; i++) {
        let amount;
        let rules = earnings[i].rules;
        console.log("rules", rules)
        let name = earnings[i].name;
        // Dynamically calculate earnings based on its value_in
        if (rules.length > 0) {
            amount = eval(rules[0].amount);
        } else if (earnings[i].value_in === "fixed") {
            amount = eval(earnings[i].value);
        } else {
            amount = (eval(earnings[i].value) * basic) / 100;
        }

        // Handling specific cases like meal allowance
        if (name === "Meal Allowance" && meal_allowance === 0) {
            isMeal = true;
        } else {
            earningsObj.push({
                "payslip_name": earnings[i].payslip_name,
                "name": name,
                "value": earnings[i].value,
                "rules":earnings[i].rules,
                "value_in": earnings[i].value_in,
                "monthly": Math.round(amount),
                "yearly": Math.round(amount * 12)
            });
            allowances -= amount;
            gross += amount;
        }

        // If it's basic, update the basic value for further calculations
        if (name === "Basic") {
            basic = amount;
        }
    }

    result["earnings"] = earningsObj;

    // Handling deductions dynamically
    let deductionsObj = [];
    for (let i = 0; i < deductions.length; i++) {
        let amount;
        let rules = deductions[i].rules;

        if (deductions[i]?.name?.match(/esi/i)) {
            isEsi = true;
            continue;
        }

        if (rules.length > 0) {
            amount = eval(rules[0].amount);
        } else if (deductions[i].value_in === "fixed") {
            amount = eval(deductions[i].value);
        } else {
            amount = (eval(deductions[i].value) * basic) / 100;
        }

        deductionsObj.push({
            "payslip_name": deductions[i].payslip_name,
            "name": deductions[i].name,
            "value": deductions[i].value,
            "rules":deductions[i].rules,
            "value_in": deductions[i].value_in,
            "monthly": Math.round(amount),
            "yearly": Math.round(amount * 12)
        });

        if (deductions[i].include_in_ctc === 1) {
            allowances -= amount;
        }
    }

    result["deductions"] = deductionsObj;

    // Summing up earnings and deductions dynamically
    let totalGross = 0;
    let totalEmployee = 0;
    let totalEmployer = 0;
    let totalCTCA = 0;
    let totalCTC = 0;
    let takeHome = 0;

    // Summing up all totals dynamically
    Object.keys(result).forEach((key) => {
        if (key === "earnings") {
            result[key].forEach((data1) => {
                totalGross += data1.monthly;
                totalCTCA += data1.monthly;
            });
        } else if (key === "deductions") {
            result[key].forEach((data1) => {
                if (data1.name.match(/employee/i)) {
                    totalEmployee += data1.monthly;
                } else {
                    totalEmployer += data1.monthly;
                    totalCTCA += data1.monthly;
                }
            });
        } else if (key === "bonus") {
            totalCTC += result[key].monthly;
        }
    });

    totalCTC += totalCTCA;
    takeHome = totalGross - totalEmployee;

    result["ctc"] = { "payslip_name": "CTC A", "monthly": totalCTCA, "yearly": totalCTCA * 12 };
    result["gross"] = { "payslip_name": "Gross", "monthly": totalGross, "yearly": totalGross * 12 };
    result["total_employee"] = { "payslip_name": "Total Employee Contribution", "monthly": totalEmployee, "yearly": totalEmployee * 12 };
    result["total_employer"] = { "payslip_name": "Total Employer Contribution", "monthly": totalEmployer, "yearly": totalEmployer * 12 };
    result["total_ctc"] = { "payslip_name": "Total CTC", "monthly": totalCTC, "yearly": totalCTC * 12 };
    result["take_home"] = { "payslip_name": "Take Home", "monthly": takeHome, "yearly": takeHome * 12 };
    return result;
};


const createSalaryTemplate = catchAsync(async(req,res)=>{
    const user = getSessionData(req);
    req.body["created_by"] = user?.id
    const getAllSalaryTemplate = await payrollService.getAllSalaryTemplate({'template_name':req.body["template_name"]});
    if(getAllSalaryTemplate.status){
        return errorResponse(req, res, messages.alert.TEMPLATE_NAME_EXIST, httpStatus.BAD_REQUEST); 
    }
    const saveTemplate = await payrollService.saveTemplate(req.body)
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, saveTemplate, httpStatus.OK);
});

const getSalaryTemplate = catchAsync(async(req, res)=>{
    const getSalaryTemplate = await payrollService.getSalaryTemplate({},req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getSalaryTemplate, httpStatus.OK);
})

const getAllSalaryTemplate = catchAsync(async(req, res)=>{
    const getAllSalaryTemplate = await payrollService.getAllSalaryTemplate({});
    return successResponse(req, res,messages.alert.SUCCESS_GET_DATA, getAllSalaryTemplate, httpStatus.Ok);
})
const getAllSalaryTemplateById = catchAsync(async(req, res)=>{
    const getAllSalaryTemplate = await payrollService.getAllSalaryTemplate({_id:mongoose.Types.ObjectId(req.query._id)});
    return successResponse(req, res,messages.alert.SUCCESS_GET_DATA, getAllSalaryTemplate, httpStatus.Ok);
})

const updateSalaryTemplate = catchAsync(async(req, res)=>{
    const {_id}=req.body
    const updateTypes = await payrollService.updateSalaryTemplate({_id:mongoose.Types.ObjectId(_id)},req.body)
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA,updateTypes, httpStatus.OK)
})

const addEmployeeSalary = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    req.body['created_by'] = user?.id;
    const addEmployeeSalary = await payrollService.addEmployeeSalary(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, addEmployeeSalary,httpStatus.OK);
})

const getEmployeeSalary = catchAsync(async(req, res)=>{
    const getSalary = await payrollService.getEmployeeSalary({});
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getSalary, httpStatus.OK);
})

const getAllEmployeeSalary = catchAsync(async(req, res)=>{
    const filter = req.query._id ? {employee_id:mongoose.Types.ObjectId(req.query._id)} : {}
    const getAllSalary = await payrollService.getAllEmployeeSalary(filter);
    return successResponse(req, res,messages.alert.SUCCESS_GET_DATA, getAllSalary, httpStatus.Ok);
})

const updateEmployeeSalary = catchAsync(async(req, res)=>{
    const {_id}=req.body
    const updateTypes = await payrollService.updateEmployeeSalary({_id:mongoose.Types.ObjectId(_id)},req.body)
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA,updateTypes, httpStatus.OK)
})



const addArrears = catchAsync(async(req, res)=>{
    const response = getServiceResFormat();
    const user = getSessionData(req);
    req.body["created_by"] = user?.id

    const {name,year_mon,employees,arrear_for,description  } = req.body
    const total_days = getNumberOfDaysInMonth(arrear_for)
    if(!employees.length){
        return errorResponse(req, res, messages.alert.SELECT_EMPLOYEE, httpStatus.BAD_REQUEST);
    }
    let getArrears = await payrollService.getArrear({arrear_for:arrear_for})
    if(getArrears.status){
        return errorResponse(req, res, messages.alert.ARREAR_STATUS, httpStatus.BAD_REQUEST);
    }
    const employeeIdsObjectId = employees.length == 0 ? [] : employees?.map(id => mongoose.Types.ObjectId(id._id));
    let employee_id = {
        ...(employeeIdsObjectId.length > 0 ? { $in: employeeIdsObjectId } : {})}
    let getEmployeeSalary = await payrollService.getAllEmployeeSalary({employee_id:employee_id})
    getEmployeeSalary = getEmployeeSalary.status ? getEmployeeSalary.data : []
    //calculate Arrears
    let employeeSalary = []
    for(let i = 0; i<employees.length; i++){
        let data = employees[i]
        let salaryDetails = getEmployeeSalary.filter(item => item.employee_id.toString() == data._id.toString())
        let salary = calculateSalaryAmount({result:salaryDetails[0],present:data?.pay_days,totalMonthDays:total_days});
        employeeSalary.push({
            "name":data.name,
            "emp_code":data.emp,
            'ctc':salary.ctc,
            "bonus":salary.bonus,
            "gross":salary.gross,
            "total_employee":salary.total_employee,
            "total_employer":salary.total_employer,
            "total_ctc":salary.total_ctc,
            "take_home":salary.take_home,
            "earnings":salary.earnings,
            "employee_id":salary.employee_id,
            "deductions":salary.deductions,
            "present":data.pay_days,
            "total_days":total_days,
            "value":data._id,
            "label":data.name
        })
    }
    const addArrears = await payrollService.addArrears({name,year_mon,arrear_for,description,employees:employeeSalary,})
    if(addArrears.status){
    for(let i = 0; i<employees.length; i++){
        let data = employees[i]
        let updateData = await payrollService.updateEmployeeSalary({employee_id:data._id},{arrear_id:addArrears.data._id})
    }
}
    response.data = addArrears
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, response, httpStatus.OK);
})

const getArrears = catchAsync(async(req, res)=>{
    const getArrears = await payrollService.getArrears({},req.query)
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA,getArrears, httpStatus.Ok)
})

const checkRuleFormula = catchAsync(async (req, res) => {
    const { formula } = req.body;
    const response = getServiceResFormat();
    const isValidExpression = validateFormula(formula);
    if (isValidExpression) {
        response.data = isValidExpression;
        return successResponse(req, res, messages.alert.VALID_EXPRESSION, response, httpStatus.OK);
    } else {
        return errorResponse(req, res, messages.alert.INVALID_EXPRESSION, httpStatus.BAD_REQUEST);
    }
})

const getAllEmployeeAssignStatus = catchAsync(async(req, res)=>{
    const { employee_ids, department_ids } = req.body;
    const employeeIdsObjectId = employee_ids?.length > 0 
        ? employee_ids.map(id => mongoose.Types.ObjectId(id)) 
        : [];
    let employee_id_filter = {};
    if (employeeIdsObjectId.length > 0) {
        employee_id_filter = { $in: employeeIdsObjectId };
    }
    
    const departmentIdsObjectId = department_ids?.length > 0 
        ? department_ids.map(id => mongoose.Types.ObjectId(id)) 
        : [];
    

    let department_id_filter = {};
    if (departmentIdsObjectId.length > 0) {
        department_id_filter = { $in: departmentIdsObjectId };
    }
    
    const queryFilter = {
        ...(employeeIdsObjectId.length > 0 && { _id: employee_id_filter }),
        ...(departmentIdsObjectId.length > 0 && { department_id: department_id_filter })
    };
    const getAllEmployee = await payrollService.getAllEmployeeAssignStatus(queryFilter, req.body);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getAllEmployee, httpStatus.OK);
})

const calculateEmployeeSalary = catchAsync(async (req, res) => {
    const { month, employee_ids } = req.body;
    const response = getServiceResFormat();
    const getMonthStartAndEndDate = filterMonth(month)
    const getMonthStartAndEnds = getMonthStartAndEnd(month);
    const employeeIdsObjectId = employee_ids.length == 0 ? [] : employee_ids?.map(id => mongoose.Types.ObjectId(id.id));
    let employee_id = {
        ...(employeeIdsObjectId.length > 0 ? { $in: employeeIdsObjectId } : {})
    }
    let attendanceData = await attendanceService.attendanceReport({ start_date: getMonthStartAndEnds.startDate, end_date: getMonthStartAndEnds.endDate, employeeIds: employeeIdsObjectId ? employeeIdsObjectId : [] });
    let getEmployee = await employeeService.queryUserByFilter({ _id: employee_id });
    let getEmployeeSalary = await payrollService.getAllEmployeeSalary({ employee_id: employee_id })
    let getAllLeaveType = await leaveService.getLeaveTypeList({ is_active: true });
    let leaveData = getAllLeaveType.status ? getAllLeaveType.data.map(item => item.short_name) : [];
    attendanceData = attendanceData.status ? attendanceData.data : []
    getEmployeeSalary = getEmployeeSalary.status ? getEmployeeSalary.data : []
    let getTaxSlab = await payrollService.getAllTaxSlab({})
    getTaxSlab = getTaxSlab.status ? getTaxSlab.data : []
    let getEmployeeInvestment = await payrollService.getInvestmentByEmployee({});
    getEmployeeInvestment = getEmployeeInvestment.status ? getEmployeeInvestment.data : []
    let salaryData = [];
    if (getEmployee.status) {
        getEmployee = getEmployee?.status ? getEmployee?.data : [];
        for (let i = 0; i < getEmployee.length; i++) {
            let salary;
            let tax;
            let arrear_days = 0;
            let item = getEmployee[i]
            const employeeAttendance = attendanceData.filter(data => data.employee_id.toString() == item._id.toString())
            let employeeSalary = getEmployeeSalary.filter(data => data.employee_id.toString() == item._id.toString())
            let getInvestment = getEmployeeInvestment.filter(data => data.employee_id.toString() == item._id.toString())
            let attendanceDetails = await monthlyAttendance(employeeAttendance, month, leaveData);
            if (employeeSalary.length) {
                salary = calculateSalaryAmount({ result: employeeSalary[0], present: attendanceDetails.length == 0 ? 0 : attendanceDetails[0]?.present_count || 0, totalMonthDays: attendanceDetails.length == 0 ? 0 : attendanceDetails[0]?.total_days || 0 });
                let present_days = attendanceDetails.length == 0 ? 0 : attendanceDetails[0].present_count || 0
                let total_days = attendanceDetails.length == 0 ? 0 : attendanceDetails[0].total_days || 0
                let employee_id = salary.employee_id
                let ctc = salary.ctc
                let bonus = salary.bonus
                let gross = salary.gross
                let total_employee = salary.total_employee
                let total_employer = salary.total_employer
                let total_ctc = salary.total_ctc
                let take_home = salary.take_home
                let is_hold = salary.is_hold
                let arrear_id = salary.arrear_id
                let earnings = salary.earnings
                let deductions = salary?.deductions
                if (salary) {
                    if (getInvestment.length) {
                        if (getInvestment[0].tax_regime == 'is_eligible_for_new') {
                            // tax = await calculateNewRegimeTax(salary,getTaxSlab,getInvestment)
                        } else if (getInvestment[0].tax_regime == 'is_eligible_for_old') {
                            // tax = await calculateOldRegimeTax(salary,getTaxSlab,getInvestment)
                        }
                        deductions = salary?.deductions || [];
                        deductions.push({
                            "payslip_name": "TDS",
                            "name": "tax",
                            "value": parseFloat(tax?.monthly_tax) || 0,
                            "value_in": "fixed",
                            "monthly": parseFloat(tax?.monthly_tax) || 0,
                            "yearly": parseFloat(tax?.monthly_tax) || 0,
                            "real": parseFloat(tax?.monthly_tax) || 0,
                            "is_optional": 1,
                        })
                        take_home["type1"] = "tax";
                        take_home["real"] = parseFloat(take_home["real"]) - (parseFloat(tax?.monthly_tax) || 0);
                        const getLoans = await payrollService.getLoansEmi({ employee_id: salary.employee_id, payment_date: { $gte: getMonthStartAndEndDate.startDate, $lt: getMonthStartAndEndDate.endDate } })
                        if (getLoans.status) {
                            let emiAmt = parseFloat(getLoans.data.loan_emi_details?.emi_amount);
                            emiAmt = Math.round(emiAmt);
                            deductions.push({
                                "payslip_name": "Loan",
                                "name": "loan",
                                "value": emiAmt,
                                "value_in": "fixed",
                                "monthly": emiAmt,
                                "yearly": emiAmt,
                                "real": emiAmt,
                                "is_optional": 1,
                            })
                            take_home["type2"] = "loan";
                            take_home["real"] = parseFloat(take_home["real"]) - parseFloat(emiAmt);
                        }
                        if (salary.arrear_id) {
                            let arrearAmt = 0;
                            const getArrear = await payrollService.getArrear({ _id: mongoose.Types.ObjectId(salary.arrear_id) })
                            const emp_data = getArrear?.status && getArrear?.data && getArrear?.data[0]?.employees && getArrear?.data[0]?.employees?.length ? getArrear?.data[0]?.employees : [];
                            for (let j = 0; j < emp_data.length; j++) {
                                if (salary[0]?.emp_user_id == emp_data[j]?.emp_id) {
                                    arrear_days = parseFloat(emp_data[j]?.present);
                                    arrearAmt = parseFloat(emp_data[j]?.take_home);
                                    take_home["real"] = parseFloat(take_home["real"]) + parseFloat(emp_data[j]?.take_home);
                                    gross["real"] = parseFloat(gross["real"]) + parseFloat(emp_data[j]?.take_home);
                                    earnings.push({
                                        "payslip_name": "Arrear",
                                        "name": "arrear",
                                        "value": parseFloat(arrearAmt),
                                        "value_in": "fixed",
                                        "monthly": parseFloat(arrearAmt),
                                        "yearly": parseFloat(arrearAmt),
                                        "real": parseFloat(arrearAmt),
                                        "is_optional": 1,
                                    })
                                }
                            }
                        }
                        take_home = salary?.take_home
                        earnings = salary?.earnings
                        gross = salary?.gross;
                    }
                }
                salaryData.push({
                    employee_id: employee_id,
                    type: 'monthly_salary',
                    present_days: present_days,
                    total_days:total_days,
                    year_mon: month,
                    is_hold: 1,
                    ctc: ctc,
                    earnings: earnings,
                    deductions: deductions,
                    bonus: bonus,
                    gross: gross,
                    total_employee: total_employee,
                    total_employer: total_employer,
                    total_ctc: total_ctc,
                    take_home: take_home,
                    arrear_id: arrear_id,
                    monthly_tax: tax?.monthly_tax || 0,
                    arrear_day: arrear_days
                });

            }
        }
    }
    const saveMonthlySalary = await payrollService.saveMonthlySalaryInBulk(salaryData)
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, saveMonthlySalary, httpStatus.OK);
})

const createPayRun = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    req.body["created_by"] = user?.id
    const createPayRun = await payrollService.createPayRun(req.body);
    return successResponse(res, res, messages.alert.SUCCESS_SAVE_DATA, createPayRun, httpStatus.OK)
    
})

const addPaySchedule = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    const {pay_period_start_date,pay_day} = req.body
    req.body["created_by"] = user?.id

    if(req.body.pay_day){
        req.body["pay_month"] = moment(`${pay_period_start_date}-${pay_day}`).format('YYYY-MM-DD')
        req.body['pay_date'] = moment(`${pay_period_start_date}-${pay_day}`).format('YYYY-MM-DD')
    }else{
        req.body["pay_month"] = ''
        req.body['pay_date'] = ''
    }
    const createPayRun = await payrollService.paySchedule(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, createPayRun, httpStatus.OK)
})

const updatePaySchedule = catchAsync(async(req,res)=>{
    const user = getSessionData(req);
    req.body["created_by"] = user?.id
    const {pay_period_start_date,pay_day} = req.body
    if(req.body.pay_day){
        req.body["pay_month"] = moment(`${pay_period_start_date}-${pay_day}`).format('YYYY-MM-DD')
        req.body['pay_date'] = moment(`${pay_period_start_date}-${pay_day}`).format('YYYY-MM-DD')
    }else{
        req.body["pay_month"] = ''
        req.body['pay_date'] = ''
    }
    req.body["pay_month"] = req.body.pay_date
    const createPayRun = await payrollService.updateSchedule({_id:mongoose.Types.ObjectId(req.body._id)},req.body);
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, createPayRun, httpStatus.OK)

})


const upcomingPayrolls = catchAsync(async(req, res)=>{
    const response = getServiceResFormat(); 
    const getPaySchedule = await payrollService.getPaySchedule({});
    if(!getPaySchedule.status){
        return errorResponse(req, res, messages.alert.PAY_SCHEDULE_ERROR, httpStatus.BAD_REQUEST);
    }
       const formattedPaySchedules = getPaySchedule.data.map((schedule) => {
        const rawSchedule = schedule.toObject(); 
        let currentPayDate = null
        if(schedule.pay_on === "last_working_day"){
            currentPayDate =  moment(schedule.pay_period_start_date).endOf('month');
        }else{
            currentPayDate = moment(schedule.pay_month);
        }
        const upcomingPeriods = [];
        for (let i = 0; i < 5; i++) {
            const startOfMonth = currentPayDate.add("month");
            const endOfMonth = currentPayDate.add("month");

            upcomingPeriods.push({
                pay_period_formatted: currentPayDate.format("MMMM-YYYY"),
                start_date_formatted: startOfMonth.format("DD/MM/YYYY"),
                end_date_formatted: endOfMonth.format("DD/MM/YYYY"),
                pay_date_formatted: endOfMonth.format("DD/MM/YYYY"),
            });
            currentPayDate.add(1, "month");
        }
        return {
            ...rawSchedule,
           upcoming_pay_periods: upcomingPeriods,
        };
    });
    response.data = formattedPaySchedules
    
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK);

})

const payRunNotification = catchAsync(async (req, res) => {
    const response = getServiceResFormat();

    const getPayRun = await payrollService.getPayRun({});
    let obj = {};

    if (!getPayRun.status || !getPayRun.data?.length) {  
        const getPaySchedule = await payrollService.getPaySchedule({});
        if (getPaySchedule.status && getPaySchedule.data?.length) {
            obj = {
                pay_month: convertDateByMoment(getPaySchedule.data[0].pay_period_start_date,'YYYY-MMM'),
                pay_date: addInMomentDate(getPaySchedule.data[0].pay_date,'1', 'month'),
                status: "Ready"
            };
        }
    } else {
        const payRunData = getPayRun.data[0];
        if(payRunData.status){
            obj = {
                pay_month: convertDateByMoment(addInMomentDate(payRunData.pay_month,'1', 'month'),"YYYY-MMM"),
                pay_date: addInMomentDate(payRunData.pay_date,'1', 'month'),
                status: payRunData.status === 0 ? "Ready" : payRunData.status === 1 ? "Draft" : "Completed"
            };

        }else{
            obj = {
                pay_month: convertDateByMoment(payRunData.pay_month,"YYYY-MMM"),
                pay_date: addInMomentDate(payRunData.pay_date,'1', 'month'),
                status: payRunData.status === 0 ? "Ready" : payRunData.status === 1 ? "Draft" : "Completed"
            };
        }

    }

    response.data = obj;
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK);
});


const getPayRunDashboard = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    const {month} = req.query
    const response = getServiceResFormat();
    const getSalary = await payrollService.getMonthSalary({year_mon:month});
    let total_net_pay = 0;
    let payroll_cost = 0;
    let hold_net_pay = 0;
    let hold_payroll_cost = 0;
    let tax = 0;
    let result = {}
    if(getSalary.status){
        for(let i=0;i<getSalary.data.length;i++){
            let item = getSalary.data[i]
            const take_home = item?.take_home ? item?.take_home : {}
            const ctc = item.total_ctc ? item?.total_ctc : {}
            if(item?.is_hold){
                hold_net_pay = take_home?.["real"] ? hold_net_pay + take_home?.["real"] : hold_net_pay;
                hold_payroll_cost = ctc?.["real"] ? hold_payroll_cost + ctc?.["real"] : hold_payroll_cost;
            }else{
                total_net_pay = take_home?.["real"] ? total_net_pay + take_home?.["real"] : total_net_pay;
                payroll_cost = ctc?.["real"] ? payroll_cost + ctc?.["real"] : payroll_cost;
                tax = tax + item?.monthly_tax
            }
        }
    }
    
    result["year_month"]=month;
    result["total_net_pay"]=total_net_pay;
    result["payroll_cost"]=payroll_cost;
    result["hold_net_pay"]=hold_net_pay;
    result["hold_payroll_cost"]=hold_payroll_cost;
    result["total_employees"]=getSalary.data.length;
    result["tax"] = tax

    response.data = result
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK);
})

const getPayRun = catchAsync(async (req, res) => {
    const { month } = req.query;
    const getMonthSalary = await payrollService.getPayRunMonthlySalary({ year_mon: month }, req.query);
    let emp_data = [];
  
    if (getMonthSalary.status) {
      for (let i = 0; i < getMonthSalary.data.data.length; i++) {
        let item = getMonthSalary.data.data[i];
        let paid_days = item?.present_days || 0;
        const earnings = item?.earnings || [];
        const gross = item?.gross || {};
        const deductions = item?.deductions || [];
        const take_home = item?.take_home || {};
        const ctc = item?.total_ctc || {};
        const total_employee = item?.total_employee || {};
        const total_employer = item?.total_employer || {};
        const bonus = item?.bonus || {};
  
        let total_earnings = 0;
        let total_deductions = 0;
  
        const emp = {
          employee_id: item?.employee_id,
          employee_name: item?.employee_name,
          emp_code: item?.emp_code,
          is_hold: item?.is_hold,
          paid_days: paid_days,
          total_employee: total_employee["real"] || 0,
          total_employer: total_employer["real"] || 0,
          bonus: bonus["real"] || 0,
          gross: gross["real"] || 0,
          net_pay: take_home["real"] || 0,
          taxes: item?.monthly_tax || 0,
          reimbursements: 0,
          arrear_day: item?.arrear_day,
          year_mon:item.year_mon,
          deductions: 0 // placeholder, will be overwritten below
        };
  
        // Add earnings
        for (let j = 0; j < earnings.length; j++) {
          const name = earnings[j]['name'];
          const value = earnings[j]['real'] || 0;
          emp[name] = value;
          total_earnings += value;
        }
  
        // Add deductions
        for (let j = 0; j < deductions.length; j++) {
          const name = deductions[j]['name'];
          const value = deductions[j]['real'] || 0;
          emp[name] = value;
          total_deductions += value;
        }
  
        // Final values
        emp.total_earnings = total_earnings;
        emp.total_deductions = total_deductions;
        emp.deductions = total_deductions;
  
        emp_data.push(emp);
      }
  
      getMonthSalary.data.data = emp_data;
    }
  
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getMonthSalary, httpStatus.OK);
  });
  

const approvePayroll = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    req.body["created_by"] = user?.id
    const checkPayRun = await payrollService.getPayRun({pay_month:req.body.pay_month})
    if(checkPayRun.status){
        return errorResponse(req, res, messages.alert.THIS_MONTH_APPROVAL_ALREADY, httpStatus.BAD_REQUEST);
    }
    const addPayrollMonthlySalary = await payrollService.approvePayroll(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, addPayrollMonthlySalary, httpStatus.OK);

})

const getPayRunHistory = catchAsync(async(req, res)=>{
    const getPayRunHistory = await payrollService.getPayRunHistory({},req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getPayRunHistory, httpStatus.OK);

})


const calculateSalaryAmount = (params) => {
    let { result, present, totalMonthDays } = params;
    
    let totalGross = 0;
    let totalEmployer = 0;
    let totalEmployee = 0;
    let totalCTCA = 0;
    let totalCTC = 0;
    let takeHome = 0;
    let basic = 0;
    let optionalValuesEr = 0;
    let optionalValuesDd = 0;

    result.bonus["real"] = Math.round((result.bonus?.monthly * present) / totalMonthDays);
  
    result.earnings.map((item, key) => {
      let amount = Math.round((item?.monthly * present) / totalMonthDays);
      if (item.is_optional == 1) {
        amount = item?.monthly || 0; 
        optionalValuesEr += amount;  
      } else {
        totalGross += amount;
        totalCTCA += amount;  
      }
      result.earnings[key]["real"] = amount; 
  
      if (item.name === 'basic') {
        basic = amount; 
      }
    });
  
    result.deductions.map((item, key) => {
      let amount = (item?.name?.match(/esi_employe/g)) 
        ? Math.ceil((item?.monthly * present) / totalMonthDays) 
        : Math.ceil((item?.monthly * present) / totalMonthDays);
  
      if (item.is_optional == 1) {
        amount = item?.monthly || 0; 
        optionalValuesDd += amount; 
      } else if (item?.name == 'gmc') {
        amount = item?.monthly; 
        totalEmployer += amount;
        totalCTCA += amount; 
      } else {
        if (item.name === 'pf_employee' || item.name === 'pf_employer') {
          if (basic >= 15000) {
            amount = item?.monthly; 
          } else {
            if (item.name === 'pf_employee') {
              amount = Math.round(basic * 0.12); 
            } else {
              amount = Math.round(basic * 0.13);
            }
          }
        }
        if (item.name === 'pf_employee' || item.name === 'esi_employee') {
          totalEmployee += amount; 
        } else {
          totalEmployer += amount;
          totalCTCA += amount; 
        }
      }
      result.deductions[key]["real"] = amount; 
    });
  
    totalCTC = totalCTC + totalCTCA; 
    takeHome = totalGross + optionalValuesEr - optionalValuesDd - totalEmployee; 
  
    result["ctc"]["real"] = totalCTCA;
    result["gross"]["real"] = totalGross + optionalValuesEr;
    result["total_employee"]["real"] = totalEmployee;
    result["total_employer"]["real"] = totalEmployer;
    result["total_ctc"]["real"] = totalCTC;
    result["take_home"]["real"] = takeHome;
    delete result._id
    return result; 
  };

  const addTaxSlab = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    req.body["created_by"] = user?.id
    const addTex = await payrollService.addTaxSlab(req.body)
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, addTex, httpStatus.OK)

  })

const updateTaxSlab = catchAsync(async(req, res)=>{
    const update = await payrollService.updateTaxSlab({_id:mongoose.Types.ObjectId(req.body._id)},req.body);
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA,update,httpStatus.OK);
    
})

const getTaxSlab = catchAsync(async(req, res)=>{
    const getTexSlab = await payrollService.getTaxSlab({},req.query)
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA,getTexSlab,httpStatus.OK);

})

const getAllTaxSlab = catchAsync(async(req, res)=>{
    const getAllTex = await payrollService.getAllTaxSlab({});
    return successResponse(req, res. messages.alert.SUCCESS_GET_DATA,getAllTex,httpStatus.OK)

})

const deleteTaxSlab = catchAsync(async(req, res)=>{
    const deleteTex = await payrollService.deleteTaxSlab({_id:mongoose.Types.ObjectId(req.body._id)});
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, deleteTex,httpStatus.OK)

})

const addEmployeeInvestment = catchAsync(async(req,res)=>{
    const user = getSessionData(req);
    req.body["created_by"] = user?.id;
    const addInvestment = await payrollService.addEmployeeInvestment(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, addInvestment, httpStatus.OK);
})

const getEmployeeInvestment = catchAsync(async(req, res)=>{
    const {_id } = req.query;
    const getEmployeeInvestment = await payrollService.getInvestmentByEmployee({employee_id:mongoose.Types.ObjectId(_id)});
    return successResponse(req, res,messages.alert.SUCCESS_GET_DATA, getEmployeeInvestment, httpStatus.Ok);
})

const updateEmployeeInvestment = catchAsync(async(req, res)=>{
    const updateInvestment = await payrollService.updateEmployeeInvestment({_id:mongoose.Types.ObjectId(req.body._id)},req.body)
    return successResponse(req,res, messages.alert.SUCCESS_UPDATE_DATA, updateInvestment, httpStatus.OK);
})

const deleteEmployeeInvestment = catchAsync(async(req, res)=>{
  const {_id} = req.body;
  const deleteEmployeeInvestment = await payrollService.deleteEmployeeInvestment({_id:mongoose.Types.ObjectId(_id)});
  return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, deleteEmployeeInvestment, httpStatus.OK)


})

const addInvestmentCategory = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    req.body["created_by"] = user.id;
    const addCategory = await payrollService.addInvestmentCategory(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA,addCategory,httpStatus.OK )
})

const getInvestmentCategory =catchAsync(async(req, res)=>{
    const getInvestmentCategory = await payrollService.getInvestmentCategory({});
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getInvestmentCategory, httpStatus.OK)
})

const getAllInvestmentCategory = catchAsync(async(req, res)=>{
    const getInvestmentCategory = await payrollService.getAllInvestmentCategory({},req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getInvestmentCategory, httpStatus.OK)
})

const updateInvestmentCategory = catchAsync(async(req, res)=>{
    const updateInvestmentCategory = await payrollService.updateInvestmentCategory({_id:mongoose.Types.ObjectId(req.body._id)},req.body);
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, updateInvestmentCategory, httpStatus.OK)

})
const deleteInvestmentCategory = catchAsync(async(req, res)=>{
    const deleteInvestmentCategory = await payrollService.deleteInvestmentCategory({_id:mongoose.Types.ObjectId(req.body._id)});
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, deleteInvestmentCategory, httpStatus.OK)
})

const addInvestmentSubCategory = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    req.body["created_by"] = user.id
    const addInvestmentSubCategory =await payrollService.addInvestmentSubCategory(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, addInvestmentSubCategory, httpStatus.OK);
})

const getInvestmentSubCategory = catchAsync(async(req, res)=>{
    const filter = req.query ? {category_id:mongoose.Types.ObjectId(req.query._id)} : {}
    const getInvestmentSubCategory = await payrollService.getInvestmentSubCategory(filter);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getInvestmentSubCategory, httpStatus.OK)
})

const getAllInvestmentSubCategory = catchAsync(async(req, res)=>{
    const getInvestmentSubCategory = await payrollService.getAllInvestmentSubCategory({},req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getInvestmentSubCategory, httpStatus.OK)
})

const updateInvestmentSubCategory = catchAsync(async(req, res)=>{
    const updateInvestmentCategory = await payrollService.updateInvestmentSubCategory({_id:mongoose.Types.ObjectId(req?.body?._id)},req.body);
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, updateInvestmentCategory, httpStatus.OK)

})

const deleteInvestmentSubCategory = catchAsync(async(req, res)=>{
    const deleteInvestmentCategory = await payrollService.deleteInvestmentSubCategory({_id:mongoose.Types.ObjectId(req.body._id)});
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, deleteInvestmentCategory, httpStatus.OK)
})

const getAllCategoryDetails =  catchAsync(async(req, res)=>{
    const {status} = req.query
    let filter = status ? status == 'is_eligible_for_new' ? {is_eligible_for_new:true,is_eligible_for_old:false} : {is_eligible_for_new:false,is_eligible_for_old:true} :{}
    const getAllCategory = await payrollService.getAllCategory(filter);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getAllCategory, httpStatus.OK)
}) 


const applyAdvance = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    req.body['created_by'] = user.id;
    const { installments } = req.body
    const getAdvanceHierarchy = getHierarchy(user, 'advance')
    if (!getAdvanceHierarchy.length) {
        return errorResponse(req, res, messages.alert.LEAVE_HIERARCHY_ERR, httpStatus.BAD_REQUEST);
    }
    const addAdvance = await payrollService.addAdvance(req.body)
    if (addAdvance.status) {
        for (let i = 0; i < installments.length; i++) {
            let item = installments[i]
            await payrollService.addAdvanceEmi({ advance_id: addAdvance?.data?.id, emi_amount: item.amount, paid_amount: amount, payment_date: item.date, installment_number: item.installment, statue: "pending" })
        }
    }
    if (addAdvance?.status) {
        let addAdvanceData = addAdvance?.data
        let approverData = {
            "type": "advance",
            "collection_id": addAdvanceData?._id || '',
            "approver_id": [],
        }
        getAdvanceHierarchy.forEach(async (data) => {
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
                }
            }
            if (approverId.length) {
                approverData["approver_id"] = approverId;
                await approverService.addApproverData(approverData)
            }
        })
    }
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, addAdvance, httpStatus.OK);

});

const getAdvanceApproval = catchAsync(async(req, res)=>{
    const user = getSessionData(req)
    const { parameter, status, limit, page } = req.query
    const getData = await payrollService.getAdvanceApproval({ approver_id: user?.id, type: parameter, action_type: status == '' ? 'pending' : status }, { limit, page, })
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getData, httpStatus.OK);
})

const getAdvanceRequest = catchAsync(async(req, res)=>{
    const user = getSessionData(req)
    const { parameter, status, limit, page } = req.query
    const getData = await payrollService.getAdvanceRequest({ approver_id: user?.id, type: parameter, action_type: status == '' ? 'pending' : status }, { limit, page, })
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getData, httpStatus.OK);
})

const approvalRejectAdvance = catchAsync(async(req, res)=>{
    const { _id, comment, action_type } = req.body;
    const user = getSessionData(req);
    const approverData = await approverService.queryApproverData({ _id: _id, action_type: { $in: ['approve', 'reject'] } });
    if (approverData?.status) {
        return errorResponse(req, res, messages.alert.LEAVE_ACTION, httpStatus.BAD_REQUEST);
    }

    const approvalReject = await approverService.updateApproverData({ _id: _id }, {
        $set: {
            comment: comment || '',
            action_type: action_type,
            action_by: user?.id,
            action_date: new Date(),
        }
    });
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, approvalReject, httpStatus.OK);
})

const employeeInvestmentProof = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    req.body['created_by'] = user.id;
    req.body['proof_of_Investment'] = req.file.filename
    const saveInvestment = await payrollService.employeeInvestmentProof(req.body)
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, saveInvestment,httpStatus.OK)
});

const getEmployeeInvestmentProof = catchAsync(async(req, res)=>{
    const filter = req.query.employee_id ? {employee_id:mongoose.Types.ObjectId(req.query.employee_id),investment_category_id:mongoose.Types.ObjectId(req.query.investment_category_id),financial_year_id:mongoose.Types.ObjectId(req.query.financial_year_id)} :{}
    const getEmployeeInvestment = await payrollService.getEmployeeInvestmentProof(filter);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA,getEmployeeInvestment,httpStatus.OK);
})

const updateEmployeeInvestmentProof = catchAsync(async(req, res)=>{
    const updateData = await payrollService.updateEmployeeInvestmentProof({_id:mongoose.Types.ObjectId(req?.body?._id)},req.body);
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, updateData, httpStatus.OK)

})

const deleteEmployeeInvestmentProof = catchAsync(async(req, res)=>{
    const deleteData = await payrollService.deleteEmployeeInvestmentProof({_id:mongoose.Types.ObjectId(req.body._id)});
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, deleteData, httpStatus.OK)
})

const commentInEmployeeInvestmentProof = catchAsync(async(req,res)=>{
    const updateData = await payrollService.updateEmployeeInvestmentProof({_id:mongoose.Types.ObjectId(req?.body?._id)},req.body);
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, updateData, httpStatus.OK)
})

const getEmployeeMonthlySalary = catchAsync(async(req, res)=>{
    const getSalary = await payrollService.getEmployeeMonthlySalary({employee_id:mongoose.Types.ObjectId(req.query.employee_id),year_mon:req.query.month})
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getSalary, httpStatus.OK);

})

const generateSalarySlip = catchAsync(async (req, res) => {
    const response = getServiceResFormat()
    const { employee_id, month, type } = req.query
    const folderPath = path.join(__dirname, '../../../../public/salary_slip');
    createFolder(folderPath)
    const baseUrl = getBaseUrl()
    const getEmployeeMonthlySalary = await payrollService.getEmployeeMonthly({ employee_id: mongoose.Types.ObjectId(employee_id), year_mon: month });
    if (!getEmployeeMonthlySalary.status || !getEmployeeMonthlySalary.data.length) {
        return errorResponse(req, res, messages.alert.SALARY_NOT_FOUND);
    }
    if(type){
    const user = getEmployeeMonthlySalary?.data[0]
    const html = generateSalarySlipPDF(user);

    const randomVal = Math.floor(Math.random() * 99999999);
    const pdfFileName = `salary_slip_${user.employee_id}_${moment(month).format("MMYYYY")}_${randomVal}.pdf`;
    const filePath = path.join(folderPath, pdfFileName);
  
    const file = { content: html };
    const options = { format: 'A4' };
  
    const pdfBuffer = await pdf.generatePdf(file, options);
    fs.writeFileSync(filePath, pdfBuffer);

    const fileUrl = `${baseUrl}/salary_slip/${pdfFileName}`;
    response.data = { filePath: fileUrl };
    }
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK)

})

const sendOfferLetter = catchAsync(async(req, res)=>{
    const response = getServiceResFormat();
    const folderPath = path.join(__dirname, '../../../../public/offer_letter');
    console.log("sdfsdfsdf",folderPath)
    createFolder(folderPath)
    const baseUrl = getBaseUrl()
    const {salary_id, employee_id,is_preview} = req.query
    const getEmployeeSalary = await payrollService.EmployeeSalary({_id:mongoose.Types.ObjectId(salary_id), employee_id:mongoose.Types.ObjectId(employee_id)})
    if (!getEmployeeSalary.status || !getEmployeeSalary.data.length) {
        return errorResponse(req, res, messages.alert.SALARY_NOT_FOUND);
    }
    let user = getEmployeeSalary.data[0]
    console.log("Hello1")
    const pdfData = offerLetter(user);
    console.log("Hello2",pdfData)
    const randomVal = Math.floor(Math.random() * 99999999);
    const pdfFileName = `salary_slip_${user.employee_id}_${randomVal}.pdf`;
    const filePath = path.join(folderPath, pdfFileName);
  
    const file = { content: pdfData };
    const options = { format: 'A4' };
  
    const pdfBuffer = await pdf.generatePdf(file, options);
    fs.writeFileSync(filePath, pdfBuffer);
    if(is_preview){
       return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK)
    }else{
        const fileUrl = `${baseUrl}/offer_letter/${pdfFileName}`;
        response.data = { filePath: fileUrl };
        return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK)
    }

})

module.exports = {
    getEmployeeDetailsByPayDays,
    getAttendanceStatus,
    updateAttendanceTracking,
    updateAttendanceTrackingInBulk,
    addLoans,
    getLoans,
    addEarnings,
    addDeductions,
    getEarnings,
    getDeductions,
    addTaxSlabs,
    addEarningTypes,
    getEarningType,
    getEarningTypeById,
    getAllEarningType,
    updateEarningType,
    updateDeductions,
    updateEarning,
    addDeductionsType,
    getDeductionsType,
    getDeductionsTypeById,
    getAllDeductionType,
    generateSalaryTemplate,
    createSalaryTemplate,
    updateDeductionType,
    getAllEarning,
    getAllDeduction,
    calculateCtc,
    addArrears,
    getArrears,
    addEmployeeSalary,
    getSalaryTemplate,
    getAllSalaryTemplate,
    checkRuleFormula,
    getEmployeeSalary,
    getAllEmployeeSalary,
    updateSalaryTemplate,
    updateEmployeeSalary,
    getAllEmployeeAssignStatus,
    getAllSalaryTemplateById,
    calculateEmployeeSalary,
    getPayRunDashboard,
    getPayRunHistory,
    createPayRun,
    addPaySchedule,
    payRunNotification,
    updatePaySchedule,
    upcomingPayrolls,
    addTaxSlab,
    updateTaxSlab,
    getTaxSlab,
    deleteTaxSlab,
    getAllTaxSlab,
    addEmployeeInvestment,
    getEmployeeInvestment,
    updateEmployeeInvestment,
    deleteEmployeeInvestment,
    addInvestmentCategory,
    getInvestmentCategory,
    addInvestmentSubCategory,
    getInvestmentSubCategory,
    updateInvestmentCategory,
    deleteInvestmentCategory,
    updateInvestmentSubCategory,
    deleteInvestmentSubCategory,
    getAllInvestmentCategory,
    getAllInvestmentSubCategory,
    applyAdvance,
    getAdvanceApproval,
    getAdvanceRequest,
    getAllCategoryDetails,
    approvalRejectAdvance,
    approvePayroll,
    getPayRun,
    employeeInvestmentProof,
    getEmployeeInvestmentProof,
    updateEmployeeInvestmentProof,
    deleteEmployeeInvestmentProof,
    commentInEmployeeInvestmentProof,
    getEmployeeMonthlySalary,
    generateSalarySlip,
    sendOfferLetter
};