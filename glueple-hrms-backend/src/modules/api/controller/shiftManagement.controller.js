const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const { shiftManagementService, employeeService } = require('../services/index.js');
const { successResponse, errorResponse } = require('../../../helpers/index.js');
const { messages } = require('../../../config/constants.js');
const { getSessionData,getDatesBetweenDates,isWeekOffDay,isWeekend ,is_Sunday,count_of_saturday,is_Saturday,getServiceResFormat} = require('../utils/appHelper.js');
const {getDatesBetweenDateRange,convertDateByMoment} = require('../utils/dateTimeHelper.js')
const path = require('path')
const { removeFile } = require('../../../helpers/fileHandler.js');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const moment = require('moment')


const createShift = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    req.body['created_by'] = user?.id;
    const createShiftData = await shiftManagementService.createShift(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, createShiftData, httpStatus.OK);
});

const getAllShift = catchAsync(async (req, res) => {
    const { params } = req.query
    const getAllShiftData = await shiftManagementService.getShift({}, params);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getAllShiftData, httpStatus.OK);
})

const getShiftById = catchAsync(async(req, res)=>{
    const {id} = req.query
    const getShiftData = await shiftManagementService.getShiftById({_id:mongoose.Types.ObjectId(id)})
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA,getShiftData,httpStatus.OK);
})

const updateShift = catchAsync(async (req, res) => {
    const updateData = await shiftManagementService.UpdateShift({ _id: req.body._id }, { $set: req.body });
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, updateData, httpStatus.OK);
});

const deleteShift = catchAsync(async (req, res) => {
    const deleteData = await shiftManagementService.deleteShift({ _id: req.body._id });
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, deleteData, httpStatus.OK);
});

const isActiveOrInActive = catchAsync(async(req, res)=>{
    const {id,is_active} = req.query
    const updateData = await shiftManagementService.isActiveOrInAction({_id:ObjectId(id)},{is_active:is_active})
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, updateData, httpStatus.OK)
})

const createShiftConfiguration = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    const {shift_id, calendar_id,minimum_ot_hours,maximum_ot_hours,is_OT_time,is_default} = req.body
    const createShiftConfigurationData = await shiftManagementService.createShiftConfiguration({shift_id:shift_id,is_ot_time:is_OT_time,minimum_ot_hours:minimum_ot_hours,maximum_ot_hours:maximum_ot_hours,calendar_id:calendar_id,created_by:user?.id,is_default:is_default})
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, createShiftConfigurationData, httpStatus.OK)

});

// const getShiftConfigurationByShiftId = catchAsync(async(req, res)=>{
//     const { _id } = req.query
//     const getShiftData = await shiftManagementService.getShiftConfigurationByShiftId(_id)
//     return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getShiftData, httpStatus.OK)
// })

const addCalendar = catchAsync(async(req, res)=>{
    const user = getSessionData(req)
    const {title, working_days, alternative_saturday_off, week_off} = req.body
    const AddCalendarData = await shiftManagementService.addCalendar({title:title,working_days:working_days,alternative_saturday_off:alternative_saturday_off,week_off:week_off,created_by:user?.id})
    return successResponse(req, res,messages.alert.SUCCESS_SAVE_DATA,AddCalendarData,httpStatus.OK)
})

const updateShiftCalendar = catchAsync(async(req,res)=>{
    const {_id,title,working_days,alternative_saturday_off,week_off} = req.body
    const updateData = await shiftManagementService.updateShiftCalendar({ _id: _id }, { $set: {title:title,working_days:working_days,alternative_saturday_off:alternative_saturday_off,week_off:week_off} });
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, updateData, httpStatus.OK);

}) 

const getAllShiftCalendar = catchAsync(async(req, res)=>{
    const getAllShiftCalendar = await shiftManagementService.getShiftCalendar({}, req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getAllShiftCalendar, httpStatus.OK);

})

const deleteShiftCalendar = catchAsync(async(req, res)=>{
    let {_id} = req.body
    const deleteData = await shiftManagementService.deleteShiftCalendar({ _id: _id });
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, deleteData, httpStatus.OK);

})

