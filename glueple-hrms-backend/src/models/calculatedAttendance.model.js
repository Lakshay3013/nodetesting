const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { enumList } = require('../config/enum');
const { defaultValueForObjectId } = require('./utils/helper');

const calculatedAttendanceSchema = mongoose.Schema(
    {
        emp_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'employees',
            required: true,
        },
        attendance_date: {
            type: String,
            trim: true,
            required: true,
        },
        day_of_week: {
            type: String,
            trim: true,
            required: true,
        },
        first_half_status: {
            type: String,
            trim: true,
            default: null,
        },
        second_half_status: {
            type: String,
            trim: true,
            default: null,
        },
        attendance_status: {
            type: String,
            trim: true,
            default: null,
        },
        first_check_in_time: {
            type: String,
            trim: true,
            default: null,
        },
        last_check_out_time: {
            type: String,
            trim: true,
            default: null,
        },
        total_working_hours : {
            type: String,
            trim: true,
            default: null,
        },
        total_break_time: {
            type: String,
            trim: true,
            default: null,
        },
        total_overtime_hours: {
            type: String,
            trim: true,
            default: null,
        },
        duration: {
            type: String,
            trim: true,
            default: null,
        },
        log_ids: {
            type: Array,
            default: [],
        },
        is_show_to_user: {
            type: Boolean,
            default: false,
        },
        is_late: {
            type: Boolean,
            default: false,
        },
        is_early_exit: {
            type: Boolean,
            default: false,
        },
        late_duration: {
            type: String,
            trim: true,
            default: null,
        },
        early_exit_duration: {
            type: String,
            trim: true,
            default: null,
        },
        approval_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'employees',
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        is_approved: {
            type: Boolean,
            default: true,
        },
        approval_date: {
            type: Date,
            default: null,
        },
        remark: {
            type: String,
            trim: true,
            default: null,
        },
        is_sandwich: {
            type: Boolean,
            default: false,
        },
        actual_status: {
            type: String,
            trim: true,
            default: null,
        },
        deleted_at: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

calculatedAttendanceSchema.plugin(toJSON);
calculatedAttendanceSchema.plugin(paginate);

/**
 * @typedef calculatedAttendanceModel
 */
// const calculatedAttendanceModel = mongoose.model('calculated_attendances', calculatedAttendanceSchema);

// module.exports = calculatedAttendanceModel;

module.exports = (db) => {
  return db.model('calculated_attendances', calculatedAttendanceSchema);
};

