const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const positionSchema = mongoose.Schema(
    {
        department_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'departments',
            required: true,
        },
        designation_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'designations',
            required: true,
        },
        name: {
          type:String,
          trim:true,
          required: true,
        },
        short_name: {
            type:String,
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
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

positionSchema.plugin(toJSON);
positionSchema.plugin(paginate);

/**
 * @typedef positionModel
 */
// const positionModel = mongoose.model('positions', positionSchema);

// module.exports = positionModel;


module.exports = (db) => {
  return db.model('positions', positionSchema);
};