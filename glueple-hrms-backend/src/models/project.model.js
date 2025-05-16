const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const projectSchema = mongoose.Schema({
    name: {
      type: String,
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
    project_manager_id:{
        type:mongoose.Schema.Types.ObjectId,
        default:null
    },
    sub_department_id:{
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

projectSchema.plugin(toJSON);
projectSchema.plugin(paginate);

/**
 * @typedef projectModel
 */
const projectModel = mongoose.model('project', projectSchema);

module.exports = projectModel;


module.exports = (db) => {
  return db.model('project', projectSchema);
};