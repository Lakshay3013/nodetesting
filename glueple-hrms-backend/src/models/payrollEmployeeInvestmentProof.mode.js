const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');
const { enumList } = require('../config/enum');

const payrollEmployeeInvestmentProofSchema = mongoose.Schema({
    employee_id:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    tax_regime: {
        type: String,
        default: null,
    },
    financial_year:{
        type:mongoose.Schema.Types.ObjectId,
        default:null,
    },
    investment_category_id:{
        type:mongoose.Schema.Types.ObjectId,
        default:null,
    },
    proof_of_Investment:{
        type:String,
        default:null
    },
    is_active:{
        type:Boolean,
        default:false
    },
    comment:{
        type:Array,
        default:[]
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

payrollEmployeeInvestmentProofSchema.plugin(toJSON);
payrollEmployeeInvestmentProofSchema.plugin(paginate);

/**
 * @typedef Model
 */
// const payrollEmployeeInvestmentProofModel = mongoose.model('payroll_employee_investment_proof', payrollEmployeeInvestmentProofSchema);

// module.exports = payrollEmployeeInvestmentProofModel;


module.exports = (db) => {
  return db.model('payroll_employee_investment_proof', payrollEmployeeInvestmentProofSchema);
};
