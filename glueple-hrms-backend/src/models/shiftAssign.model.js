const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { enumList } = require('../config/enum');
const { defaultValueForObjectId } = require('./utils/helper');

const shiftAssignSchema = mongoose.Schema({
    shift_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shift_details',
        default: null,
        set: (value) => defaultValueForObjectId(value)
    },
    employee_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employees',
        default: null,
        set: (value) => defaultValueForObjectId(value)
    },
    start_date: {
        type: String,
        default: null
    },
    end_date: {
        type: String,
        default: null
    },
    assignment_type: {
        type: String,
        enum: enumList?.assignmentShiftType?.list,
        default: enumList?.assignmentShiftType?.default,
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        set: (value) => defaultValueForObjectId(value),
    },
},
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

shiftAssignSchema.plugin(toJSON);
shiftAssignSchema.plugin(paginate);

/**
 * @typedef shiftAssignModel
 */
// const shiftAssignModel = mongoose.model('shift_Assigns', shiftAssignSchema);

// module.exports = shiftAssignModel;

module.exports = (db) => {
  return db.model('shift_Assigns', shiftAssignSchema);
};