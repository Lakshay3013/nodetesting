const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const taskProjectTypeSchema = mongoose.Schema({
    name: {
        type: String,
        unique: true,
        trim: true,
        required: true,
    },
    short_name: {
        type: String,
        trim: true,
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

taskProjectTypeSchema.plugin(toJSON);
taskProjectTypeSchema.plugin(paginate);

/**
 * @typedef taskProjectTypeModel
 */
// const taskProjectTypeModel = mongoose.model('task_project_type', taskProjectTypeSchema);

// module.exports = taskProjectTypeModel;

module.exports = (db) => {
  return db.model('task_project_type', taskProjectTypeSchema);
};
