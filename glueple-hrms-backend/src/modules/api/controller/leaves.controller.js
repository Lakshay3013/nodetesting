const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const config = require('../../../config/config.js');
const { leaveService, approvalManagementService, approverService, employeeService, roleService, shiftManagementService, attendanceService, holidayService, payrollService, travelAndClaimService } = require('../services/index.js');
const { successResponse, errorResponse, validateLeaveEncashmentFormula } = require('../../../helpers/index.js');
const { messages, leaveConstants } = require('../../../config/constants.js');
const { getSessionData, getServiceResFormat, getEmployeeOffs, isSandwichPolicy } = require('../utils/appHelper.js');
const { addInMomentDate, subtractFromMomentDate, currentDate } = require('../utils/dateTimeHelper.js');
const ApiError = require('../../../helpers/ApiError.js');
const mongoose = require('mongoose')
const moment = require('moment')

const addLeaveType = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    const { formula } = req.body;
    if (formula) {
        const isValidExpression = validateLeaveEncashmentFormula(formula);
        if (!isValidExpression) {
            return errorResponse(req, res, messages.alert.INVALID_EXPRESSION, httpStatus.BAD_REQUEST);
        }
    }
    req.body['created_by'] = user?.id;
    const leaveTypeData = await leaveService.addLeaveType(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, leaveTypeData, httpStatus.OK);
});

const getLeaveType = catchAsync(async (req, res) => {
    const leaveTypeData = await leaveService.queryLeaveType({ deleted_at: { $eq: null } }, req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, leaveTypeData, httpStatus.OK);
});

const updateLeaveType = catchAsync(async (req, res) => {
    const { formula } = req.body;
    if (formula) {
        const isValidExpression = validateLeaveEncashmentFormula(formula);
        if (!isValidExpression) {
            return errorResponse(req, res, messages.alert.INVALID_EXPRESSION, httpStatus.BAD_REQUEST);
        }
    }
    const leaveTypeData = await leaveService.updateLeaveType({ _id: req.body._id }, req.body);
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, leaveTypeData, httpStatus.OK);
});

const deleteLeaveType = catchAsync(async (req, res) => {
    const leaveTypeData = await leaveService.updateLeaveType({ _id: req.body._id }, { deleted_at: new Date() });
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, leaveTypeData, httpStatus.OK);
});

const addLeaveSetting = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    req.body['created_by'] = user?.id;
    const leaveSettingData = await leaveService.addLeaveSetting(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, leaveSettingData, httpStatus.OK);
});

const getLeaveSetting = catchAsync(async (req, res) => {
    const leaveSettingData = await leaveService.queryLeaveSetting({ leave_type_id: req.query.leave_type_id, deleted_at: { $eq: null } }, {});
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, leaveSettingData, httpStatus.OK);
});

const getAllLeaveSetting = catchAsync(async (req, res) => {
    const leaveSettingData = await leaveService.queryLeaveSetting({ deleted_at: { $eq: null } }, req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, leaveSettingData, httpStatus.OK);
});

const updateLeaveSetting = catchAsync(async (req, res) => {
    const leaveSettingData = await leaveService.updateLeaveSetting({ _id: req.body._id }, req.body);
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, leaveSettingData, httpStatus.OK);
});

const deleteLeaveSetting = catchAsync(async (req, res) => {
    const leaveSettingData = await leaveService.updateLeaveSetting({ _id: req.body._id }, { deleted_at: new Date() });
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, leaveSettingData, httpStatus.OK);
});

const getLeaveConstantData = catchAsync(async (req, res) => {
    const response = getServiceResFormat();
    const result = [];
    for (let i = 1; i <= 31; i++) {
        result.push({ id: i, label: i, value: i });
    }
    leaveConstants['dateConstants'] = result;
    response.data = leaveConstants;
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK);
});

const getLeaveTypeList = catchAsync(async (req, res) => {
    const leaveTypeData = await leaveService.getLeaveTypeList({ deleted_at: { $eq: null } });
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, leaveTypeData, httpStatus.OK);
});

const getFilteredLeaveBalanceData = catchAsync(async (req, res) => {
    let filters = {};
    const { start_date, end_date } = req.query;
    if (start_date && end_date) {
        filters['created_at'] = {
            $gte: new Date(start_date),
            $lte: new Date(end_date),
        }
    }
    const leaveTypeData = await leaveService.getFilteredLeaveBalanceData(filters);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, leaveTypeData, httpStatus.OK);
});

