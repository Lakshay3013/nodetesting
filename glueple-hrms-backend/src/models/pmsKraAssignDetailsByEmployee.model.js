const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const kraAssignDetailsByEmployeeSchema = mongoose.Schema({
    kra_id: {
        type:mongoose.Schema.Types.ObjectId,
        required: true,
    },
    employee_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    assigned_by: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },
    assign_by_kra: {
        type: Number,
        default: null,
    },
    is_active: {
        type: Boolean,
        default: true,
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

kraAssignDetailsByEmployeeSchema.plugin(toJSON);
kraAssignDetailsByEmployeeSchema.plugin(paginate);

/**
 * @typedef kraAssignDetailsByEmployeeModel
 */
// const kraAssignDetailsByEmployeeModel = mongoose.model('pms_kra_assign_by_employee', kraAssignDetailsByEmployeeSchema);

// module.exports = kraAssignDetailsByEmployeeModel;

module.exports = (db) => {
  return db.model('pms_kra_assign_by_employee', kraAssignDetailsByEmployeeSchema);
};

