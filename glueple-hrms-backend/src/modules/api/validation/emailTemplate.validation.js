const Joi = require('joi');

const createTemplate = {
    body: Joi.object().keys({
        template_name: Joi.string().required().label("Email Template Name"),
        body: Joi.string().required().label("Body"),
        email_title:Joi.string().required().label('Email Title'),
        email_type:Joi.string().required().label('Email Type'),
        field:Joi.array().optional().allow(''),
        remark:Joi.string().optional().allow(''),
        is_active: Joi.boolean().required().label("Active"),
    }),
};
const createEmailType = {
    body:Joi.object().keys({
        name:Joi.string().required().label("Email Type"),
        is_active:Joi.boolean().required().label('Active')
    })
}
const getEmailTeamplate = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
    }),
}
const getEmailType = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
    }),
}

const UpdateEmailTemplate = {
    body:Joi.object().keys({
        _id: Joi.string().required().label('ID'),
        template_name: Joi.string().required().label("Email Template Name"),
        body: Joi.string().required().label("Body"),
        email_title:Joi.string().required().label('Email Title'),
        email_type:Joi.string().required().label('Email Type'),
        is_active: Joi.boolean().required().label("Active"),
    })
}
const deletemailTemplate = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('ID'),
    }),
};

const removeTemplateImage = {
    body: Joi.object().keys({
        url: Joi.string().required().label('URL'),
    }),
}

const emailTemplateAction ={
    body:Joi.object().keys({
        action_name:Joi.string().required().label("Action Name"),
        action_type:Joi.string().required().label('Action type'),
        template_id:Joi.string().required().label('Template id'),
        sender:Joi.array().optional().allow(''),
        is_active:Joi.boolean().required().label('Active')
        
    })
}

const UpdateemailTemplateAction ={
    body:Joi.object().keys({
        _id:Joi.string().required().label('ID'),
        action_name:Joi.string().required().label("Action Name"),
        action_type:Joi.string().required().label('Action type'),
        template_id:Joi.string().required().label('Template id'),
        sender:Joi.array().optional().allow(''),
        is_active:Joi.boolean().required().label('Active')

        
    })
}

const deleteActionTemplate= {
    body: Joi.object().keys({
        _id: Joi.string().required().label('ID'),
    }),
};

const getActionTemplate = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
    }),
}

const getEmailActionType = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
    }),
}
const AddAction ={
    body:Joi.object().keys({
        action_name:Joi.string().required().label("Action Name"),
        
    })
}

module.exports = {
    createTemplate,
    createEmailType,
    getEmailType,
    getEmailTeamplate,
    UpdateEmailTemplate,
    deletemailTemplate,
    removeTemplateImage,
    emailTemplateAction,
    UpdateemailTemplateAction,
    deleteActionTemplate,
    getActionTemplate,
    getEmailActionType,
    AddAction
};