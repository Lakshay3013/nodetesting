const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');
const { enumList } = require('../config/enum');

const createKudosRequestSchema = mongoose.Schema({
    kudos_type: {
        type: String,
        trim: true,
        required: true,
    },
    kudos_category: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    category_value: {
        type: Number,
        trim: true,
        required: true,
    },
    employee_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    action_to: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    expired_at: {
        type: Date,
        default: null,
    },
    status: {
        type: String,
        enum: enumList?.kudos_status?.list,
        default: enumList?.kudos_status?.default,
    },
    description: {
        type: String,
        trim: true,
        default: null,
    },
    remark: {
        type: String,
        trim: true,
        default: null,
    },
    approved_by: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
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

createKudosRequestSchema.plugin(toJSON);
createKudosRequestSchema.plugin(paginate);

/**
 * @typedef createKudosRequestModel
 */
// const createKudosRequestModel = mongoose.model('kudos_request', createKudosRequestSchema);

// module.exports = createKudosRequestModel;

module.exports = (db) => {
  return db.model('kudos_request', createKudosRequestSchema);
};
