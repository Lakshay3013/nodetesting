const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const taskSchema = mongoose.Schema({
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    name: {
        type: String,
        trim: true,
        required: true,
    },
    status: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    priority: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    description: {
        type: String,
        default: null
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    watchers: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }],
    task_date: {
        type: String,
        default: null
    },
    due_date: {
        type: String,
        default: null
    },
    original_estimate: {
        type: String,
        default: null
    },
    attachment: {
        type: String,
        default: null
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

taskSchema.plugin(toJSON);
taskSchema.plugin(paginate);

/**
 * @typedef taskModel
 */
// const taskModel = mongoose.model('task', taskSchema);

// module.exports = taskModel;

module.exports = (db) => {
  return db.model('task', taskSchema);
};