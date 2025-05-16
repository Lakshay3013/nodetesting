const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const subDepartmentSchema = mongoose.Schema({
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
    department_id:{
        type:mongoose.Schema.Types.ObjectId,
        default:null
    },
    function_head_id:{
        type:mongoose.Schema.Types.ObjectId,
        default:null
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

subDepartmentSchema.plugin(toJSON);
subDepartmentSchema.plugin(paginate);

/**
 * @typedef subDepartmentModel
 */
// const subDepartmentModel = mongoose.model('sub_departments', subDepartmentSchema);

// module.exports = subDepartmentModel;


module.exports = (db) => {
  return db.model('sub_departments', subDepartmentSchema);
};