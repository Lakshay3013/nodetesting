const Joi = require('joi');

exports.createSmsTemplate = {
    body: Joi.object().keys({
        sms_string: Joi.string().required(),
        template_id: Joi.string().required(),
        type: Joi.string().required(),
        name:Joi.string().required(),
        status:Joi.number().allow(0,1).required(),
        keywords:Joi.array().required()
    })
};


exports.updateTemplateStatus = {
    body: Joi.object().keys({
        template_id: Joi.string().required(),
        status:Joi.number().allow(0,1).required()
    })
};


