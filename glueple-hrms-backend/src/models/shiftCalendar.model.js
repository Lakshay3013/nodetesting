const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { enumList } = require('../config/enum');
const validator = require('validator');
const { defaultValueForObjectId } = require('./utils/helper');
const { required } = require('joi');

const shiftCalendarSchema = mongoose.Schema(
    {
    title:{
        type:String,
        required:true
    },
    working_days: {
        type: String,
        required: true,
    },
    alternative_saturday_off: {
        type: Array,
        required: true,
    },
    week_off: {
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

shiftCalendarSchema.plugin(toJSON);
shiftCalendarSchema.plugin(paginate);

/**
 * @typedef shiftConfigurationModel
 */
// const shiftCalendarModel = mongoose.model('shift_calendars', shiftCalendarSchema);

// module.exports = shiftCalendarModel;

module.exports = (db) => {
  return db.model('shift_calendars', shiftCalendarSchema);
};