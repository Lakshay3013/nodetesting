const mongoose = require('mongoose');
const validator = require('validator');

const smsTemplateSchema = mongoose.Schema(
    {
        sms_string: {
            type: String,
        },
        template_id: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        status: {
            type: Boolean
        },
        keywords: {
            type: Array
        }
    },
    {
        timestamps: true,
    }
);


const smsTemplateModel = mongoose.model('sms_template', smsTemplateSchema);

module.exports = smsTemplateModel;
