const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const claimApplicationSchema = mongoose.Schema(
    {
        travel_id:{
            type: mongoose.Schema.Types.ObjectId,
            required:true,
        },
        travel_details:{
            type:Array,
            default:[]
        },
        employee_id:{
            type: mongoose.Schema.Types.ObjectId,
            required:true,
        },
        bill_no: {
            type: String,
            default: null,
        },
        amount:{
            type:Number,
            default:null,
        },
        description:{
            type:String,
            default:null,
        },
        date:{
            type:String,
            default:null
        },
        bill_image:{
            type:String,
            default:null
        },
        is_draft:{
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

claimApplicationSchema.plugin(toJSON);
claimApplicationSchema.plugin(paginate);

/**
 * @typedef claimApplicationModel
 */
// const claimApplicationModel = mongoose.model('claim_application', claimApplicationSchema);

// module.exports = claimApplicationModel;

module.exports = (db) => {
  return db.model('claim_application', claimApplicationSchema);
};

