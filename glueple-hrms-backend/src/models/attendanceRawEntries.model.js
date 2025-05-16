const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { enumList } = require('../config/enum');
const { defaultValueForObjectId } = require('./utils/helper');

const attendanceRawEntriesSchema = mongoose.Schema(
    {
        emp_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'employees',
            required: true,
        },
        emp_code:{
            type: String,
            default: null,
        },
        capture_file: {
            type: String,
            trim: true,
            default: null,
        },
        image_type:{
            type: String,
            enum: enumList?.imageType?.list,
            default: enumList?.imageType?.default,
        },
        log_type: {
            type: String,
            enum: enumList?.attendanceLogType?.list,
            default: enumList?.attendanceLogType?.default,
        },
        punch_time: {
            type: String,
            default: null,
        },
        latitude: {
            type: String,
            trim: true,
            default: null,
        },
        longitude: {
            type: String,
            trim: true,
            default: null,
        },
        punch_address: {
            type: String,
            trim: true,
            default: null,
        },
        serial_no: {
            type: Number,
            default: null,
        },
        label: {
            type: String,
            trim: true,
            default: null,
        },
        device_from: {
            type: String,
            enum: enumList?.attendanceDeviceFrom?.list,
            default: enumList?.attendanceDeviceFrom?.default,
        },
        user_agent: {
            type: String,
            default: null,
        },
        major: {
            type: String,
            trim: true,
            default: null,
        },
        minor: {
            type: String,
            trim: true,
            default: null,
        },
        approval_to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'employees',
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        is_approved: {
            type: Boolean,
            default: true,
        },
        remark: {
            type: String,
            trim: true,
            default: null,
        },
        attendance_type:{
            type: String,
            enum: enumList?.attendanceType?.list,
            default: enumList?.attendanceType?.default,
        }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

attendanceRawEntriesSchema.plugin(toJSON);
attendanceRawEntriesSchema.plugin(paginate);

/**
 * @typedef attendanceRawEntriesModel
 */
// const attendanceRawEntriesModel = mongoose.model('attendance_raw_entries', attendanceRawEntriesSchema);

// module.exports = attendanceRawEntriesModel;
module.exports = (db) => {
  return db.model('attendance_raw_entries', attendanceRawEntriesSchema);
};
