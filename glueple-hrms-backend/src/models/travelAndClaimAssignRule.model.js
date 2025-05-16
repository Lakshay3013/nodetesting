const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const travelAndClaimAssignRule = mongoose.Schema(
    {
        department_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        designation_id: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
       travel_rule_ids:{
        type:Array,
        default:[]
       },
        date:{
            type:String,
            default:null
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

travelAndClaimAssignRule.plugin(toJSON);
travelAndClaimAssignRule.plugin(paginate);

/**
 * @typedef travelAndClaimAssignRuleModel
 */
// const travelAndClaimAssignRuleModel = mongoose.model('travel_and_claim_assign_rule', travelAndClaimAssignRule);

// module.exports = travelAndClaimAssignRuleModel;

module.exports = (db) => {
  return db.model('travel_and_claim_assign_rule', travelAndClaimAssignRule);
};
