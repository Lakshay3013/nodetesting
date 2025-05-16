const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const statesSchema = mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        trim: true,
        required: true,
    },
    country_id: {
        type: Number,
        required: true,
    },
    country_code: {
        type: String,
        trim: true,
        default: null,
    },
    state_code: {
        type: String,
        trim: true,
        default: null,
    },
    type: {
        type: String,
        trim: true,
        default: 'state',
    },
    latitude: {
        type: String,
        trim: true,
        default: null,
    },
    longitude: {
        type: String,
        trim: true,
        default: null,
    },
    deleted_at: {
        type: Date,
        default: null,
    },
},
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

statesSchema.plugin(toJSON);
statesSchema.plugin(paginate);

/**
 * @typedef statesModel
 */
// const statesModel = mongoose.model('states', statesSchema);

// module.exports = statesModel;

module.exports = (db) => {
  return db.model('states', statesSchema);
};