const shiftAssign = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    const { shift_id, employee_id, start_date, end_date, assignment_type } = req.body
    let assignShiftData = null
    if (assignment_type === 'monthly') {
        const firstDate = moment(start_date, 'YYYY-MM').startOf('month').format('DD-MM-YYYY');
        const lastDate = moment(start_date, 'YYYY-MM').endOf('month').format("DD-MM-YYYY");
        const shiftDateRange = getDatesBetweenDates(firstDate, lastDate)
        assignShiftData = await shiftManagementService.shiftAssignTemporaryOrMonthly({ shift_id, employee_id, shiftDateRange, assignment_type, created_by: user?.id })
    } else if (assignment_type == 'temporary') {
        const shiftDateRange = getDatesBetweenDates(start_date, end_date)
        assignShiftData = await shiftManagementService.shiftAssignTemporaryOrMonthly({ shift_id, employee_id, shiftDateRange, assignment_type, created_by: user?.id })
    } else if (assignment_type == 'default') {
        assignShiftData = await shiftManagementService.shiftAssign({ shift_id, employee_id, start_date, end_date, assignment_type, created_by: user?.id })
    }
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, assignShiftData, httpStatus.OK)
})

const addWeekOff = catchAsync(async(req, res)=>{
    const user = getSessionData(req)
    const {weekoff_details} = req.body
    const addWeekOff = await shiftManagementService.addWeekOff(weekoff_details,user?._id)
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, addWeekOff, httpStatus.OK)
})

const getEmployeeByShiftId = catchAsync(async(req, res)=>{
    const {shift_id} = req.query
    const shiftData = await shiftManagementService.getEmployeeByShiftId({shift_id:shift_id})
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, shiftData, httpStatus.OK)
})

const getEmployeeShiftDetailsById = catchAsync(async(req,res)=>{
    const response = getServiceResFormat();
    const {employee_id,start_date, end_date} = req.query
    const shiftDateRange = getDatesBetweenDates(start_date,end_date)
    const getAllShiftDetails = await shiftManagementService.getAllShiftDetails()
    const getEmployeeShiftDetails = getShiftDetailsDateBetween(getAllShiftDetails, shiftDateRange, employee_id);
    response.data = getEmployeeShiftDetails
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK)
})

const getAllShiftDetails = catchAsync(async(req, res)=>{
    const response = getServiceResFormat();
    const {shift_id, start_date, end_date} = req.query
    const shiftDateRange = getDatesBetweenDates(start_date,end_date)
    const getEmployeeDetails = await shiftManagementService.getEmployeeDetails(shift_id,start_date,end_date)
    const getAllShiftDetails = await shiftManagementService.getAllShiftDetails()
    // console.log("sdfdsfdsf", getAllShiftDetails)
    
    const getAllDetails = getEmployeeDetails.map(employee => {
        const shiftData = getShiftDetailsDateBetween(getAllShiftDetails, shiftDateRange, employee._id);
        return { ...employee, shiftDetails: shiftData };
    });

    let data ={
        shiftDateRange,
        getEmployeeDetails:getAllDetails
    }
    response.data = data;
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK)
})


