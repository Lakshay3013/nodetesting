const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const {enumList} = require('../config/enum');
const { defaultValueForObjectId } = require('./utils/helper');

const permissionSchema = mongoose.Schema(
    {
        sort_order: {
            type: Number,
            default: 0,
        },
        category: {
            type: String,
            enum: enumList?.permissionCategory?.list,
            default: enumList?.permissionCategory?.default,
            required: true,
        },
        icon: {
            type: String,
            default: null,
        },
        permission_type: {
            type: String,
            enum: enumList?.permissionType?.list,
            default: enumList?.permissionType?.default,
            required: true,
        },
        route_key: {
            type: String,
            default: null,
        },
        routes: {
            type: String,
            default: null,
        },
        title: {
            type: String,
            trim: true,
            unique: true,
            required: true,
        },
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'permissions',
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        sub_title: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

permissionSchema.plugin(toJSON);
permissionSchema.plugin(paginate);

/**
 * @typedef permissionModel
 */
// const permissionModel = mongoose.model('permissions', permissionSchema);

// module.exports = permissionModel;

module.exports = (db) => {
  return db.model('permissions', permissionSchema);
};
