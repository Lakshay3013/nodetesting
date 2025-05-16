const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');
const { enumList } = require('../config/enum');

const payrollAdvanceEmiSchema = mongoose.Schema({
    advance_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'payroll_advance',
        required: true,
    },
    emi_amount: {
        type: Number,
        default: null,
    },
    interest_amount: {
        type: Number,
        default: null,
    },
    total_amount: {
        type:Number,
        default: null,
    },
    paid_amount: {
        type:Number,
        default: null,
    },
    emi_perc: {
        type: String,
        default: null,
    },
    payment_date: {
        type: Date,
        default: null,
    },
    deu_date: {
        type: Date,
        default: null,
    },
    installment_number: {
        type: Number,
        default: null,
    },
    statue: {
        type: String,
        enum: enumList?.emi_status?.list,
        default: enumList?.emi_status?.default,
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

payrollAdvanceEmiSchema.plugin(toJSON);
payrollAdvanceEmiSchema.plugin(paginate);

/**
 * @typedef payrollAdvanceEmiModel
 */
// const payrollAdvanceEmiModel = mongoose.model('payroll_advance_emi', payrollAdvanceEmiSchema);

// module.exports = payrollAdvanceEmiModel;

module.exports = (db) => {
  return db.model('payroll_advance_emi', payrollAdvanceEmiSchema);
};

