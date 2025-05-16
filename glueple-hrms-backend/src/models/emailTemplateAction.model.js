const mongoose = require('mongoose');
const {toJSON, paginate} = require('./plugins');
const { required, boolean, array } = require('joi');


const emailTemplateActionSchema = mongoose.Schema(
    {
        action_name: {
          type:String,
          trim: true,
          required: true,
        },
        action_type:{
            type:String,
            required:true

        },
        template_id:{
            type:mongoose.Schema.Types.ObjectId,
            trim: true,
            required: true,
        },
        sender: {
            type: Array,
            default: [],
        },
        is_active: {
            type: Boolean,
            default:true,
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

emailTemplateActionSchema.plugin(toJSON);
emailTemplateActionSchema.plugin(paginate);

/**
 * @typedef emailTemplateActionModel
 */
// const emailTemplateActionModel = mongoose.model('email_templates_actions', emailTemplateActionSchema);

// module.exports = emailTemplateActionModel

module.exports = (db) => {
  return db.model('email_templates_actions', emailTemplateActionSchema);
};
