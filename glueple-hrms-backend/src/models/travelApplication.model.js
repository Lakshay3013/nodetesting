const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const travelApplicationSchema = mongoose.Schema(
    {
        employee_id:{
            type: mongoose.Schema.Types.ObjectId,
            required:true,
        },
        travel_name: {
            type:String,
            required: true,
            trim: true,
        },
        travel_type: {
            type: String,
            default: null,
        },
        date:{
            type:String,
            default:null
        },
        purpose_of_travel:{
            type:String,
            default:null,
        },
        travel_details:{
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
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

travelApplicationSchema.plugin(toJSON);
travelApplicationSchema.plugin(paginate);

/**
 * @typedef travelApplicationModel
 */
// const travelApplicationModel = mongoose.model('travel_application', travelApplicationSchema);

// module.exports = travelApplicationModel;

module.exports = (db) => {
  return db.model('travel_application', travelApplicationSchema);
};