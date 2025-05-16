const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { enumList } = require('../config/enum');
const { defaultValueForObjectId } = require('./utils/helper');

const weekOffAssignSchema = mongoose.Schema({
    employee_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employees',
        default: null,
        set: (value) => defaultValueForObjectId(value)
    },
    day_of_week: {
        type: String,
        enum: enumList?.weekOffDays?.list,
        default: enumList?.weekOffDays?.default,
    },
    number_of_week: {
        type: Array,
        default: null
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

weekOffAssignSchema.plugin(toJSON);
weekOffAssignSchema.plugin(paginate);

/**
 * @typedef weekOffAssignModel
 */
// const weekOffAssignModel = mongoose.model('weekOff_Assigns', weekOffAssignSchema);

// module.exports = weekOffAssignModel;

module.exports = (db) => {
  return db.model('weekOff_Assigns', weekOffAssignSchema);
};