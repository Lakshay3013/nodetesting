const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const policyCategorySchema = mongoose.Schema({
    name: {
        type: String,
        unique: true,
        trim: true,
        required: true,
    },
    is_active: {
        type: Boolean,
        default: true,
    },
    is_deleteable: {
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

policyCategorySchema.plugin(toJSON);
policyCategorySchema.plugin(paginate);

/**
 * @typedef policyCategoryModel
 */
// const policyCategoryModel = mongoose.model('policy_categories', policyCategorySchema);

// module.exports = policyCategoryModel;

module.exports = (db) => {
  return db.model('policy_categories', policyCategorySchema);
};