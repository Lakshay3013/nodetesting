const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');
const { enumList } = require('../config/enum');

const payrollEmployeeInvestmentSchema = mongoose.Schema({
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
    section_6a_declarations:{
        type:Array,
        default:[],
    },
    proof_of_Investment:{
        type:String,
        default:null
    },
    is_active:{
        type:Boolean,
        default:false
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

payrollEmployeeInvestmentSchema.plugin(toJSON);
payrollEmployeeInvestmentSchema.plugin(paginate);

/**
 * @typedef Model
 */
// const payrollEmployeeInvestmentModel = mongoose.model('payroll_employee_investment', payrollEmployeeInvestmentSchema);

// module.exports = payrollEmployeeInvestmentModel;

module.exports = (db) => {
  return db.model('payroll_employee_investment', payrollEmployeeInvestmentSchema);
};
