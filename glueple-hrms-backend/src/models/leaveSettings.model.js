const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { enumList } = require('../config/enum');
const { defaultValueForObjectId } = require('./utils/helper');

const leaveSettingSchema = mongoose.Schema({
    leave_type_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'leave_types',
        required: true,
    },
    department_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'departments',
        required: true,
    },
    designation_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'designations',
        default: null,
        set: (value) => defaultValueForObjectId(value),
    },
    leave_rules: {
        type: Array,
        default: [],
    },
    consider_present_status: {
        type: Array,
        default: [],
    },
    is_allowed_on_notice: {
        type: Boolean,
        default: false,
    },
    base_on_credit: {
        type: String,
        enum: enumList?.leaveCreditBasis?.list,
        default: enumList?.leaveCreditBasis?.default,
    },
    first_month_rules: {
        type: Array,
        default: [],
    },
    last_month_rules: {
        type: Array,
        default: [],
    },
    count_weekend_as_leave: {
        type: Boolean,
        default: false,
    },
    count_leave_for_preceding_weekends: {
        type: Boolean,
        default: false,
    },
    count_leave_for_succeeding_weekends: {
        type: Boolean,
        default: false,
    },
    count_holiday_as_leave: {
        type: Boolean,
        default: false,
    },
    count_leave_for_preceding_holiday: {
        type: Boolean,
        default: false,
    },
    count_leave_for_succeeding_holiday: {
        type: Boolean, 
        default: false,
    },
    can_exceed_leave_balance: {
        type: Boolean,
        default: true,
    },
    can_exceed_leave_balance_value: {
        type: String,
        enum: enumList?.exceedLeaveBalanceValue?.list,
        default: enumList?.exceedLeaveBalanceValue?.default,
    },
    allow_request_for: {
        type: String,
        enum: enumList?.leaveAllowRequestsFor?.list,
        default: enumList?.leaveAllowRequestsFor?.default,
    },
    allow_request_days: {
        type: Number,
        default: 0,
    },
    allow_request_value: {
        type: String,
        default: null,
    },
    administration_management: {
        type: Boolean,
        default: false,
    },
    enable_file_option: {
        type: Boolean,
        default: false,
    },
    leave_exceed_for_file: {
        type: Number,
        default: 0,
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
    not_allowed_clubbing_with: {
        type: Array,
        default: [],
    },
},
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

leaveSettingSchema.plugin(toJSON);
leaveSettingSchema.plugin(paginate);

/**
 * @typedef leaveSettingModel
 */
// const leaveSettingModel = mongoose.model('leave_settings', leaveSettingSchema);

// module.exports = leaveSettingModel;


module.exports = (db) => {
  return db.model('leave_settings', leaveSettingSchema);
};

