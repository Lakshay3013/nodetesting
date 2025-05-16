const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const addKudosCategorySchema = mongoose.Schema({
    name: {
        type: String,
        unique: true,
        trim: true,
        required: true,
    },
    points: {
        type: Number,
        trim: true,
        required: true,
    },
    type: {
        type: String,
        trim: true,
        required: true,
    },
    description: {
        type: String,
        trim: true,
        required: true,
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

addKudosCategorySchema.plugin(toJSON);
addKudosCategorySchema.plugin(paginate);

/**
 * @typedef addKudosCategoryModel
 */
// const addKudosCategoryModel = mongoose.model('kudos_categories', addKudosCategorySchema);

// module.exports = addKudosCategoryModel;
module.exports = (db) => {
  return db.model('kudos_categories', addKudosCategorySchema);
};
