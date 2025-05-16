const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const taskProjectSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    short_name: {
        type: String,
        trim: true,
        default: null,
    },
    project_type: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    description: {
        type: String,
        default: null
    },
    project_lead: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    assigned_project: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }],
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

taskProjectSchema.plugin(toJSON);
taskProjectSchema.plugin(paginate);

/**
 * @typedef taskProjectModel
 */
// const taskProjectModel = mongoose.model('task_project', taskProjectSchema);

// module.exports = taskProjectModel;


module.exports = (db) => {
  return db.model('task_project', taskProjectSchema);
};