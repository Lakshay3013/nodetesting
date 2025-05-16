const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');
const { enumList } = require('../config/enum');

const loanEmiSchema = mongoose.Schema({
    loan_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'loans',
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

loanEmiSchema.plugin(toJSON);
loanEmiSchema.plugin(paginate);

/**
 * @typedef loanModel
 */
const loanEmiModel = mongoose.model('loan_emi', loanEmiSchema);

module.exports = loanEmiModel;

module.exports = (db) => {
  return db.model('loan_emi', loanEmiSchema);
};
