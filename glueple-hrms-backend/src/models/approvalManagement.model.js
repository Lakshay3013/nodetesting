const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { enumList } = require('../config/enum');
const { defaultValueForObjectId } = require('./utils/helper');

const approvalManagementSchema = mongoose.Schema(
    {
        department_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'departments',
            required: true,
        },
        sub_department_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'sub_departments',
            required: true,
        },
        designation_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'designations',
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        position_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'positions',
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        approval_level: {
            type: String,
            enum: enumList?.approvalLevel?.list,
            default: enumList?.approvalLevel?.default,
            required: true,
        },
        auto_approve_assign_after: {
            type: Number,
            required: true,
        },
        auto_approve_assign_to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'designations',
            required: true,
        },
        assigned_to: {
            type: [],
            default: null,
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'employees',
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        type: {
            type: String,
            default: null,
            required: true,
        }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

approvalManagementSchema.plugin(toJSON);
approvalManagementSchema.plugin(paginate);

/**
 * @typedef approverModel
 */
// const approverModel = mongoose.model('approval_managements', approvalManagementSchema);

// module.exports = approverModel;

const leaveBalanceModel = mongoose.model('approval_managements', approvalManagementSchema);
