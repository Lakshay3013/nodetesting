const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const policySchema = mongoose.Schema({
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'policy_categories',
        required: true,
    },
    title: {
        type: String,
        trim: true,
        required: true,
    },
    description: {
        type: String,
        trim: true,
        required: true,
    },
    content: {
        type: String,
        trim: true,
        default: null,
    },
    file_name: {
        type: String,
        trim: true,
        default: null,
    },
    file_size: {
        type: String,
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

policySchema.plugin(toJSON);
policySchema.plugin(paginate);

/**
 * @typedef policyModel
 */
// const policyModel = mongoose.model('policies', policySchema);

// module.exports = policyModel;

module.exports = (db) => {
  return db.model('policies', policySchema);
};