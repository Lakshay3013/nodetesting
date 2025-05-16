const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const kudosPointHistorySchema = mongoose.Schema({
    employee_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    action_type: {
        type: String,
        required: true,
    },
    kudos_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    points: {
        type: Number,
        required: true,
    },
    approved_by: {
        type: mongoose.Schema.Types.ObjectId,
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

kudosPointHistorySchema.plugin(toJSON);
kudosPointHistorySchema.plugin(paginate);

/**
 * @typedef kudosPointHistoryModel
 */
// const kudosPointHistoryModel = mongoose.model('kudos_points_histories', kudosPointHistorySchema);

// module.exports = kudosPointHistoryModel;


module.exports = (db) => {
  return db.model('kudos_points_histories', kudosPointHistorySchema);
};

