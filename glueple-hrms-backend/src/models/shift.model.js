const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { enumList } = require('../config/enum');
const validator = require('validator');
const { defaultValueForObjectId } = require('./utils/helper');

const createShiftConfigurationSchema = mongoose.Schema(
    {
    shift_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'create_shifts',
        default: null,
        set: (value) => defaultValueForObjectId(value)
    },
    over_time: {
        type: Boolean,
        required: true,
    },
    minimum_ot_hours: {
        type: String,
        required: true,
    },
    maximum_ot_hours: {
        type: String,
        required: true,
    },
    working_days: {
        type: String,
        required: true,
    },
    alternative_saturday_off: {
        type: Array,
        required: true,
    },
    week_off: {
        type: Array,
        default: null
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

createShiftConfigurationSchema.plugin(toJSON);
createShiftConfigurationSchema.plugin(paginate);

/**
 * @typedef shiftConfigurationModel
 */
// const shiftConfigurationModel = mongoose.model('shift_configurations', createShiftConfigurationSchema);

// module.exports = shiftConfigurationModel;

module.exports = (db) => {
  return db.model('shift_configurations', createShiftConfigurationSchema);
};