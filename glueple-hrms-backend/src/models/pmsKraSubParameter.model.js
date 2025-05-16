const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const kpiDetailsSchema = mongoose.Schema({
    parameter_id: {
        type:mongoose.Schema.Types.ObjectId,
        required: true,
    },
    key_performance_indicator: {
        type: String,
        required: true,
    },
    measurement_criteria: {
        type: String,
        required: true,
    },
    kpi_weightage: {
        type: Number,
        default: null,
    },
    kpi_target: {
        type: Number,
        default: false,
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

kpiDetailsSchema.plugin(toJSON);
kpiDetailsSchema.plugin(paginate);

/**
 * @typedef pmsKraSubParameterDetailsModel
 */
// const pmsKraSubParameterDetailsModel = mongoose.model('pms_kra_sub_parameter_details', kpiDetailsSchema);

// module.exports = pmsKraSubParameterDetailsModel;

module.exports = (db) => {
  return db.model('pms_kra_sub_parameter_details', kpiDetailsSchema);
};