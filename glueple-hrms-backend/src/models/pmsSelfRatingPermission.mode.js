const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const selfRatingPermissionSchema = mongoose.Schema({
    permission_type:{
        type:String,
        default:null
    },
    is_rating_allow:{
        type:Boolean,
        default:false,
    },
    employee_ids:{
        type:Array,
        default:[]
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

selfRatingPermissionSchema.plugin(toJSON);
selfRatingPermissionSchema.plugin(paginate);

/**
 * @typedef selfRatingPermissionModel
 */
// const selfRatingPermissionModel = mongoose.model('pms_self_rating_permission', selfRatingPermissionSchema);

// module.exports = selfRatingPermissionModel;


module.exports = (db) => {
  return db.model('pms_self_rating_permission', selfRatingPermissionSchema);
};