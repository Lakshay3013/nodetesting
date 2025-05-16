const Joi = require('joi');

const addProjectType = {
    body: Joi.object().keys({
        name: Joi.string().required().label('Name'),
        short_name: Joi.string().required().label('Short Name'),
        is_active: Joi.boolean().optional().label('Is Active'),
    }),
};

const getProjectType = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('page'),
    }),
};

const updateProjectType = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('ID'),
        name: Joi.string().required().label('Name'),
        short_name: Joi.string().required().label('Short Name'),
        is_active: Joi.boolean().optional().label('Is Active'),
    }),
};

const deleteProjectType = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('ID'),
    }),
};

module.exports = {
    addProjectType,
    getProjectType,
    updateProjectType,
    deleteProjectType,
};