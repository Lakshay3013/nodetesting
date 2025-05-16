const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const {enumList} = require('../config/enum');
const { defaultValueForObjectId } = require('./utils/helper');


const approverSchema = mongoose.Schema(
    {
        approver_id: {
            type: Array,
            required: true,
            default: [],
        },
        collection_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        type: {
            type:String,
            trim: true,
            default: null,
        },
        comment: {
            type:String,
            trim: true,
            default: null,
        },
        action_type: {
            type: String,
            enum: enumList?.approverActionType?.list,
            default: enumList?.approverActionType?.default,
            required: true,
        },
        action_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'employees',
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        action_date: {
            type: Date,
            default: null,
        }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

approverSchema.plugin(toJSON);
approverSchema.plugin(paginate);

/**
 * @typedef approverModel
 */
// const approverModel = mongoose.model('approvers', approverSchema);

// module.exports = approverModel;

module.exports = (db) => {
  return db.model('approvers', approverSchema);
};