const getShiftDetailsDateBetween = (getAllShiftDetails, shiftDateRange, employee_id) => {
    const shiftDetails = getAllShiftDetails.filter(item => item?.employee_id?.toString() === employee_id?.toString());
    
    return shiftDateRange.map(date => {
        if (shiftDetails.length > 0) {
            const filteredShifts = shiftDetails.filter((item) =>
                  item.assignment_type === "temporary" &&
                  item.shift_start_date === date.date
              );
            const shift = filteredShifts.length == 0 ? shiftDetails[0] : filteredShifts[0];
            const start = (shift?.shift_start_time)?.split(':');
            const end = (shift?.shift_end_time)?.split(':');

            if (shift.weekOffDetails) {
                if (isWeekOffDay(shift?.weekOffDetails?.number_of_week, date.date)) {
                    return {
                        ...date,
                        status:'shift',
                        shift_name: ['WO'], 
                        color: '#f5f5f5',
                    };
                }
            }else if(shift.calendar_data) {
                if (shift?.calendar_data?.working_days === "5" && isWeekend(date.date)) {
                    return {
                        ...date,
                        status:'shift',
                        shift_name: ['WO'],
                        color: '#f5f5f5',
                    };
                } else if (shift?.calendar_data?.working_days === "6" && is_Sunday(date.date)) {
                    return {
                        ...date,
                        status:'shift',
                        shift_name: ['WO'],
                        color: '#f5f5f5',
                    };
                } else if (shift?.calendar_data?.working_days === "alternative_saturday") {
                    if (is_Saturday(date.date) && count_of_saturday(date.date, shift?.calendar_data?.alternative_saturday_off)) {
                        return {
                            ...date,
                            status:'shift',
                            shift_name: ['WO'], 
                            color: '#f5f5f5',
                        };
                    } else if (is_Sunday(date.date)) {
                        return {
                            ...date,
                            status:'shift',
                            shift_name: ['WO'],
                            color: '#f5f5f5',
                        };
                    }
                }
            }
            return {
                ...date,
                status:'shift',
                color: shift?.color,
                shift_name: [`${shift?.shift_code} (${start[0]}:${start[1]} - ${end[0]}:${end[1]})`]
            };
        }
        return date;
    });
};
const getShiftDetailsDateBetweens = (getAllShiftDetails, shiftDateRange, employee_id) => {
    const shiftDetails = getAllShiftDetails.filter(item => item?.employee_id?.toString() === employee_id?.toString());
    // console.log("sdfdsf", shiftDetails)
    return shiftDateRange.map(date => {
        if (shiftDetails.length > 0) {
            shiftDetails.map(item => {
                if (item.assignment_type == "temporary") {
                    if (date.date == item.shift_start_date && item.employee_id == employee_id) {
                        const shift = item;
                        const start = (shift?.shift_start_time)?.split(':');
                        const end = (shift?.shift_end_time)?.split(':');

                        if (shift.weekOffDetails) {
                            if (isWeekOffDay(shift?.weekOffDetails?.number_of_week, date.date)) {
                                return {
                                    ...date,
                                    shift_name: ['WO'],
                                    color: '#f5f5f5',
                                };
                            }
                        } else if (shift.calendar_data) {
                            if (shift?.calendar_data?.working_days === "5" && isWeekend(date.date)) {
                                return {
                                    ...date,
                                    shift_name: ['WO'],
                                    color: '#f5f5f5',
                                };
                            } else if (shift?.calendar_data?.working_days === "6" && is_Sunday(date.date)) {
                                return {
                                    ...date,
                                    shift_name: ['WO'],
                                    color: '#f5f5f5',
                                };
                            } else if (shift?.calendar_data?.working_days === "alternative_saturday") {
                                if (is_Saturday(date.date) && count_of_saturday(date.date, shift?.calendar_data?.alternative_saturday_off)) {
                                    return {
                                        ...date,
                                        shift_name: ['WO'],
                                        color: '#f5f5f5',
                                    };
                                } else if (is_Sunday(date.date)) {
                                    return {
                                        ...date,
                                        shift_name: ['WO'],
                                        color: '#f5f5f5',
                                    };
                                }
                            }
                        }
                        return {
                            ...date,
                            color: shift?.color,
                            shift_name: [`${shift?.shift_code} (${start[0]}:${start[1]} - ${end[0]}:${end[1]})`]
                        };

                    }
                } else {
                    const shift = item;
                    const start = (shift?.shift_start_time)?.split(':');
                    const end = (shift?.shift_end_time)?.split(':');

                    if (shift.weekOffDetails) {
                        if (isWeekOffDay(shift?.weekOffDetails?.number_of_week, date.date)) {
                            return {
                                ...date,
                                shift_name: ['WO'],
                                color: '#f5f5f5',
                            };
                        }
                    } else if (shift.calendar_data) {
                        if (shift?.calendar_data?.working_days === "5" && isWeekend(date.date)) {
                            return {
                                ...date,
                                shift_name: ['WO'],
                                color: '#f5f5f5',
                            };
                        } else if (shift?.calendar_data?.working_days === "6" && is_Sunday(date.date)) {
                            return {
                                ...date,
                                shift_name: ['WO'],
                                color: '#f5f5f5',
                            };
                        } else if (shift?.calendar_data?.working_days === "alternative_saturday") {
                            if (is_Saturday(date.date) && count_of_saturday(date.date, shift?.calendar_data?.alternative_saturday_off)) {
                                return {
                                    ...date,
                                    shift_name: ['WO'],
                                    color: '#f5f5f5',
                                };
                            } else if (is_Sunday(date.date)) {
                                return {
                                    ...date,
                                    shift_name: ['WO'],
                                    color: '#f5f5f5',
                                };
                            }
                        }
                    }
                    return {
                        ...date,
                        color: shift?.color,
                        shift_name: [`${shift?.shift_code} (${start[0]}:${start[1]} - ${end[0]}:${end[1]})`]
                    };

                }

            })

        }
        console.log("Hello new ", date)
        return date;
    });
};

