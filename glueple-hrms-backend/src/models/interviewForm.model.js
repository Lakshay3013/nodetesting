const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const interviewFormSchema = mongoose.Schema(
    {
        interview_stage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'dropdown_masters',
            required: true,
        },
        question: {
            type: String,
            trim: true,
            required: true,
        },
        input_type: {
            type: String,
            trim: true,
            default: null,
            required: true,
        },
        selection_type: {
            type: String,
            trim: true,
            default: null,
        },
        options: {
            type: Array,
            default: [],
        },
        is_required: {
            type: Boolean,
            default: false,
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
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

interviewFormSchema.plugin(toJSON);
interviewFormSchema.plugin(paginate);

/**
 * @typedef interviewFormModel
 */
// const interviewFormModel = mongoose.model('interview_forms', interviewFormSchema);

// module.exports = interviewFormModel;


module.exports = (db) => {
  return db.model('interview_forms', interviewFormSchema);
};

