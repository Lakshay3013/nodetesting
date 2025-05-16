const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');
const { enumList } = require('../config/enum');
const { boolean, types } = require('joi');

const payrollPayRunSchema = mongoose.Schema({
    payroll_cost:{
        type: Number,
        required: true,
        default: null
    },
    payroll_netPay: {
        type: Number,
        default: null,
    },
    tex: {
        type: Number,
        default: null,
    },
    pre_tex_deduction:{
        type:Number,
        default:null,
    },
    employee_no:{
        type:Number,
        default:null,
    },
    pay_date: {
        type:Number,
        default:null,
      },
    pay_month: {
        type:String,
        default:null
    },
    status:{
        type:Number,
        default:0
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

payrollPayRunSchema.plugin(toJSON);
payrollPayRunSchema.plugin(paginate);

/**
 * @typedef Model
 */
// const payrollPayRunModel = mongoose.model('payroll_payRun', payrollPayRunSchema);

// module.exports = payrollPayRunModel;


module.exports = (db) => {
  return db.model('payroll_payRun', payrollPayRunSchema);
};