const  deleteEmployeeInShift = catchAsync(async(req, res)=>{
    const {employee_id} = req.body
    const deleteShift = await shiftManagementService.deleteEmployeeInShift({employee_id})
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, deleteShift, httpStatus.OK)
})
const sheetOne = async()=>{
    const getUserDate = await employeeService.queryUser({})
    const empMap = getUserDate.reduce((acc, val) => {
        if (!acc[val.emp_id]) {
          acc[val.emp_id] = {
            emp_id: val.emp_id,
            Employee_Name: val.employee_name || '',
          };
        }
        return acc;
      }, {});
    
      // Convert the map to an array of objects
      const finalXlData = Object.values(empMap);
    
      return finalXlData;
}
const sheetSeconds = async()=>{
        const getAllShift = await shiftManagementService.getAllShift({})
        let shiftDetails = []
        getAllShift.forEach((data, id)=>{
          let obj ={}
          obj['Shift Name'] = data.shift_name
          obj['Shift Code'] = data.short_name
          obj['Shift Start Time'] = data.shift_start_time
          obj['Shift End Time'] = data.shift_end_time
          obj['Shift Type'] = data.shift_type == "null" ? '':data.shift_type
          shiftDetails.push(obj)
        })
        shiftDetails.push({"Shift Name":"Week Off","Shift Code":"WO"})
        shiftDetails.push({"Shift Name":"No Shift","Shift Code":"NA"})
        return shiftDetails
}

const downloadSample = catchAsync(async (req, res) => {
    const response = getServiceResFormat()
    const user = getSessionData(req)
    const { start_date, end_date } = req.query

    const getDates = getDatesBetweenDateRange(start_date, end_date);
    const dates_array = getDates.map(data => convertDateByMoment(data?.date, "DD"));
    const days = getDates.map(data => `${convertDateByMoment(data?.date, "ddd")}(${convertDateByMoment(data?.date, "DD")})`);

    const [allDetails, shiftDetails] = await Promise.all([
        sheetOne(user),
        sheetSeconds()
    ]);

    const workSheet = XLSX.utils.json_to_sheet(allDetails);
    const workSheet1 = XLSX.utils.json_to_sheet(shiftDetails);

    XLSX.utils.sheet_add_aoa(workSheet, [days], { origin: "D1" });

    const merge = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: dates_array.length - 1 } },
        { s: { r: 1, c: dates_array.length + 6 }, e: { r: 1, c: dates_array.length + 16 } }
    ];
    workSheet["!merges"] = merge;

    const workBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, "Shift");
    XLSX.utils.book_append_sheet(workBook, workSheet1, "Shift_details");

    const FileName = `sample_bulk_upload_shift.xlsx`;
    const filePath = `./public/shift/${FileName}`;
    XLSX.writeFile(workBook, filePath);

    // Return the download URL in the response
    const data = {
        filePath: `${fullBaseUrl}/shift/${FileName}`
    };
    response.data = data

    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK)

})

const uploadShiftMonthWise = catchAsync(async(req, res)=>{
    const user = getSessionData(req);

})



module.exports = {
    createShift,
    getAllShift,
    updateShift,
    deleteShift,
    createShiftConfiguration,
    shiftAssign,
    addCalendar,
    updateShiftCalendar,
    getAllShiftCalendar,
    deleteShiftCalendar,
    getShiftById,
    getEmployeeByShiftId,
    addWeekOff,
    getAllShiftDetails,
    deleteEmployeeInShift,
    isActiveOrInActive,
    getEmployeeShiftDetailsById,
    downloadSample,
    uploadShiftMonthWise,
};