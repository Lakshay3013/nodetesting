const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');
const { enumList } = require('../config/enum');
const { boolean } = require('joi');

const payrollEarningTypeSchema = mongoose.Schema({
    earning_type_name:{
        type: String,
        trim: true,
        required: true,
    },
    calculation_type: {
        type: String,
        default: null,
    },
    is_active: {
        type: Boolean,
        default: null,
    },
    show_in_payslip: {
        type:String,
        default: null,
    },
    can_include_as_fbp: {
        type:String,
        default: null,
    },
    is_pro_rata: {
        type: String,
        default: null,
    },
    is_included_in_epf: {
        type: String,
        default: null,
    },
    is_included_in_esi: {
        type: String,
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

payrollEarningTypeSchema.plugin(toJSON);
payrollEarningTypeSchema.plugin(paginate);

/**
 * @typedef Model
 */
// const payrollEarningTypeModel = mongoose.model('payroll_earning_types', payrollEarningTypeSchema);

// module.exports = payrollEarningTypeModel;


module.exports = (db) => {
  return db.model('payroll_earning_types', payrollEarningTypeSchema);
};
