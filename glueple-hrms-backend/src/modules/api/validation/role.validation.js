const Joi = require('joi');

const createRoles = {
    body: Joi.object().keys({
        name:Joi.string().required().label('Name'),
        short_name:Joi.string().required().label("Short Name"),
        is_active:Joi.boolean().required().label("Active")
    }),
}

const getRoleList = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
    }),
}

const updateRole = {
    body: Joi.object().keys({
        name:Joi.string().required().label('Name'),
        short_name:Joi.string().required().label("Short Name"),
        is_active:Joi.boolean().required().label("Active"),
        _id:Joi.string().required().label("Id")
    }),

}

const deleteRole = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('ID'),
    }),

}

module.exports = {
    createRoles,
    getRoleList,
    updateRole,
    deleteRole,

}