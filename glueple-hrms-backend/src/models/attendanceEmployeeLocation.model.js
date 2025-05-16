const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { enumList } = require('../config/enum');
const { defaultValueForObjectId } = require('./utils/helper');

const attendanceEmployeeLocationSchema = mongoose.Schema(
    {
        employee_id:{
            type:String,
            required:true
        },
        location_id: {
            type: String,
            required: true,
        },
        attendance_radius:{
            type: Number,
            required:true,
        },
        is_active:{
            type:Boolean,
            default:true
        },
         created_by: {
                type: mongoose.Schema.Types.ObjectId,
                default: null,
                set: (value) => defaultValueForObjectId(value),
            },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

attendanceEmployeeLocationSchema.plugin(toJSON);
attendanceEmployeeLocationSchema.plugin(paginate);

/**
 * @typedef attendanceLocationModel
 */
// const attendanceEmployeeLocationModel = mongoose.model('attendance_employee_location', attendanceEmployeeLocationSchema);

// module.exports = attendanceEmployeeLocationModel;

module.exports = (db) => {
  return db.model('attendance_employee_location', attendanceEmployeeLocationSchema);
};
