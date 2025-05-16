const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const citiesSchema = mongoose.Schema({
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
    state_id: {
        type: Number,
        required: true,
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

citiesSchema.plugin(toJSON);
citiesSchema.plugin(paginate);

/**
 * @typedef citiesModel
 */
// const citiesModel = mongoose.model('cities', citiesSchema);

// module.exports = citiesModel;

module.exports = (db) => {
  return db.model('cities', citiesSchema);
};