const getLeaveBalance = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    const emp_id = user?.id
    const getLeaveBalance = await leaveService.getLeaveBalance({ employee_id: mongoose.Types.ObjectId(emp_id) })
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getLeaveBalance, httpStatus.OK);
})

const addLeaveBalance = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    req.body['created_by'] = user?.id;
    const { emp_id } = req.body
    const approvalData = await employeeService.getSingleUser({ "emp_id": emp_id }, {});
    if (!(approvalData.status)) {
        return errorResponse(req, res, messages.alert.Data_NOT_FOUND, httpStatus.BAD_REQUEST);
    }
    req.body['employee_id'] = approvalData.data._id
    const getLeaveBalance = await leaveService.addLeaveBalance(req.body)
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, getLeaveBalance, httpStatus.OK);
})


const applyLeave = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    const { leaveDetails } = req.body
    req.body['emp_id'] = user?.emp_id;
    req.body['created_by'] = user?.id;
    const leave_type = leaveDetails[0].leave_type
    const getEmployeeShift = await employeeService.queryUserForAttendance({ _id: user?.id });
    const getLeaveSettings = await leaveService.queryLeaveSetting({ leave_type_id: leave_type, department_id: getEmployeeShift?.data?.[0]?.department_id, designation_id: getEmployeeShift?.data?.[0]?.designation_id }, {});
    const getLeaveData = getLeaveSettings


    const isSandwichPolicyAvailable = await getSandwichPolicyFunction(user, leaveDetails);
    // console.log("--isSandwichPolicyAvailable--", isSandwichPolicyAvailable);
    if (isSandwichPolicyAvailable && isSandwichPolicyAvailable?.length) {
        for (let i = 0; i < isSandwichPolicyAvailable?.length; i++) {
            const data = isSandwichPolicyAvailable[i];
            leaveDetails.push({ is_sandwich: true, leave_status: "Full Day", emp_id: user?._id, emp_code: user?.emp_id, leave_date: data, leave_type: leaveDetails[0].leave_type, reason: "Sandwich Policy Applied From System", created_by: user?.id });
        }
    }
    const totalLeaveDays = leaveDetails?.reduce((total, data) => {
        const leaveDays = data.leave_status === "Full Day" ? 1 : 0.5;
        return total + leaveDays;
    }, 0);
    if (getLeaveData.status && getLeaveData.can_exceed_leave_balance_value !== 'without_limit') {
        const getEmployeeLeave = await leaveService.getLeaveBalance({ leave_type: mongoose.Types.ObjectId(leave_type), employee_id: mongoose.Types.ObjectId(user.id) });
        if (!getEmployeeLeave?.data?.length || getEmployeeLeave?.data[0].leave_balance <= 0 || totalLeaveDays > getEmployeeLeave?.data[0].leave_balance) {
            return errorResponse(req, res, messages.alert.LEAVE_BALANCE_NO_AVAILABLE, httpStatus.BAD_REQUEST);
        }
    }
    const leaveData = await leaveSettingFunction(user, getLeaveData, leaveDetails)
    if (!leaveData.status) {
        return errorResponse(req, res, leaveData.msg, httpStatus.BAD_REQUEST);
    }
    // let leave_balance = getEmployeeLeave?.data[0].leave_balance
    let approvalData = [];
    let getApprovalHierarchy = await approvalManagementService.querySingleHierarchy({ type: 'leave', department_id: mongoose.Types.ObjectId(user?.department_id), designation_id: mongoose.Types.ObjectId(user?.designation_id), position_id: mongoose.Types.ObjectId(user?.position_id) });
    if (getApprovalHierarchy?.status) {
        approvalData = getApprovalHierarchy?.data;
    } else {
        getApprovalHierarchy = await approvalManagementService.querySingleHierarchy({ type: 'leave', department_id: mongoose.Types.ObjectId(user?.department_id), designation_id: mongoose.Types.ObjectId(user?.designation_id) });
        if (getApprovalHierarchy?.status) {
            approvalData = getApprovalHierarchy?.data;
        } else {
            getApprovalHierarchy = await approvalManagementService.querySingleHierarchy({ type: 'leave', department_id: mongoose.Types.ObjectId(user?.department_id) });
            if (getApprovalHierarchy?.status) {
                approvalData = getApprovalHierarchy?.data;
            } else {
                getApprovalHierarchy = await approvalManagementService.querySingleHierarchy({ type: 'leave', department_id: null });
                if (getApprovalHierarchy?.status) {
                    approvalData = getApprovalHierarchy?.data;
                } else {
                    return errorResponse(req, res, messages.alert.LEAVE_HIERARCHY_ERR, httpStatus.BAD_REQUEST);
                }
            }
        }
    }
    const applyLeaves = await leaveService.applyLeave(req.body)
    let applyLeaveData = applyLeaves?.data
    if (applyLeaveData?.length) {
        for (let i = 0; i < applyLeaveData.length; i++) {
            await leaveService.creditDebitLeave({ emp_id: mongoose.Types.ObjectId(user.id), leave_type_id: mongoose.Types.ObjectId(leave_type), added_from_value: mongoose.Types.ObjectId(applyLeaveData[i]?._id) || '', leave_value: applyLeaveData[i].leave_status === 'Full Day' ? 1 : 0.5, status: 'DR', added_from: 'leave' })
            let approverData = {
                "type": "leave",
                "collection_id": applyLeaveData[i]?._id || '',
                "approver_id": [],
            }
            approvalData.forEach(async (data) => {
                let approverId = [];
                if (data?.id) {
                    approverId = [mongoose.Types.ObjectId(data?.id)];
                } else {
                    const getRoleData = await roleService.querySingleRoleData({ _id: data?.role_id });
                    if (getRoleData.data?.short_name == 'manager' || getRoleData.data?.short_name == 'hod') {
                        let datas = await employeeService.queryUserByFilter({ "_id": mongoose.Types.ObjectId(user?.id) }, {});
                        if (datas?.status) {
                            data = datas?.data[0];
                        }
                        approverId = getRoleData.data?.short_name == 'manager' ? [mongoose.Types.ObjectId(data?.reported_to)] : [mongoose.Types.ObjectId(user?.hod_id)];
                    } else {
                        let datas = await employeeService.queryUserByFilter({ "role_id": data?.role_id }, {});
                        if (datas?.status) {
                            data = datas?.data;
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
    }
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, applyLeaves, httpStatus.OK);
})

const leaveSettingFunction = async (user, getLeaveData, leaveDetails) => {
    let result = {
        status: true,
        msg: ``
    };

    console.log("sdfdsfds", getLeaveData)
    //leave clubbe
    if (getLeaveData?.not_allowed_clubbing_with?.length) {
        const betweendates = {
            $gte: subtractFromMomentDate(leaveDetails[0].leave_date, 1, 'day', "YYYY-MM-DD"),
            $lte: addInMomentDate(leaveDetails.length == 1 ? leaveDetails[0].leave_date : leaveDetails[leaveDetails.length - 1].leaveDetails, 1, "day", "YYYY-MM-DD")
        }
        const leave_type = {
            $in: (getLeaveData?.not_allowed_clubbing_with).map(data => mongoose.Types.ObjectId(data))
        }
        const getLeave = await leaveService.getLeaveDetails({ emp_id: mongoose.Types.ObjectId(user?.id), leave_start_date: betweendates, is_cancel: false, leave_type: leave_type })
        if (getLeave?.status) {
            result['status'] = false;
            result['msg'] = `This Leave cannot be clubbed`
            return result
        }

    } if (getLeaveData.allow_request_for) {
        if (getLeaveData.allow_request_for === "future_date") {
            let futureDates = leaveDetails.filter(item => item.leave_date < currentDate());
            if (futureDates.length) {
                result['status'] = false;
                result['msg'] = `You can't apply for leaves in past date`
            }
        } else if (getLeaveData.allow_request_for === "past_date") {
            let pastDates = leaveDetails.filter(item => item.leave_date > currentDate());
            if (pastDates.length) {
                result['status'] = false;
                result['msg'] = `You can't apply for leaves in future date`
            }
        }
        return result
    }
    return result

}

const getSandwichPolicyFunction = async (user, leaveDetails) => {
    const getEmployeePreviousLeaves = await leaveService.queryLeaveApplicationOnFilter({ emp_id: user?.id, leave_start_date: { $gte: subtractFromMomentDate(leaveDetails[0].leave_date, 3, 'days', "YYYY-MM-DD"), $lte: addInMomentDate(leaveDetails[leaveDetails?.length - 1].leave_date, 3, 'days', "YYYY-MM-DD") } });
    const getEmployeeShift = await employeeService.queryUserForAttendance({ _id: user?.id });
    const getLeaveSettings = await leaveService.queryLeaveSetting({ leave_type_id: leaveDetails[0].leave_type, department_id: getEmployeeShift?.data?.[0]?.department_id, designation_id: getEmployeeShift?.data?.[0]?.designation_id }, {});
    const getDefaultShift = await shiftManagementService.getDefaultShiftData();
    let getEmployeeOffsData = [];
    if (getEmployeeShift?.status && getDefaultShift?.status) {
        const getHolidays = await holidayService.queryHolidays({
            '$or': [
                { gender: 'all' },
                { gender: getEmployeeShift?.data?.[0]?.gender },
            ]
            // country: getEmployeeShift?.data?.[0]?.location_data?.country,
            // state: getEmployeeShift?.data?.[0]?.location_data?.state,
            // city: getEmployeeShift?.data?.[0]?.location_data?.city,
        },);
        getEmployeeOffsData = getEmployeeOffs({ employeeData: getEmployeeShift?.data?.[0], defaultShiftData: getDefaultShift?.data, startDate: subtractFromMomentDate(leaveDetails[0].leave_date, 3, 'days', "YYYY-MM-DD"), endDate: addInMomentDate(leaveDetails[leaveDetails?.length - 1].leave_date, 1, 'days', "YYYY-MM-DD"), holidayData: getHolidays?.data })
    }
    const isSandwichPolicyAvailable = isSandwichPolicy({
        leaveTypeData: getLeaveSettings?.status ? getLeaveSettings?.data?.data?.[0] : {},
        leaveDates: leaveDetails,
        employeeOffs: getEmployeeOffsData,
        employeeLeaves: getEmployeePreviousLeaves?.status ? getEmployeePreviousLeaves?.data : [],
    });
    return isSandwichPolicyAvailable;
}

const sandwichLeaveDates = catchAsync(async (req, res) => {
    const response = getServiceResFormat();
    const user = getSessionData(req);
    const { leaveDetails } = req.body;
    if(!leaveDetails[0].leave_type){
        return errorResponse(req, res, messages.alert.PLEASE_SELECT, httpStatus.BAD_REQUEST);
    }
    const isSandwichPolicyAvailable = await getSandwichPolicyFunction(user, leaveDetails);
    if (isSandwichPolicyAvailable && isSandwichPolicyAvailable?.length) {
        response.data = isSandwichPolicyAvailable;
    } else {
        response.status = false;
    }
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK);
});

const leaveDebitOrCredit = async (user, applyLeaveData, status, leave_type, leave_balance) => {

    let countLeave = leave_balance;
    let leaveDays = 0;

    applyLeaveData.forEach(detail => {
        const leaveValue = detail.leave_status === "Full Day" ? 1 : 0.5;
        leaveDays += (status === "CR") ? leaveValue : -leaveValue;
    });

    const totalLeave = countLeave - leaveDays;
    const updateLeave = await leaveService.updateLeaveBalance(
        { emp_id: user?.emp_id, _id: mongoose.Types.ObjectId(leave_type) },
        { leave_balance: totalLeave }
    );

    return !!(updateLeave && updateLeave?._id);
};


const getEmpAppliedLeaveRequest = catchAsync(async (req, res) => {
    const { request_for, parameter, status, limit, page } = req.query;
    const user = getSessionData(req);
    const getData = await leaveService.getEmpAppliedLeave({ request_for, parameter, status, limit, page, user },{ limit, page,});
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getData, httpStatus.OK);

})
const getEmpAppliedLeaveApprovel = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    const { request_for, parameter, status, limit, page } = req.query;
    let filters = {
        approver_id: user?.id,
        action_type: status,
        type: parameter
    };
    const getData = await leaveService.queryApproverLeaveDataByFilter(filters, req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getData, httpStatus.OK);
})

