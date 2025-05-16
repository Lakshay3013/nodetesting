const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { enumList } = require('../config/enum');
const validator = require('validator');
const { defaultValueForObjectId } = require('./utils/helper');

const createShiftSchema = mongoose.Schema({

    shift_name: {
        type: String,
        trim: true,
        required: true,
    },
    shift_code: {
        type: String,
        trim: true,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    is_active: {
        type: Boolean,
        required: true,
    },
    shift_start_time: {
        type: String,
        required: true,
    },
    shift_end_time: {
        type: String,
        required: true,
    },
    break_start_time: {
        type: String,
        default: null
    },
    break_end_time: {
        type: String,
        default: null
    },
    early_arrival_tolerance: {
        type: String,
        default: null
    },
    late_departure_tolerance: {
        type: String,
        default: null
    },
    grace_start_time:{
        type:String,
        default:null
    },
    grace_end_time:{
        type:String,
        default:null
    },
    half_day_policy_time: {
        type: String,
        default: null
    },
    full_day_policy_time: {
        type: String,
        default: null
    },
    shift_type: {
        type: String,
        default: null
    },
    is_default: {
        type: Boolean,
        default: false
    },
    is_ot_time:{
        type: Boolean,
        default:null
    },
    minimum_ot_hours: {
        type: String,
        default:null
    },
    maximum_ot_hours: {
        type: String,
        default:null
    },
    calendar_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'shift_calendars',
        default: null,
        set: (value) => defaultValueForObjectId(value)
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

createShiftSchema.plugin(toJSON);
createShiftSchema.plugin(paginate);

/**
 * @typedef createShiftModel
 */
// const createShiftModel = mongoose.model('shift_details', createShiftSchema);

// module.exports = createShiftModel;

module.exports = (db) => {
  return db.model('shift_details', createShiftSchema);
};