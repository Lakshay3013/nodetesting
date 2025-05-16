const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const validator = require('validator');

const branchesSchema = mongoose.Schema({
    name: {
        type: String,
        
        trim: true,
        required: true,
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
    address: {
        type: String,
        default: null,
    },
    pincode: {
        type: Number,
        default: null,
    },
    contact_no: {
        type: Number,
        default: null,
    },
    contact_email: {
        type: String,
        unique: false,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
          if (!validator.isEmail(value)) {
            throw new Error('Invalid email');
          }
        },
    },
    is_main: {
        type: Number,
        default: 0,
    },
},
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

branchesSchema.plugin(toJSON);
branchesSchema.plugin(paginate);

/**
 * @typedef branchesModel
 */
// const branchesModel = mongoose.model('branches', branchesSchema);

// module.exports = branchesModel;

module.exports = (db) => {
  return db.model('branches', branchesSchema);
};
