const mongoose = require('mongoose');
const { toJSON, paginate } = require('../../../models/plugins');


const clientAccessControlSchema = mongoose.Schema(
    {
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

clientAccessControlSchema.plugin(toJSON);
clientAccessControlSchema.plugin(paginate);

/**
 * @typedef clientAccessControlModel
 */
const clientAccessControlModel = mongoose.model('client_access_controls', clientAccessControlSchema);

module.exports = clientAccessControlModel;
