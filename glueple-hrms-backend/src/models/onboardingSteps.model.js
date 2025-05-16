const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const onboardingStepsSchema = mongoose.Schema({
    name: {
        type: String,
        unique: true,
        trim: true,
        required: true,
    },
    short_name: {
        type: String,
        unique: true,
        trim: true,
        default: null,
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

onboardingStepsSchema.plugin(toJSON);
onboardingStepsSchema.plugin(paginate);

/**
 * @typedef onboardingStepsModel
 */
// const onboardingStepsModel = mongoose.model('onboarding_steps', onboardingStepsSchema);

// module.exports = onboardingStepsModel;

module.exports = (db) => {
  return db.model('onboarding_steps', onboardingStepsSchema);
};
