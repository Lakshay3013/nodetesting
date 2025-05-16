const mongoose = require('mongoose');
const { toJSON, paginate } = require('../../../models/plugins');
const { defaultValueForObjectId } = require('../../../models/utils/helper');
const { enumList } = require('../../../config/enum');


const clientPermissionSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    permission_type: {
        type: String,
        enum: enumList?.permissionType?.list,
        default: enumList?.permissionType?.default,
        required: true,
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'client_permissions',
        default: null,
        set: (value) => defaultValueForObjectId(value),
    },
    key:{
        type: String,
        required: true,
    },
    is_active: {
        type: Boolean,
        default: true
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

clientPermissionSchema.plugin(toJSON);
clientPermissionSchema.plugin(paginate);

/**
 * @typedef clientPermissionModel
 */
const clientPermissionModel = mongoose.model('client_permission', clientPermissionSchema);

module.exports = clientPermissionModel;