const approveRejectLeave = catchAsync(async (req, res) => {
    const { _id, comment, action_type } = req.body;
    const user = getSessionData(req);
    const approverData = await approverService.queryApproverData({ _id: _id, action_type: { $in: ['approve', 'reject'] } });
    if (approverData?.status) {
        return errorResponse(req, res, messages.alert.LEAVE_ACTION, httpStatus.BAD_REQUEST);
    }

    const leaveData = await approverService.updateApproverData({ _id: _id }, {
        $set: {
            comment: comment || '',
            action_type: action_type,
            action_by: user?.id,
            action_date: new Date(),
        }
    });
    if(leaveData.status){
        const LeaveDetails = await leaveService.getLeaveDetails({ _id: leaveData.data.collection_id});
        const approval_pending = await approverService.getApprovalPendingApprovedCount({collection_id:leaveData.data.collection_id})
        if(action_type === 'reject' && LeaveDetails.status){
           await leaveService.creditDebitLeave({ emp_id: LeaveDetails?.data[0]?.emp_id, leave_type_id: LeaveDetails?.data[0]?.leave_type, added_from_value: mongoose.Types.ObjectId(user?.id) || '', leave_value: LeaveDetails?.data[0]?.leave_status === 'Full Day' ? 1 : 0.5 , status: 'CR', added_from: 'leave' })
        }else{
            if(approval_pending?.status && approval_pending?.data?.approval_pending === 0){
            const getAttendanceData = await attendanceService.getMonthlyAttendance({emp_id:LeaveDetails?.data[0]?.emp_id,attendance_date:LeaveDetails?.data[0]?.leave_start_date})
            let obj = {
                first_half_status:LeaveDetails.data[0].leave_short_name,
                second_half_status:LeaveDetails.data[0].leave_short_name,
                attendance_status:LeaveDetails.data[0].leave_short_name,
                day_of_week:moment(LeaveDetails.data[0].leave_start_date).format('dddd'),
                total_working_hours:"00:00:00",
                total_break_time:"00:00:00",
                duration:"00:00:00"
            }
           if(getAttendanceData.status){
            obj['first_half_status'] = getAttendanceData?.data[0]?.first_half_status;
            obj['second_half_status'] = getAttendanceData?.data[0]?.second_half_status
            obj['attendance_status'] = getAttendanceData?.data[0]?.attendance_status;
            if(LeaveDetails?.data[0]?.leave_status === 'First Half Day'){
             obj['second_half_status'] = getAttendanceData?.data[0]?.second_half_status
            obj['attendance_status'] = getAttendanceData?.data[0]?.attendance_status;
            }else if(LeaveDetails?.data[0]?.leave_status === 'Second Half Day'){
            obj['first_half_status'] = getAttendanceData?.data[0]?.first_half_status;
            obj['attendance_status'] = getAttendanceData?.data[0]?.attendance_status;
            }
            let  updateAttendance = await attendanceService.updateAttendance({ emp_id: LeaveDetails.data[0]?.emp_id, attendance_date: LeaveDetails.data[0].leave_start_date}, obj)
           }else{
            obj['emp_id'] = LeaveDetails.data[0].emp_id;
            obj['attendance_date'] = LeaveDetails.data[0].leave_start_date
            let addAttendance = await attendanceService.addAttendance(obj)
           }}
        }

    }
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, leaveData, httpStatus.OK);
});

