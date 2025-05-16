// Internal Imports
const util = require("util");

//External Imports
const request = require("request");
const asyncModule = require("async");
const XLSX = require("xlsx");
const fs = require("fs");
const moment = require("moment");

//Custom Imports

const commonController = require('../modules/api/controller/common.controller')
const attendanceCorrection = require('../modules/api/controller/attendance.controller');
const { currentDate } = require("../modules/api/utils/dateTimeHelper");


// exports.attendance_auto_check_out = async () => {
//   try {
//     request(
//       {
//         uri: 'http://localhost:3001/attendance_management/attendance_auto_check_out',
//         method: "GET",
//       },
//       async (error, response, body) => {
//         if (error) {
//           console.log("Error occurred when hit api for check employee attendance check out cron " + error);
//         } else {
//           console.log(body);
//         }
//       }
//     );
//   } catch (error) {
//     console.error(
//       util.format(
//         `Error occured while running schedule add recipient scheduler, ERROR: %O`,
//         error
//       )
//     );
//     throw error;
//   }
// };


exports.cronGetCheckInCheckOutInGlueple = async () => {
    try {
        let data = {
            emp_id: ''
        }
        let result = await commonController.checkInCheckOutMachineFunction(data)
    } catch (error) {
        console.error(
            util.format(
                `Error occured while running schedule sendMailToManager scheduler, ERROR: %O`,
                error
            )
        );
        throw error;
    }
};

exports.calculateAttendanceCron = async () => {
    try {
        const today = currentDate()
        let data = {
            start_date: today,
            end_date: today,
            is_show_to_user: false,
            log_format: "IN/OUT"
        }
        let result = await attendanceCorrection.calculateAttendanceFunction(data)
    } catch (error) {
        console.error(
            util.format(
                `Error occured while running schedule sendMailToManager scheduler, ERROR: %O`,
                error
            )
        );
        throw error;
    }
} 
