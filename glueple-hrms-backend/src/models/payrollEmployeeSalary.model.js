const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');
const { enumList } = require('../config/enum');
const { boolean, types } = require('joi');

const payrollEmployeeSalarySchema = mongoose.Schema({
    employee_id:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    type: {
        type: String,
        default: null,
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
    // earnings:{
    //     types:Array,
    //     default:[]
    // },
    // deductions:{
    //     types:Array,
    //     default:[]
    // },
    // bonus:{
    //     types:Object,
    //     default:{}
    // },
    // ctc:{
    //     types:Object,
    //     default:{}
    // },
    // gross:{
    //     types:Object,
    //     default:{}
    // },
    // total_employee:{
    //     types:Object,
    //     default:{}
    // },
    // total_employer:{
    //     types:Object,
    //     default:{}
    // },
    // total_ctc:{
    //     types:Object,
    //     default:{}
    // },
    // take_home:{
    //     types:Object,
    //     default:{}
    // },
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
        type: mongoose.Schema.Types.ObjectId,
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

payrollEmployeeSalarySchema.plugin(toJSON);
payrollEmployeeSalarySchema.plugin(paginate);

/**
 * @typedef Model
 */
// const   payrollEmployeeSalaryModel = mongoose.model('payroll_employee_salaries', payrollEmployeeSalarySchema);

// module.exports = payrollEmployeeSalaryModel;


module.exports = (db) => {
  return db.model('payroll_employee_salaries', payrollEmployeeSalarySchema);
};
