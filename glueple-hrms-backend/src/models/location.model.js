const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const locationSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    address: {
        type: String,
        default: null,
    },
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cities',
        default: null,
    },
    state: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'states',
        default: null,
    },
    country: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'countries',
        default: null,
    },
    postal_code: {
        type: String,
        default: null,
    },
    timezone: {
        type: String,
        default: null,
    },
    office_start_time: {
        type: String,
        default: null,
    },
    office_end_time: {
        type: String,
        default: null,
    },
    employee_leave_year_start: {
        type: String,
        default: null,
    },
    office_working_hours: {
        type: String,
        default: null,
    },
    is_metro: {
        type: Boolean,
        default: false,
    },
    is_active: {
        type: Boolean,
        default: true,
    },
    deleted_at: {
        type: Date,
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

locationSchema.plugin(toJSON);
locationSchema.plugin(paginate);

/**
 * @typedef locationsModel
 */
// const locationsModel = mongoose.model('locations', locationSchema);

// module.exports = locationsModel;

module.exports = (db) => {
  return db.model('locations', loanEmiSchema);
};
