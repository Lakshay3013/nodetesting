const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');
const { enumList } = require('../config/enum');

const postCommentSchema = mongoose.Schema({
    emp_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'create_posts',
        default: null,
    },
    content: {
        type: String,
        default: null,
    },
},
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

postCommentSchema.plugin(toJSON);
postCommentSchema.plugin(paginate);

/**
 * @typedef postCommentModel
 */
// const postCommentModel = mongoose.model('post_comments', postCommentSchema);

// module.exports = postCommentModel;


module.exports = (db) => {
  return db.model('post_comments', postCommentSchema);
};