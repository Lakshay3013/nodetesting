const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');
const { enumList } = require('../config/enum');

const employeeSkillSchema = mongoose.Schema({
    skill_id: {
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
employeeSkillSchema.plugin(toJSON);
employeeSkillSchema.plugin(paginate);

/**
 * @typedef employeeSkillModel
 */
// const employeeSkillModel = mongoose.model('employee_skill', employeeSkillSchema);

// module.exports = employeeSkillModel;


module.exports = (db) => {
  return db.model('employee_skill', employeeSkillSchema);
};
