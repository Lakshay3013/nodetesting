const mongoose = require('mongoose');
const { toJSON, paginate } = require('../../../models/plugins');
const { defaultValueForObjectId } = require('../../../models/utils/helper');


const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        trim: true,
        required: true,
    },
    name:{
        type:String,
        required:true
    },
    is_active:{
        type:Boolean,
        default:true
    },
    salt:{
        type:String,
        default:null
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

userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * @typedef userModel
 */
const userModel = mongoose.model('user', userSchema);

module.exports = userModel;
