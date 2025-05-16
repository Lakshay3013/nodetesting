const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');
const { enumList } = require('../config/enum');
const { boolean, types } = require('joi');

const payrollPayScheduleSchema = mongoose.Schema({
    pay_schedule_type:{
        type: String,
        required: true,
        default: null
    },
    no_of_working_days:{
        type: String,
        default: null
    },
    pay_on:{
        type:String,
        default:null
    },
    pay_day: {
        type: Number,
        default: null,
    },
    pay_date: {
        type: String,
        default: null,
    },
    pay_period_start_date:{
        type:String,
        default:null,
    },
    pay_month: {
        type:String,
        default:null
    },
    status:{
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
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

payrollPayScheduleSchema.plugin(toJSON);
payrollPayScheduleSchema.plugin(paginate);

/**
 * @typedef Model
 */
// const payrollPayScheduleModel = mongoose.model('payroll_paySchedule', payrollPayScheduleSchema);

// module.exports = payrollPayScheduleModel;


module.exports = (db) => {
  return db.model('payroll_paySchedule', payrollPayScheduleSchema);
};
