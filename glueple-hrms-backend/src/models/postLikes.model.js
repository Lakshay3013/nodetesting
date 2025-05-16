const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');
const { enumList } = require('../config/enum');

const postLikesSchema = mongoose.Schema({
    emp_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'create_posts',
        default: null,
    },
    emoji: {
        type: String,
        default: null,
    },
},
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

postLikesSchema.plugin(toJSON);
postLikesSchema.plugin(paginate);

/**
 * @typedef postLikesModel
 */
// const postLikesModel = mongoose.model('post_likes', postLikesSchema);

// module.exports = postLikesModel;

module.exports = (db) => {
  return db.model('post_likes', postLikesSchema);
};