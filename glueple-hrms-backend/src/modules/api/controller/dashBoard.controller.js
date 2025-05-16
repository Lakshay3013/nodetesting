const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const {payrollService,attendanceService,shiftManagementService,employeeService, leaveService, approvalManagementService, roleService, approverService,dashBoardService, clientService, communityService} = require('../services');
const { successResponse, errorResponse,validateFormula } = require('../../../helpers');
const { messages } = require('../../../config/constants.js');
const { getSessionData,getShiftDetails ,toTitleCaseLowerCase, getServiceResFormat,decodeCharacters,decodeRules, checkAttendanceStatus, monthlyAttendance,getHierarchy, calculateOldRegimeTax, calculateNewRegimeTax, createFolder, generateSalarySlipPDF, createPDF, addPasswordToPDF, offerLetter} = require('../utils/appHelper.js');
const {convertDateByMoment,currentDate, getMonthStartAndEnd, getNumberOfDaysInMonth, addInMomentDate, countOfSaturday, filterMonth, getStartOrEndDate, getCurrentWeekRange, getCurrentMonthDetails} = require('../utils/dateTimeHelper.js')
const mongoose = require('mongoose');

const requestPending = catchAsync(async(req, res)=>{
    const response = getServiceResFormat();
    const user = getSessionData(req)
    const getCorrectionPending = await dashBoardService.getAttendanceCorrectionRequest( {request_for:"applied", parameter:"attendance_correction", status:"pending", user} )
    const getLeavePending = await dashBoardService.getEmpAppliedLeave( {request_for:"applied", parameter:"leave", status:"pending", user})
    let data = {
        getCorrectionPending:getCorrectionPending.data,
        getLeavePending:getLeavePending.data,
        getC_OffPending:0,
        getTourPending:0
    }
    response.data = data
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK)
})

const employeeCorrectionCount = catchAsync(async(req, res)=>{
    const response = getServiceResFormat();
    const user = getSessionData(req)
    const getClient = await clientService.getAllClient({code:"QD100"})
    const getCorrectionPending = await dashBoardService.getAttendanceCorrectionRequest( {date:getStartOrEndDate(), parameter:"attendance_correction", status:"approve", user} )
    const data = {
        overall_corrections:getCorrectionPending.data == null ? 0 :getCorrectionPending.data,
        monthly_correction_limit:getClient.data[0].attendance_correction_days
    }
    response.data = data
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK);
})

const employeeWeeklyAttendanceTrend = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    const response = getServiceResFormat();
    const getWeeKDate = getCurrentWeekRange(7);
  
    const getAttendance = await attendanceService.getEmployeeAttendance({
      emp_id: mongoose.Types.ObjectId(user.id),
      attendance_date: {
        $gte: getWeeKDate[0].date,
        $lte: getWeeKDate[getWeeKDate.length - 1].date
      }
    });
  
    let result = {
      total_working_hours: [],
      total_break_time: [],
      day_of_week: []
    };
  
    if (getAttendance.status) {  
      getAttendance.data.forEach(day => {      
          result.total_working_hours.push(day.total_working_hours);
          result.total_break_time.push(day.total_break_time);
          result.day_of_week.push(day.attendance_date);
       
      });
    }
  
    response.data = result;
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK);
  });
  

