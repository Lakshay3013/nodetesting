const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { enumList } = require('../config/enum');
const { defaultValueForObjectId } = require('./utils/helper');
const { required } = require('joi');

const attendanceLockSchema = mongoose.Schema(
    {
        month: {
            type: String,
            required: true,
        },
        year:{
            type: String,
            required:true,
        },
        lock_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'employees',
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        is_lock:{
            type:Boolean,
            default:false,
        }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

attendanceLockSchema.plugin(toJSON);
attendanceLockSchema.plugin(paginate);

/**
 * @typedef attendanceLockModel
 */
// const attendanceLockModel = mongoose.model('attendance_lock', attendanceLockSchema);

// module.exports = attendanceLockModel;

module.exports = (db) => {
  return db.model('attendance_lock', attendanceLockSchema);
};
