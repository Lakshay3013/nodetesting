const Joi = require('joi');

const createDesignation = {
    body: Joi.object().keys({
        name: Joi.string().required().label('Name'),
        department_id: Joi.string().required().label("Department"),
        short_name: Joi.string().required().label('Short Name'),
        is_active: Joi.boolean().optional().allow(0).label('Is Active'),
        parent: Joi.string().optional().allow("").label('Parent'),
        order: Joi.number().optional().allow(0).label("Order"),
  }),
};

const getDesignation = {
    query: Joi.object().keys({
        department_id: Joi.string().optional().allow("").label("Department"),
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
  }),
};

const getAllDesignation = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
  }),
};

const updateDesignation = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('ID'),
        name: Joi.string().required().label('Name'),
        department_id: Joi.string().required().label("Department"),
        short_name: Joi.string().required().label('Short Name'),
        is_active: Joi.boolean().optional().allow(0).label('Is Active'),
        parent: Joi.string().optional().allow("").label('Parent'),
        order: Joi.number().optional().allow(0).label("Order"),
  }),
};

const deleteDesignation = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('ID'),
    }),
};

module.exports = {
    createDesignation,
    getDesignation,
    updateDesignation,
    deleteDesignation,
    getAllDesignation,
};