const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const departmentSchema = mongoose.Schema({
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
    deleted_at: {
      type: Date,
      default: null,
    },
    head_id: {
      type: Array,
      default: [],
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

departmentSchema.plugin(toJSON);
departmentSchema.plugin(paginate);

/**
 * @typedef departmentModel
 */
// const departmentModel = mongoose.model('departments', departmentSchema);

// module.exports = departmentModel;

module.exports = (db) => {
  return db.model('departments', departmentSchema);
};
