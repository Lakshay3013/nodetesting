const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');
const { enumList } = require('../config/enum');

const payrollArrearsSchema = mongoose.Schema({
    name:{
        type: String,
        trim: true,
        required: true,
    },
    description:{
            type:String,
            trim: true,
            required: true,
    },
    year_mon: {
        type:String,
        default: null,
    },
    arrear_for: {
        type:String,
        default: null,
    },
    earning_consider: {
        type: Array,
        default: [],
    },
    deduction_consider: {
        type: Array,
        default: [],
    },
    employees: {
        type: Array,
        default: [],
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

payrollArrearsSchema.plugin(toJSON);
payrollArrearsSchema.plugin(paginate);

/**
 * @typedef Model
 */
// const payrollArrearsModel = mongoose.model('payroll_arrears', payrollArrearsSchema);

// module.exports = payrollArrearsModel;

module.exports = (db) => {
  return db.model('payroll_arrears', payrollArrearsSchema);
};
