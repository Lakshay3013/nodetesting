const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const kraRatingSchema = mongoose.Schema({
    financial_id: {
        type:mongoose.Schema.Types.ObjectId,
        required: true,
    },
    kra_id: {
        type:mongoose.Schema.Types.ObjectId,
        required: true,
    },
    kra_parameter_id: {
        type:mongoose.Schema.Types.ObjectId,
        required: true,
    },
    kra_sub_parameter_id: {
        type:mongoose.Schema.Types.ObjectId,
        required: true,
    },
    key_performance_indicator: {
        type: String,
        default: null,
    },
    measurement_criteria:{
        type: String,
        default: null,
    },
    kpi_weightage:{
        type:Number,
        default:null
    },
    kpi_target:{
        type:Number,
        default:null
    },
    kra_rating_type:{
        type:Number,
        default:null
    },
    employee_id:{
        type:mongoose.Schema.Types.ObjectId,
        default:null
    },
    month:{
        type:Number,
        default:null
    },
    year:{
        type:Number,
        default:null
    },
    rating_remark:{
        type:String,
        default:null
    },
    feedback:{
        type:String,
        default:null
    },
    self_rating_remark:{
        type:String,
        default:null
    },
    self_feedback:{
        type:String,
        default:null
    },
    rating_given_by:{
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

kraRatingSchema.plugin(toJSON);
kraRatingSchema.plugin(paginate);

/**
 * @typedef kraRatingModel
 */
// const kraRatingModel = mongoose.model('pms_kra_rating_details', kraRatingSchema);

// module.exports = kraRatingModel;

module.exports = (db) => {
  return db.model('pms_kra_rating_details', kraRatingSchema);
};