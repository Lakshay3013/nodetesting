const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const trainingCertificatesSchema = mongoose.Schema(
    {
        name: {
            type:String,
            required: true,
            trim: true,
        },
        short_name: {
            type:String,
            default: null,
        },
        is_active: {
            type:Boolean,
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

trainingCertificatesSchema.plugin(toJSON);
trainingCertificatesSchema.plugin(paginate);

/**
 * @typedef trainingCertificatesModel
 */
// const trainingCertificatesModel = mongoose.model('training_certificates', trainingCertificatesSchema);

// module.exports = trainingCertificatesModel;


module.exports = (db) => {
  return db.model('training_certificates', trainingCertificatesSchema);
};