const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');
const { enumList } = require('../config/enum');

const postSchema = mongoose.Schema({
    start_date:{
        type:String,
        default:null
    },
    end_date:{
        type:String,
        default:null
    },
    type: {
        type: String,
        enum: enumList?.postType?.list,
        default: enumList?.postType?.default,
    },
    description: {
        type: String,
        trim: true,
        default: null,
    },
    employee_id:{
        type:String,
        default:null
    },
    added_by:{
        type:String,
        default:null
    },
    read_by:{
        type:String,
        default:null
    },
    is_active:{
        type:Boolean,
        default:true
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

postSchema.plugin(toJSON);
postSchema.plugin(paginate);

/**
 * @typedef postModel
 */
// const postModel = mongoose.model('posts', postSchema);

// module.exports = postModel;

module.exports = (db) => {
  return db.model('posts', postSchema);
};