const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const payrollAdvanceSchema = mongoose.Schema({
    employee_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employees',
        required: true,
    },
    loan_type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'dropdown_masters',
        default: null,
    },
    amount: {
        type: Number,
        default: null,
    },
    start_date: {
        type:Date,
        default: null,
    },
    end_date: {
        type:Date,
        default: null,
    },
    tenure_duration: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'dropdown_masters',
        default: null,
    },
    interest_rate: {
        type: Number,
        default: null,
    },
    emi_type: {
        type: String,
        default: null,
    },
    extra_payment_allowed: {
        type: String,
        default: null,
    },
    is_active: {
        type: Boolean,
        default: true,
    },
    deleted_at: {
        type: Date,
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

payrollAdvanceSchema.plugin(toJSON);
payrollAdvanceSchema.plugin(paginate);

/**
 * @typedef payrollAdvanceModel
 */
// const payrollAdvanceModel = mongoose.model('payroll_advance', payrollAdvanceSchema);

// module.exports = payrollAdvanceModel;


module.exports = (db) => {
  return db.model('payroll_advance', otpSchema);
};
