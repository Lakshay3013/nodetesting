const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const qualificationsSchema = mongoose.Schema(
    {
        parent_id: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        name: {
            type:String,
            required: true,
            trim: true,
        },
        short_name: {
            type:String,
            default: null,
        },
        deleted_at: {
            type: Date,
            default: null,
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

qualificationsSchema.plugin(toJSON);
qualificationsSchema.plugin(paginate);

/**
 * @typedef qualificationsModel
 */
// const qualificationsModel = mongoose.model('qualifications', qualificationsSchema);

// module.exports = qualificationsModel;

module.exports = (db) => {
  return db.model('qualifications', qualificationsSchema);
};