const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');
const { enumList } = require('../config/enum');

const feedbackTeamsSchema = mongoose.Schema({
    name: {
        type: String,
        unique:true,
        trim: true,
        required: true,
    },
    emp_ids: {
        type: [mongoose.Schema.Types.ObjectId],
        default: [],
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
feedbackTeamsSchema.plugin(toJSON);
feedbackTeamsSchema.plugin(paginate);

/**
 * @typedef Model
 */
// const feedbackTeamsModel = mongoose.model('feedback_teams', feedbackTeamsSchema);

// module.exports = feedbackTeamsModel;


module.exports = (db) => {
  return db.model('feedback_teams', feedbackTeamsSchema);
};

