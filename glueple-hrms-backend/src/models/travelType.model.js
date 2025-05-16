const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');
const designationModel = require('./designation.model');

const travelTypeSchema = mongoose.Schema(
    {
        name: {
            type:String,
            required: true,
            trim: true,
        },
        description:{
            type:String,
            default:null
        },
        travel_and_claim_rule:{
            type:Array,
            default:[]
        },
        travel_category:{
            type: mongoose.Schema.Types.ObjectId,
            default:null
        },
        is_active: {
            type:Boolean,
            default: true,
        },
        is_travel:{
            type:Boolean,
            default:false
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

travelTypeSchema.plugin(toJSON);
travelTypeSchema.plugin(paginate);

/**
 * @typedef travelTypeModel
 */
// const travelTypeModel = mongoose.model('travel_type', travelTypeSchema);

// module.exports = travelTypeModel;


module.exports = (db) => {
  return db.model('travel_type', travelTypeSchema);
};