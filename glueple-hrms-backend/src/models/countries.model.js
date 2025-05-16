const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const countriesSchema = mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        unique: true,
        trim: true,
        required: true,
    },
    iso3: {
        type: String,
        trim: true,
        default: null,
    },
    iso2: {
        type: String,
        trim: true,
        default: null,
    },
    numeric_code: {
        type: Number,
        default: null,
    },
    phone_code: {
        type: Number,
        default: null,
    },
    capital: {
        type: String,
        trim: true,
        default: null,
    },
    currency: {
        type: String,
        trim: true,
        default: null,
    },
    currency_name: {
        type: String,
        trim: true,
        default: null,
    },
    currency_symbol: {
        type: String,
        trim: true,
        default: null,
    },
    tld: {
        type: String,
        trim: true,
        default: null,
    },
    native: {
        type: String,
        trim: true,
        default: null,
    },
    region: {
        type: String,
        trim: true,
        default: null,
    },
    subregion: {
        type: String,
        trim: true,
        default: null,
    },
    nationality: {
        type: String,
        trim: true,
        default: null,
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
    emoji: {
        type: String,
        trim: true,
        default: null,
    },
    emojiU: {
        type: String,
        trim: true,
        default: null,
    },
    timezones: {
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

countriesSchema.plugin(toJSON);
countriesSchema.plugin(paginate);

/**
 * @typedef countriesModel
 */
// const countriesModel = mongoose.model('countries', countriesSchema);

// module.exports = countriesModel;


module.exports = (db) => {
  return db.model('countries', countriesSchema);
};
