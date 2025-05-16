const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');
const { enumList } = require('../config/enum');

const mediaFilesSchema = mongoose.Schema({
    type: {
        type: String,
        enum: enumList?.postType?.list,
        default: enumList?.postType?.default,
    },
    file_name: {
        type: String,
        default: null,
    },
    mime_type: {
        type: String,
        default: null,
    },
    size: {
        type: Number,
        default: null,
    },
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'create_posts',
        default: null,
    },
},
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

mediaFilesSchema.plugin(toJSON);
mediaFilesSchema.plugin(paginate);

/**
 * @typedef createPostModel
 */
// const mediaFilesModel = mongoose.model('media_files', mediaFilesSchema);

// module.exports = mediaFilesModel;

module.exports = (db) => {
  return db.model('media_files', mediaFilesSchema);
};

