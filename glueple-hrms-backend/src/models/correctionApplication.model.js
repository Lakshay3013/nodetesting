const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { enumList } = require('../config/enum');
const { defaultValueForObjectId } = require('./utils/helper');
const { array } = require('joi');


const correctionApplicationSchema = mongoose.Schema({
    emp_id: {
        type: mongoose.Schema.Types.ObjectId,
        trim: true,
        required: true,
    },
    // emp_code: {
    //     type: String,
    //     trim: true,
    //     required: true,
    // },
    date: {
        type: String,
        default: null,
    },
    type: {
        type: String,
        default: null,
    },
    actual_check_in_time: {
        type: String,
        trim: true,
        required: true,
    },
    actual_check_out_time: {
        type: String,
        default: null
        
    },
    correction_check_in_time: {
        type: String,
        default: null
    },
    correction_check_out_time: {
        type: String,
        default: null
    },
    check_in_reason:{
        type:String,
        default:null,
    },
    check_out_reason:{
        type:String,
        default:null,
    },
    attendance_logs:{
        type:Array,
        default:[]
    },
    reason: {
        type: String,
        default: null,
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

correctionApplicationSchema.plugin(toJSON);
correctionApplicationSchema.plugin(paginate);

/**
 * @typedef correctionApplicationModel
 */
// const correctionApplicationModel = mongoose.model('correction_application', correctionApplicationSchema);

// module.exports = correctionApplicationModel;

module.exports = (db) => {
  return db.model('correction_application', correctionApplicationSchema);
};
