const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const leaveBalanceSchema = mongoose.Schema({
    emp_id: {
        type: String,
        required: true,
    },
    employee_id:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    leave_type: {
        type: String,
        default: null,
    },
    leave_name: {
        type: String,
        default: null,
    },
    leave_balance: {
        type: String,
        trim: true,
        required: true,
    },
    leave_short_name: {
        type: String,
        trim: true,
        required: true,
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

leaveBalanceSchema.plugin(toJSON);
leaveBalanceSchema.plugin(paginate);

/**
 * @typedef leaveBalanceModel
 */
// const leaveBalanceModel = mongoose.model('leave_balances', leaveBalanceSchema);

// module.exports = leaveBalanceModel;

module.exports = (db) => {
  return db.model('leave_balances', leaveBalanceSchema);
};
