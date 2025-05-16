const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { enumList } = require('../config/enum');
const validator = require('validator');
const { defaultValueForObjectId } = require('./utils/helper');

const candidateSchema = mongoose.Schema({
  mrf_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mrfs',
    required: true,
  },
  auto_id: {
    type: Number,
    required: true,
    default: null,
  },
  name: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
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
  mobile: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    default: null,
  },
  pincode: {
    type: String,
    default: null,
  },
  year_of_experience: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'dropdown_masters',
    required: true,
  },
  source: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'dropdown_masters',
    required: true,
  },
  linkedin_id: {
    type: String,
    default: null,
  },
  skills: {
    type: Array,
    default: [],
  },
  final_selection: {
    type: Boolean,
    default: false,
  },
  offer_letter_status: {
    type: String,
    enum: enumList?.offerLetterStatus?.list,
    default: enumList?.offerLetterStatus?.default,
  },
  offer_letter_send_at: {
    type: Date,
    default: null,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'employees',
    default: null,
    set: (value) => defaultValueForObjectId(value),
  },
},
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

candidateSchema.plugin(toJSON);
candidateSchema.plugin(paginate);

/**
 * @typedef candidateModel
 */
// const candidateModel = mongoose.model('candidates', candidateSchema);

// module.exports = candidateModel;

module.exports = (db) => {
  return db.model('candidates', candidateSchema);
};
