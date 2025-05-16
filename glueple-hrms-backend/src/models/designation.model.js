const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const designationSchema = mongoose.Schema(
    {
        department_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'departments',
            required: true,
        },
        name: {
          type:String,
          trim: true,
          required: true,
        },
        short_name: {
            type:String,
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
            default:[],
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'designation',
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

designationSchema.plugin(toJSON);
designationSchema.plugin(paginate);

/**
 * @typedef designationModel
 */
// const designationModel = mongoose.model('designations', designationSchema);

// module.exports = designationModel;


module.exports = (db) => {
  return db.model('designations', designationSchema);
};