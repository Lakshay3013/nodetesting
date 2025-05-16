const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const payrollInvestmentCategorySchema = mongoose.Schema({
    category:{
        type: String,
        trim: true,
        required: true,
    },
    input_type:{
        type: String,
        trim: true,
    },
    alert:{
        type: String,
        trim: true,
    },
    max_limit:{
        type:Boolean,
        default:false,
    },
    max_limit_amount: {
        type:Number,
        default: null,
    },
    is_eligible_for_new: {
        type:Boolean,
        default: false,
    },
    is_eligible_for_old: {
        type: Boolean,
        default: false,
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

payrollInvestmentCategorySchema.plugin(toJSON);
payrollInvestmentCategorySchema.plugin(paginate);

/**
 * @typedef Model
 */
// const payrollInvestmentCategoryModel = mongoose.model('payroll_investment_categories', payrollInvestmentCategorySchema);

// module.exports = payrollInvestmentCategoryModel;


module.exports = (db) => {
  return db.model('payroll_investment_categories', payrollInvestmentCategorySchema);
};
