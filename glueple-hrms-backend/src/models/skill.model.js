const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const skillSchema = mongoose.Schema({
    name: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    short_name: {
      type: String,
      trim: true,
      default: null,
    },
    is_active:{
        type:Boolean,
        default:false
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

skillSchema.plugin(toJSON);
skillSchema.plugin(paginate);

/**
 * @typedef skillModel
 */
// const skillModel = mongoose.model('skill', skillSchema);

// module.exports = skillModel;

module.exports = (db) => {
  return db.model('skill', skillSchema);
};