const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');
const { enumList } = require('../config/enum');

const employeeProjectSchema = mongoose.Schema({
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },
    employee_id: {
        type: mongoose.Schema.Types.ObjectId,
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
employeeProjectSchema.plugin(toJSON);
employeeProjectSchema.plugin(paginate);

/**
 * @typedef employeeProjectModel
 */
// const employeeProjectModel = mongoose.model('employee_project', employeeProjectSchema);

// module.exports = employeeProjectModel;
module.exports = (db) => {
  return db.model('employee_project', employeeProjectSchema);
};