const cancelLeave = catchAsync(async (req, res) => {
    const { cancel_id, employee_id } = req.query
    const currentDate = moment().format('YYYY-MM-DD HH:mm:ss')
    const user = getSessionData(req)
    const canceldata = await leaveService.cancelLeave({ _id: cancel_id }, { is_cancel: true, cancel_date: currentDate, cancel_by: user?.id })
    if (canceldata?.data?._id) {
        const cancelData = canceldata?.data
        await leaveService.creditDebitLeave({ emp_id: mongoose.Types.ObjectId(cancelData.emp_id), leave_type_id: mongoose.Types.ObjectId(cancelData.leave_type), leave_value: 1, status: 'CR', added_from: 'leave' })
    }
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, canceldata, httpStatus.OK);
})

const getAllEmployeeLeave = catchAsync(async (req, res) => {
    const user = getSessionData(req)
    const { start_date, end_date } = req.query
    const getLeave = await leaveService.getAllEmployeeLeave({ start_date, end_date })
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getLeave, httpStatus.OK);
})

const getLeaveApprovalProgress = catchAsync(async (req, res) => {
    const user = getSessionData(req)
    const { id ,type} = req.query
    let getProgress = null
    if(type == 'leave'){
        getProgress = await leaveService.getLeaveProgress({ _id: mongoose.Types.ObjectId(id) })
    }else if(type == 'attendance_correction'){
        getProgress = await attendanceService.getAttendanceCorrectionProgress({ _id: mongoose.Types.ObjectId(id)})
    }else if(type == 'advance'){
        getProgress = await payrollService.getAdvanceProgress({ _id: mongoose.Types.ObjectId(id)})
    }else if(type == 'travel'){
        getProgress = await travelAndClaimService.getTravelProgress({ _id: mongoose.Types.ObjectId(id)})
    }else if(type == "claim"){
        getProgress = await travelAndClaimService.getClaimProgress({ _id: mongoose.Types.ObjectId(id)})
    }
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getProgress, httpStatus.OK);
})

