const { query } = require('express');
const Joi = require('joi');
const { launchBus } = require('pm2');

const checkInCheckOut = {
    body: Joi.object().keys({
        log_type: Joi.string().required().label("Log Type"),
        punch_time: Joi.string().required().label("Punch Time"),
        ip_address: Joi.string().optional().allow('').label("IP Address"),
        latitude: Joi.number().required().label("Latitude"),
        longitude: Joi.number().required().label("Longitude"),
        punch_address: Joi.string().optional().allow('').label("Punch Address"),
        device_from: Joi.string().required().label("Device From"),
        user_agent: Joi.string().optional().allow("").label("User Agent"),
        attendance_type:Joi.string().optional().allow('').label("attendance type"),
        emp_code:Joi.string().optional().allow('').label('Emp code'),
        emp_img:Joi.string().optional().allow('').label("Employee image"),
    }),
};

const calculatedAttendance = {
    body: Joi.object().keys({
        start_date: Joi.string().required().label("Start Date"),
        end_date: Joi.string().required().label("End Date"),
        is_show_to_user: Joi.boolean().required().label("Show to user"),
        log_format: Joi.string().required().label("Log Format"),
        emp_id:Joi.string().optional().allow('')
    }),
};

const applyAttendanceCorrection = {
    body:Joi.object().keys({
        emp_id:Joi.string().required().label('emp id'),
        emp_code:Joi.string().optional().allow("").label("emp code"),
        date:Joi.string().required().label("date"),
        type:Joi.string().required().label("type"),
        actual_check_in_time:Joi.string().required().label("actual check in time"),
        actual_check_out_time:Joi.string().optional().allow('').label("actual check out time"),
        correction_check_in_time:Joi.string().optional().allow(''),
        correction_check_out_time:Joi.string().optional().allow(''),
        attendance_logs:Joi.array().optional().allow(''),
        check_in_reason:Joi.string().optional().allow("").label('check in reason'),
        check_out_reason:Joi.string().optional().allow("").label('check out reason'),
        reason:Joi.string().optional().allow("").label('reason')
    })
}

const getSelfAttendance = {
    query:Joi.object().keys({
        emp_id: Joi.string().optional().allow('').label('Emp id'),
        start_date:Joi.string().required().label("Start date"),
        end_date:Joi.string().required().label("End date"),
         limit: Joi.number().optional().allow(0).label('Limit'),
         page: Joi.number().optional().allow(0).label('Page'),
               
    })
}

const getMyTeamAttendance = {
    query:Joi.object().keys({
        start_date:Joi.string().required().label("Start date"),
        end_date:Joi.string().required().label("end date")
    })
}

const attendanceLock = {
    body:Joi.object().keys({
        month:Joi.string().required().label("Month"),
        year:Joi.number().required().label("Year"),
        is_lock:Joi.boolean().optional().label("Is Lock")
    })
}

const getAttendanceLock = {
    query: Joi.object().keys({
            limit: Joi.number().optional().allow(0).label('Limit'),
            page: Joi.number().optional().allow(0).label('Page'),
        })
}

const updateAttendanceLock = {
    body:Joi.object().keys({
        _id:Joi.string().required().label("Id"),
        month:Joi.string().required().label("Month"),
        year:Joi.number().required().label("Year"),
        is_lock:Joi.boolean().optional().label("Is Lock")
    })

}

const applyTours = {
    body:Joi.object().keys({
        destination:Joi.string().required().label("Visiting Destination"),
        reason:Joi.string().required().label("Reason"),
        tourDetails:Joi.array().required().label("Tour Details"),
    })
}

// const getAttendanceCorrectionRequest = {
//     query:Joi.object().keys({

//     })
// }

module.exports = {
    checkInCheckOut,
    calculatedAttendance,
    applyAttendanceCorrection,
    getSelfAttendance,
    getMyTeamAttendance,
    attendanceLock,
    getAttendanceLock,
    updateAttendanceLock,
    applyTours
};