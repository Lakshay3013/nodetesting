const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const onboardingFieldsSchema = mongoose.Schema({
    step_id: {
        // type: mongoose.Schema.Types.ObjectId,
        // ref: 'onboarding_steps',
        type: String,
        required: true,
    },
    name: {
        type: String,
        trim: true,
        required: true,
    },
    key_name: {
        type: String,
        trim: true,
        required: true,
    },
    is_required: {
        type: Boolean,
        default: true,
    },
    is_active: {
        type: Boolean,
        default: true,
    },
    sort_order: {
        type: Number,
        default: 0,
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

onboardingFieldsSchema.plugin(toJSON);
onboardingFieldsSchema.plugin(paginate);

/**
 * @typedef onboardingFieldsModel
 */
// const onboardingFieldsModel = mongoose.model('onboarding_fields', onboardingFieldsSchema);

// module.exports = onboardingFieldsModel;

module.exports = (db) => {
  return db.model('onboarding_fields', onboardingFieldsSchema);
};