const checkLeaveEncashmentFormula = catchAsync(async (req, res) => {
    const { formula } = req.body;
    const response = getServiceResFormat();
    const isValidExpression = validateLeaveEncashmentFormula(formula);
    if (isValidExpression) {
        response.data = isValidExpression;
        return successResponse(req, res, messages.alert.VALID_EXPRESSION, response, httpStatus.OK);
    } else {
        return errorResponse(req, res, messages.alert.INVALID_EXPRESSION, httpStatus.BAD_REQUEST);
    }
})

const creditDebitLeave = catchAsync(async(req, res)=>{
    const user = getSessionData(req)
    const {employee_id,leave_type,no_of_leave,credit_debit,remark} = req.body
    const creditDebitLeave = await leaveService.creditDebitLeave({ emp_id: mongoose.Types.ObjectId(employee_id), leave_type_id: mongoose.Types.ObjectId(leave_type), added_from_value: mongoose.Types.ObjectId(user?.id) || '', leave_value: no_of_leave, status: credit_debit, added_from: 'leave',remark:remark })
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, creditDebitLeave,httpStatus.OK)
})

const getCreditDebitLeave = catchAsync(async(req, res)=>{
    const {employee_id} = req.query;
    const getLeaveHistory = await leaveService.getLeaveBalance({employee_id:mongoose.Types.ObjectId(employee_id)})
    return successResponse(req, res,messages.alert.SUCCESS_GET_DATA,getLeaveHistory,httpStatus.OK)
})

