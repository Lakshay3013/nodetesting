const mongoose = require('mongoose');
const {toJSON, paginate} = require('./plugins');
const { required, boolean } = require('joi');

const emailTypeSchema = mongoose.Schema(
    {
        name:{
            type:String,
            trim:true,
            required:true
        },
        is_active:{
            type: Boolean,
            default:true
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
)
emailTypeSchema.plugin(toJSON);
emailTypeSchema.plugin(paginate);

/**
 * @typedef emailTypeModele
 */
// const  emailTypeModele = mongoose.model("email_types", emailTypeSchema)


// module.exports = emailTypeModele

module.exports = (db) => {
  return db.model('email_types', emailTypeSchema);
};
