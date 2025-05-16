const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');
const { enumList } = require('../config/enum');

const payrollInvestmentSchema = mongoose.Schema({
    category:{
        type: String,
        required: null,
    },
    category_max_limit: {
        type: String,
        default: null,
    },
    amount: {
        type: Number,
        default: null,
    },
    is_eligible_for_old:{
        type:Boolean,
        default:false,
    },
    is_eligible_for_new:{
        type:Boolean,
        default:false,
    },
    name:{
        type:String,
        default:null,
    },
    is_pre_tax:{
        type:String,
        default:null
    },
    is_max_limit:{
        type:Boolean,
        default:null
    },
    max_limit:{
        type:Number,
        default:null
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

payrollInvestmentSchema.plugin(toJSON);
payrollInvestmentSchema.plugin(paginate);

/**
 * @typedef Model
 */
// const payrollInvestmentModel = mongoose.model('payroll_investment', payrollInvestmentSchema);

// module.exports = payrollInvestmentModel;


module.exports = (db) => {
  return db.model('payroll_investment', payrollInvestmentSchema);
};
