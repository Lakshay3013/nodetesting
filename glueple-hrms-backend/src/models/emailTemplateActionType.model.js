const mongoose = require('mongoose');
const {toJSON, paginate} = require('./plugins');
const { required, boolean, array } = require('joi');


const emailTemplateActionTypeSchema = mongoose.Schema(
    {
        action_name: {
          type:String,
          trim: true,
          required: true,
        },
        is_deleted:{
            type: Boolean,
            default: false,
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

emailTemplateActionTypeSchema.plugin(toJSON);
emailTemplateActionTypeSchema.plugin(paginate);

/**
 * @typedef emailTemplateActionTypeSchema
 */
// const emailTemplateActiontypeModel = mongoose.model('email_template_action_type', emailTemplateActionTypeSchema);

// module.exports = emailTemplateActiontypeModel


module.exports = (db) => {
  return db.model('email_template_action_type', emailTemplateActionTypeSchema);
};