const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const kraDetailsParameterSchema = mongoose.Schema({
    kra_id: {
        type:mongoose.Schema.Types.ObjectId,
        required: true,
    },
    parameter_name: {
        type: String,
        required: true,
       
    },
    parameter_weightage: {
        type: Number,
        required: true,
    },
    bonus_duration: {
        type: String,
        default: null,
    },
    parameter_weightage_status: {
        type: Boolean,
        default: false,
    },
    is_active: {
            type: Boolean,
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

kraDetailsParameterSchema.plugin(toJSON);
kraDetailsParameterSchema.plugin(paginate);

/**
 * @typedef kraDetailsParameterModel
 */
// const kraDetailsParameterModel = mongoose.model('pms_kra_parameter_details', kraDetailsParameterSchema);

// module.exports = kraDetailsParameterModel;


module.exports = (db) => {
  return db.model('pms_kra_parameter_details', kraDetailsParameterSchema);
};