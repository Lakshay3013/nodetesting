const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const kraDetailsSchema = mongoose.Schema({
    kra_name: {
        type:String,
        required: true,
    },
    kra_rating_type: {
        type: String,
        required: true,
    },
    rating_duration: {
        type: String,
        required: true,
    },
    bonus_duration: {
        type: String,
        default: null,
    },
    kra_weightage_status: {
        type: Boolean,
        default: false,
    },
    is_eligible_for_assign_status: {
        type: Boolean,
        default: false,
    },
    financial_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },
    is_active: {
        type: Boolean,
        default: true,
    },
    department_id:{
        type:mongoose.Schema.Types.ObjectId,
        default:null
    },
    function_id:{
        type:mongoose.Schema.Types.ObjectId,
        default:null
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

kraDetailsSchema.plugin(toJSON);
kraDetailsSchema.plugin(paginate);

/**
 * @typedef kraDetailsModel
 */
// const kraDetailsModel = mongoose.model('pms_kra_details', kraDetailsSchema);

// module.exports = kraDetailsModel;

module.exports = (db) => {
  return db.model('pms_kra_details', kraDetailsSchema);
};

