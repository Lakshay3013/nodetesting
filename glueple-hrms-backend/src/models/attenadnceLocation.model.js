const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { enumList } = require('../config/enum');
const { defaultValueForObjectId } = require('./utils/helper');
const { required } = require('joi');

const attendanceLocationSchema = mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },
        location_name: {
            type: String,
            required: true,
        },
        latitude:{
            type: String,
            required:true,
        },
        longitude: {
            type: String,
            required:true,
        },
        attendance_radius:{
            type:String,
            default:null
        }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

attendanceLocationSchema.plugin(toJSON);
attendanceLocationSchema.plugin(paginate);

/**
 * @typedef attendanceLocationModel
 */
// const attendanceLocationModel = mongoose.model('attendance_location', attendanceLocationSchema);

// module.exports = attendanceLocationModel;
module.exports = (db) => {
  return db.model('attendance_location', attendanceLocationSchema);
};
