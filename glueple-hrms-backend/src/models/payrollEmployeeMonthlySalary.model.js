const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');
const { enumList } = require('../config/enum');
const { boolean, types } = require('joi');

const payrollEmployeeMonthlySalarySchema = mongoose.Schema({
    employee_id:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    type: {
        type: String,
        default: null,
    },
    present_days:{
      type:Number,
      default:0
    },
    total_days:{
      type:Number,
      default:0
    },
    year_mon: {
        type: String,
        default: null,
    },
    is_hold:{
        type:Boolean,
        default:false,
    },
    offer_latter_type:{
        type:String,
        default:null,
    },
    ctc: {
        payslip_name: { type: String },
        monthly: { type: Number },
        yearly: { type: Number },
        real: { type: Number },
      },
      earnings: [
        {
          payslip_name: { type: String },
          name: { type: String },
          value: { type: Number },
          rules: { type: Array, default: [] },
          value_in: { type: String },
          monthly: { type: Number },
          yearly: { type: Number },
          real: { type: Number },
        },
      ],
      deductions: [
        {
          payslip_name: { type: String },
          name: { type: String },
          value: { type: Number },
          rules: { type: Array, default: [] },
          value_in: { type: String },
          monthly: { type: Number },
          yearly: { type: Number },
          real: { type: Number },
        },
      ],
      bonus: {
        payslip_name: { type: String },
        name: { type: String },
        value: { type: Number },
        value_in: { type: String },
        monthly: { type: Number },
        yearly: { type: Number },
        real: { type: Number },
      },
      gross: {
        payslip_name: { type: String },
        monthly: { type: Number },
        yearly: { type: Number },
        real: { type: Number },
      },
      total_employee: {
        payslip_name: { type: String },
        monthly: { type: Number },
        yearly: { type: Number },
        real: { type: Number },
      },
      total_employer: {
        payslip_name: { type: String },
        monthly: { type: Number },
        yearly: { type: Number },
        real: { type: Number },
      },
      total_ctc: {
        payslip_name: { type: String },
        monthly: { type: Number },
        yearly: { type: Number },
        real: { type: Number },
      },
      take_home: {
        payslip_name: { type: String },
        monthly: { type: Number },
        yearly: { type: Number },
        real: { type: Number },
      },
    arrear_id:{
        type:Number,
        default:null,
    },
    monthly_tax:{
        type:Number,
        default:null
    },
    notice_period:{
        type:Number,
        default:null,
    },
    notice_period_in:{
        type:String,
        default:null,
    },
    probation_period:{
        type:Number,
        default:null,
    },
    probation_period_in:{
        type:String,
        default:null,
    },
    arrear_day:{
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

payrollEmployeeMonthlySalarySchema.plugin(toJSON);
payrollEmployeeMonthlySalarySchema.plugin(paginate);

/**
 * @typedef Model
 */
// const payrollEmployeeMonthlySalaryModel = mongoose.model('payroll_employee_monthly_salary', payrollEmployeeMonthlySalarySchema);

// module.exports = payrollEmployeeMonthlySalaryModel;

module.exports = (db) => {
  return db.model('payroll_employee_monthly_salary', payrollEmployeeMonthlySalarySchema);
};

