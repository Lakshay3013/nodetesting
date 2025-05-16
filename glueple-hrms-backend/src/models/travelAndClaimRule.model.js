const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');
const designationModel = require('./designation.model');

const travelAndClaimRuleSchema = mongoose.Schema(
     {
            travel_id:{
                type: mongoose.Schema.Types.ObjectId,
                required:true,
            },
            name: {
                type:String,
                required: true,
            },
            max_amount: {
                type: Number,
                default: null,
            },
            per_kilometer_price:{
                type: Number,
                default: null,
            },
            parking_charges:{
                type: Number,
                default: null,
            },
            travel_class:{
                type: mongoose.Schema.Types.ObjectId,
                default: null,
            },
            date:{
                type:String,
                default:null
            },
            is_active:{
                type:Boolean,
                default:false
            },
            self:{
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

travelAndClaimRuleSchema.plugin(toJSON);
travelAndClaimRuleSchema.plugin(paginate);

/**
 * @typedef travelAndClaimModelRule
 */
// const travelAndClaimModelRule = mongoose.model('travel_and_claim_rule', travelAndClaimRuleSchema);

// module.exports = travelAndClaimModelRule;


module.exports = (db) => {
  return db.model('travel_and_claim_rule', travelAndClaimRuleSchema);
};