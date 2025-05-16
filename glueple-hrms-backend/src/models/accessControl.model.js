const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const {enumList} = require('../config/enum');
const { required } = require('joi');


const accessControlSchema = mongoose.Schema(
    {
        permission_for: {
            type: String,
            enum: enumList?.userPermissionType?.list,
            default: enumList?.userPermissionType?.default,
            required: true,
        },
        collection_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        permission_ids:[{
            type:mongoose.Schema.Types.ObjectId,
            required:true
        }
        ]
      },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

accessControlSchema.plugin(toJSON);
accessControlSchema.plugin(paginate);

/**
 * @typedef accessControlModel
 */
// const accessControlModel = mongoose.model('access_controls', accessControlSchema);

// module.exports = accessControlModel;
module.exports = (db) => {
  return db.model('access_controls', accessControlSchema);
};
