const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');
const { enumList } = require('../config/enum');

const shortLeaveConfigurationSchema = mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
        },
        short_name: {
            type: String,
            default: null,
        },
        used_as: {
            type: String,
            enum: enumList?.shortLeaveUsedAs?.list,
            default: enumList?.shortLeaveUsedAs?.default,
        },
        applicable_within: {
            type: String,
            enum: enumList?.shortLeaveApplicableWithin?.list,
            default: enumList?.shortLeaveApplicableWithin?.default,
        },
        deducted_from: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        deduction_value: {
            type: Number,
            default: 0,
        },
        total_allowed_time: {
            type: String,
            default: null,
        },
        minimum_time_per_request: {
            type: String,
            default: null,
        },
        maximum_time_per_request: {
            type: String,
            default: null,
        },
        total_allowed_request: {
            type: Number,
            default: 0,
        },
        applicable_for: {
            type: String,
            enum: enumList?.shortLeaveApplicableFor?.list,
            default: enumList?.shortLeaveApplicableFor?.default,
        },
        applicable_department: {
            type: Array,
            default: [],
        },
        applicable_designation: {
            type: Array,
            default: [],
        },
        applicable_location: {
            type: Array,
            default: [],
        },
        applicable_role: {
            type: Array,
            default: [],
        },
        applicable_employee: {
            type: Array,
            default: [],
        },
        is_approval_required: {
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
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

shortLeaveConfigurationSchema.plugin(toJSON);
shortLeaveConfigurationSchema.plugin(paginate);

/**
 * @typedef shortLeaveConfigurationModel
 */
// const shortLeaveConfigurationModel = mongoose.model('short_leave_configurations', shortLeaveConfigurationSchema);

// module.exports = shortLeaveConfigurationModel;

module.exports = (db) => {
  return db.model('short_leave_configurations', shortLeaveConfigurationSchema);
};