const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { enumList } = require('../config/enum');

const leaveBalanceLogsSchema = mongoose.Schema({
    emp_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "employees",
        required: true,
    },
    leave_type_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "leave_types",
        required: true,
    },
    leave_value: {
        type: Number,
        default: null,
    },
    status: {
        type: String,
        enum: enumList?.leaveBalanceStatus?.list,
        default: enumList?.leaveBalanceStatus?.default,
        required: true,
    },
    is_approved: {
        type: Boolean,
        default: true,
    },
    remark: {
        type: String,
        default: null,
    },
    approved_on: {
        type: Date,
        default: null,
    },
    added_from: {
        type: String,
        enum: enumList?.leaveBalanceAddedFrom?.list,
        default: enumList?.leaveBalanceAddedFrom?.default,
        required: true,
    },
    added_from_value: {
        type: String,
        default: null,
    },
},
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

leaveBalanceLogsSchema.plugin(toJSON);
leaveBalanceLogsSchema.plugin(paginate);

/**
 * @typedef leaveBalanceLogsModel
 */
// const leaveBalanceLogsModel = mongoose.model('leave_balance_logs', leaveBalanceLogsSchema);

// module.exports = leaveBalanceLogsModel;


module.exports = (db) => {
  return db.model('leave_balance_logs', leaveBalanceLogsSchema);
};

