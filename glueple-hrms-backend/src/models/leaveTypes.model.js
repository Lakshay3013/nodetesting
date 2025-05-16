const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { enumList } = require('../config/enum');
const { defaultValueForObjectId } = require('./utils/helper');

const leaveTypeSchema = mongoose.Schema({
    name: {
        type: String,
        unique: true,
        trim: true,
        required: true,
    },
    short_name: {
        type: String,
        unique: true,
        trim: true,
        default: null,
    },
    max_leave_per_year: {
        type: Number,
        default: 0,
    },
    is_carry_forwardable: {
        type: Boolean,
        default: true,
    },
    carry_forward_limit: {
        type: Number,
        default: 0,
    },
    is_expirable: {
        type: Boolean,
        default: false,
    },
    expire_on: {
        type: String,
        enum: enumList?.leaveExpireOn?.list,
        default: enumList?.leaveExpireOn?.default,
    },
    leave_unit: {
        type: String,
        enum: enumList?.leaveUnit?.list,
        default: enumList?.leaveUnit?.default,
    },
    is_encashment: {
        type: Boolean,
        default: false,
    },
    max_days_encashable: {
        type: Number,
        default: 0,
    },
    encashable_formula: {
        type: String,
        default: null,
    },
    is_credit_on_probation: {
        type: Boolean,
        default: false,
    },
    can_view_on_probation: {
        type: Boolean,
        default: true,
    },
    minimum_service_days_to_apply: {
        type: Number,
        default: 0,
    },
    is_deduction: {
        type: Boolean,
        default: true,
    },
    is_allowed_on_notice: {
        type: Boolean,
        default: false,
    },
    leave_type: {
        type: String,
        enum: enumList?.leaveType?.list,
        default: enumList?.leaveType?.default,
    },
    balance_based_on: {
        type: String,
        enum: enumList?.leaveBalanceBasedOn?.list,
        default: enumList?.leaveBalanceBasedOn?.default,
    },
    validity_start_date: {
        type: String,
        default: null,
    },
    validity_end_date: {
        type: String,
        default: null,
    },
    effective_after_number: {
        type: Number,
        default: 0,
    },
    effective_after_name: {
        type: String,
        enum: enumList?.leaveEffectiveAfterName?.list,
        default: enumList?.leaveEffectiveAfterName?.default,
    },
    effective_after_value: {
        type: String,
        enum: enumList?.leaveEffectiveAfterValue?.list,
        default: enumList?.leaveEffectiveAfterValue?.default,
    },
    minimum_days_for_request: {
        type: Number,
        default: 0,
    },
    maximum_days_for_request: {
        type: Number,
        default: 0,
    },
    minimum_interval_between_request: {
        type: Number,
        default: 0,
    },
    applicable_gender: {
        type: Array,
        default: [],
    },
    applicable_marital_status: {
        type: Array,
        default: [],
    },
    applicable_employee: {
        type: Array,
        default: [],
    },
    is_applicale_for_esi_employee: {
        type: Boolean,
        default: true,
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

leaveTypeSchema.plugin(toJSON);
leaveTypeSchema.plugin(paginate);

/**
 * @typedef leaveTypesModel
 */
// const leaveTypesModel = mongoose.model('leave_types', leaveTypeSchema);

// module.exports = leaveTypesModel;

module.exports = (db) => {
  return db.model('leave_types', leaveTypeSchema);
};
