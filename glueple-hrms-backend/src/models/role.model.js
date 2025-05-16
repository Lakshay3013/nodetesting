const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const roleModelSchema = mongoose.Schema(
  {
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
    is_active: {
      type: Boolean,
      default: true,
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

roleModelSchema.plugin(toJSON);
roleModelSchema.plugin(paginate);

/**
 * @typedef roleModel
 */
// const roleModel = mongoose.model('roles', roleModelSchema);

// module.exports = roleModel;


module.exports = (db) => {
  return db.model('roles', roleModelSchema);
};