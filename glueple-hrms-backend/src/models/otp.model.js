const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const {enumList} = require('../config/enum');

const otpSchema = mongoose.Schema({
    employee_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employees',
        required: true,
    },
    email_mobile: {
      type: String,
      trim: true,
      default: null,
    },
    type: {
        type: String,
        enum: enumList?.otpType?.list,
        default: enumList?.otpType?.default,
        required: true,
    },
    otp: {
        type: Number,
        trim: true,
        default: null,
    },
    expires_at: {
      type: Number,
      trim: true,
      default: null,
    }, 
},
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

otpSchema.plugin(toJSON);
otpSchema.plugin(paginate);

/**
 * @typedef otpModel
 */
// const otpModel = mongoose.model('otps', otpSchema);

// module.exports = otpModel;

module.exports = (db) => {
  return db.model('otps', otpSchema);
};
