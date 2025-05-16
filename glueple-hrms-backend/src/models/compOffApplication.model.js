const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { enumList } = require('../config/enum');
const { defaultValueForObjectId } = require('./utils/helper');
const { array } = require('joi');


const coffApplicationSchema = mongoose.Schema({
    emp_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    date: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        trim: true,
        required: true,
    },
    working_hours: {
        type: String,
        default: null,
    },
    reason: {
        type: String,
        default: null,
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

coffApplicationSchema.plugin(toJSON);
coffApplicationSchema.plugin(paginate);

/**
 * @typedef compOffApplicationModel
 */
// const compOffApplicationModel = mongoose.model('compOff_applications', coffApplicationSchema);

// module.exports = compOffApplicationModel;

module.exports = (db) => {
  return db.model('compOff_applications', coffApplicationSchema);
};
