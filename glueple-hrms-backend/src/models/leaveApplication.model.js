const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { enumList } = require('../config/enum');
const { defaultValueForObjectId } = require('./utils/helper');
const tripledes = require('crypto-js/tripledes');
const { types } = require('joi');

const leaveApplicationSchema = mongoose.Schema({
    emp_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    emp_code: {
        type: String,
        required: true,
    },
    leave_start_date: {
        type: String,
        default: null,
    },
    leave_end_date: {
        type: String,
        default: null,
    },
    leave_type: {
        type: mongoose.Schema.Types.ObjectId,
        trim: true,
        required: true,
    },
    leave_status: {
        type: String,
        trim: true,
        required: true,
    },
    reason: {
        type: String,
        default: null,
    },
    attechment:{
        type:String,
        default:null,
    },
    short_leave_start_time:{
        type:String,
        default:null,
    },
    short_leave_end_time:{
        type:String,
        default:null,
    },
    is_cancel:{
        type:Boolean,
        default:false,
    },
    cancel_date:{
        type:String,
        default:null,
    },
    cancel_by:{
        type:mongoose.Schema.Types.ObjectId,
        default:null,
    },
    is_sandwich:{
        type:Boolean,
        default:false,
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

leaveApplicationSchema.plugin(toJSON);
leaveApplicationSchema.plugin(paginate);

/**
 * @typedef leaveApplicationModel
 */
// const leaveApplicationModel = mongoose.model('leave_applications', leaveApplicationSchema);

// module.exports = leaveApplicationModel;


module.exports = (db) => {
  return db.model('leave_applications', leaveApplicationSchema);
};

