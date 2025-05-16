const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');
const { enumList } = require('../config/enum');

const payrollEarningSchema = mongoose.Schema({
    payslip_name:{
        type: String,
        trim: true,
        required: true,
    },
    earning_type:{
        type: mongoose.Schema.Types.ObjectId,
        trim: true,
        required: true,
    },
    name: {
        type: String,
        trim: true,
        required: true,
    },
    value: {
        type: Number,
        default: null,
    },
    value_in: {
        type: String,
        default: null,
    },
    is_optional: {
        type: Boolean,
        default: true,
    },
    max_allowance: {
        type: String,
        default: null,
    },
    include_in_ctc: {
        type: Boolean,
        default: false,
    },
    rules: {
        type: Array,
        default: [],
    },
    is_variable_pay: {
        type: Boolean,
        default: false,
    },
    is_taxable: {
        type: Boolean,
        default: false,
    },
    is_active: {
        type: Boolean,
        default: true,
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

payrollEarningSchema.plugin(toJSON);
payrollEarningSchema.plugin(paginate);

/**
 * @typedef Model
 */
// const payrollEarningModel = mongoose.model('payroll_earnings', payrollEarningSchema);

// module.exports = payrollEarningModel;


module.exports = (db) => {
  return db.model('payroll_earnings', payrollEarningSchema);
};
