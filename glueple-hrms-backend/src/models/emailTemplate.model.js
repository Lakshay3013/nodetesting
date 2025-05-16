const mongoose = require('mongoose');
const {toJSON, paginate} = require('./plugins');
const { required, boolean, array } = require('joi');


const emailTemplateSchema = mongoose.Schema(
    {
        template_name: {
          type:String,
          trim: true,
          required: true,
        },
        email_type:{
            type:String,
            required:true

        },
        email_title:{
            type:String,
            trim: true,
            required: true,
        },
        body: {
            type:String,
            trim: true,
            required: true,
        },
        field:{
            type: Array,
            default: [],
        },
        remark:{
            type:String,
            trim:true,
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

emailTemplateSchema.plugin(toJSON);
emailTemplateSchema.plugin(paginate);

/**
 * @typedef emailTemplateModel
 */
// const emailTemplateModel = mongoose.model('email_templates', emailTemplateSchema);

// module.exports = emailTemplateModel

module.exports = (db) => {
  return db.model('email_templates', emailTemplateSchema);
};