const getEmployeeLeave = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    let {employee_id} = req.query;
    const getEmployeeData = await leaveService.getEmployeeLeave({employee_id:mongoose.Types.ObjectId(employee_id == undefined ? user.id : employee_id)})
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA,getEmployeeData, httpStatus.Ok);
})

const getLeaveToday = catchAsync(async(req, res)=>{
    let {status, date} = req.query;
    date = date == undefined ? currentDate() : date;
    status = status == undefined ? "Full Day" : status == "first_half" ? "First Half Day" :  status == "second_half" ? "Second Half Day" : "Full Day";
    const getLeaveToday = await leaveService.getLeaveToday({leave_start_date:date,leave_status:status});
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getLeaveToday, httpStatus.OK);
})

const creditLeaveAllEmployee = async()=>{
    const getLeaveSetting = await leaveService.getLeaveSetting({is_active:true});
    const getAllEmployee = await employeeService.getAllEmployee({account_status:"active"})
    getAllEmployee = getAllEmployee.status ? getAllEmployee.data : []
    getLeaveSetting = getLeaveSetting.status ? getLeaveSetting.data : []
 }


module.exports = {
    addLeaveType,
    getLeaveType,
    updateLeaveType,
    deleteLeaveType,
    addLeaveSetting,
    getAllLeaveSetting,
    getLeaveSetting,
    updateLeaveSetting,
    deleteLeaveSetting,
    getLeaveConstantData,
    getLeaveTypeList,
    getFilteredLeaveBalanceData,
    applyLeave,
    sandwichLeaveDates,
    getLeaveBalance,
    addLeaveBalance,
    approveRejectLeave,
    cancelLeave,
    getEmpAppliedLeaveRequest,
    getEmpAppliedLeaveApprovel,
    getAllEmployeeLeave,
    getLeaveApprovalProgress,
    checkLeaveEncashmentFormula,
    creditDebitLeave,
    getCreditDebitLeave,
    getLeaveToday,
    getEmployeeLeave
};