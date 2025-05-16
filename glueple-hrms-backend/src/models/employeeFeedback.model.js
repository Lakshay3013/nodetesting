const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');
const { enumList } = require('../config/enum');

const employeeFeedbackSchema = mongoose.Schema({
    type: {
        type: String,
        trim: true,
        required: true,
    },
    feedback_team: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },
    feedback_to: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },
    feedback_title: {
        type: String,
        default: null,
    },
    feedback_description: {
        type: String,
        default: null,
    },
    feedback_rating: {
        type: Number,
        default: null,
    },
    feedback_type: {
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
employeeFeedbackSchema.plugin(toJSON);
employeeFeedbackSchema.plugin(paginate);

/**
 * @typedef Model
 */
// const employeeFeedbackModel = mongoose.model('employee_feedback', employeeFeedbackSchema);

// module.exports = employeeFeedbackModel;


module.exports = (db) => {
  return db.model('employee_feedback', employeeFeedbackSchema);
};
