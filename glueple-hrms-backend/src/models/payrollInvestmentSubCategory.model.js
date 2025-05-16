const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const payrollInvestmentSubCategorySchema = mongoose.Schema({
    category_id:{
        type: mongoose.Schema.Types.ObjectId,
        trim: true,
        required: true,
    },
    sub_category_name:{
        type: String,
        default:null,
    },
    input_type:{
        type:String,
        default:null
    },
    max_limit:{
        type:Boolean,
        default:false
    },
    max_limit_amount: {
        type:Number,
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

payrollInvestmentSubCategorySchema.plugin(toJSON);
payrollInvestmentSubCategorySchema.plugin(paginate);

/**
 * @typedef Model
 */
// const payrollInvestmentSubCategoryModel = mongoose.model('payroll_investment_SubCategory', payrollInvestmentSubCategorySchema);

// module.exports = payrollInvestmentSubCategoryModel;

module.exports = (db) => {
  return db.model('payroll_investment_SubCategory', payrollInvestmentSubCategorySchema);
};
