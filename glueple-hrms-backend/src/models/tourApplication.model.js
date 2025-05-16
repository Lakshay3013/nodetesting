const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { enumList } = require('../config/enum');
const { defaultValueForObjectId } = require('./utils/helper');


const tourApplicationSchema = mongoose.Schema({
    employee_id: {
        type: String,
        trim: true,
        required: true,
    },
    tour_applied_from: {
        type: String,
        default: null,
    },
    tour_applied_to: {
        type: String,
        default: null,
    },
    no_of_days: {
        type: Number,
        required: true,
    },
    visiting_destination: {
        type: String,
        trim: true,
        required: true,
    },
    reason: {
        type: String,
        default: null,
    },
    attechment:{
        type:String,
        default:null,
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

tourApplicationSchema.plugin(toJSON);
tourApplicationSchema.plugin(paginate);

/**
 * @typedef tourApplicationModel
 */
// const tourApplicationModel = mongoose.model('tour_applications', tourApplicationSchema);

// module.exports = tourApplicationModel;

module.exports = (db) => {
  return db.model('tour_applications', tourApplicationSchema);
};