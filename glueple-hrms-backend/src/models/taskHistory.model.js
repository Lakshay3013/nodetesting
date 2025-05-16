const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const taskHistorySchema = mongoose.Schema({
    task_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        required: true,
    },
    type: {
        type: String,
        default: null,
    },
    value: {
        type: String,
        default: null,
    },
    description: {
        type: String,
        default: null,
    },
    description: {
        type: String,
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

taskHistorySchema.plugin(toJSON);
taskHistorySchema.plugin(paginate);

/**
 * @typedef taskHistoryModel
 */
// const taskHistoryModel = mongoose.model('task_history', taskHistorySchema);

// module.exports = taskHistoryModel;

module.exports = (db) => {
  return db.model('task_history', taskHistorySchema);
};