const employeeAttendanceStatistics = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    const response = getServiceResFormat();
    const getWeeKDate = getCurrentWeekRange(7);
    const getAttendance = await attendanceService.getEmployeeAttendance({
        emp_id: mongoose.Types.ObjectId(user.id),
        attendance_date: {
          $gte: getWeeKDate[0].date,
          $lte: getWeeKDate[getWeeKDate.length - 1].date
        }
      });
       
      let presentDays = 0;
      let absentDays = 0; 
    if(getAttendance.status){
        getAttendance.data.forEach(entry => {
          if (entry.attendance_status === 'PR') {
            presentDays++;
          } else if (entry.attendance_status === 'AB') {
            absentDays++; 
          }else if (entry.attendance_status === 'FHP') {
            absentDays = absentDays + 0.5;
            presentDays = presentDays +  0.5 
          } else if (entry.attendance_status === 'SHP') {
            absentDays = absentDays + 0.5;
            presentDays = presentDays +  0.5 
          }
      });
    }

      let totalDays = presentDays + absentDays;
    
      // Calculate the percentage of presence and absence
      const presencePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
      const absencePercentage = totalDays > 0 ? (absentDays / totalDays) * 100 : 0;
    
      let data ={
        presencePercentage: presencePercentage.toFixed(2), 
        absencePercentage: absencePercentage.toFixed(2) 
      };

      response.data = data
      return successResponse(req, res, messages.alert.SUCCESS_GET_DATA,response, httpStatus.OK);
    

})

const employeeLeavesStatistics = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    const response = getServiceResFormat()
    const { startDate, endDate } = getCurrentMonthDetails();
    const getLeaveType = await leaveService.getLeaveTypeList({});
    const getLeave = await dashBoardService.getLeaveApplication({
        emp_id: mongoose.Types.ObjectId(user.id),
        leave_start_date: {
            $gte: startDate,
            $lte: endDate
        }
    });
    let plannedLeaves = [];
    let unplannedLeaves = [];
    if (getLeave.status) {
        getLeave?.data?.forEach(leave => {
            const leaveStartDate = convertDateByMoment(leave.leave_start_date, 'YYYY-MM-DD');
            const createdAtDate = convertDateByMoment(leave.created_at, 'YYYY-MM-DD');
            if (leaveStartDate >= createdAtDate) {
                plannedLeaves.push(leave)
            } else {
                unplannedLeaves.push(leave)
            }
        });

    }

    const categories = getLeaveType?.data?.map(type => type.name) || [];


    const countLeavesByType = (leavesArray) => {
        const counts = {};
        categories.forEach(category => {
            counts[category] = 0;
        });

        leavesArray.forEach(leave => {
            const leaveTypeObj = getLeaveType.data.find(type => type._id.toString() === leave.leave_type.toString());
            const leaveTypeName = leaveTypeObj ? leaveTypeObj.name : null;
            if (leaveTypeName && counts.hasOwnProperty(leaveTypeName)) {
                counts[leaveTypeName]++;
            }
        });


        return categories.map(category => counts[category]);
    };

    const plannedData = countLeavesByType(plannedLeaves);
    const unplannedData = countLeavesByType(unplannedLeaves);
    let data = {
        categories,
        plannedData,
        unplannedData
    }

    response.data = data;
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK);
});

const getAnnouncementCount = catchAsync(async (req, res) => {
    const response = getServiceResFormat();
    const user = getSessionData(req);
    const getAnnouncement = await dashBoardService.getAnnouncement({ start_date: currentDate() });

    let birthdayCount = 0;
    let kudosCount = 0;
    let anniversaryCount = 0;
    let postCount = 0;

    if (getAnnouncement.status) {
        getAnnouncement.data.forEach(data => {
            switch (data.type) {
                case 'kudos':
                    kudosCount++;
                    break;
                case 'birthday':
                    birthdayCount++;
                    break;
                case 'anniversary':
                    anniversaryCount++;
                    break;
                default:
                    postCount++;
            }
        });
    }

    response.data = {
        birthdayCount,
        kudosCount,
        anniversaryCount,
        postCount
    };

    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, httpStatus.OK, response);
});


const s3 = catchAsync(async(req, res)=>{

  console.log("req", req, req.file)
  console.log("Hello new data")
})





module.exports = {
    requestPending,
    employeeCorrectionCount,
    employeeWeeklyAttendanceTrend,
    employeeAttendanceStatistics,
    employeeLeavesStatistics,
    getAnnouncementCount,
    s3
}