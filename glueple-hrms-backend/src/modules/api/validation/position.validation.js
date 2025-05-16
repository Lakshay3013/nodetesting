const Joi = require('joi');

const createPosition = {
    body: Joi.object().keys({
        name: Joi.string().required().label('Name'),
        department_id: Joi.string().required().label("Department"),
        designation_id: Joi.string().required().label("Designation"),
        short_name: Joi.string().required().label('Short Name'),
        is_active: Joi.boolean().optional().allow(0).label('Is Active'),
  }),
};

const getPosition = {
    query: Joi.object().keys({
        department_id: Joi.string().required().label("Department"),
        designation_id: Joi.string().required().label("Designation"),
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
  }),
};

const getAllPosition = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
  }),
};

const updatePosition = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('ID'),
        name: Joi.string().required().label('Name'),
        department_id: Joi.string().required().label("Department"),
        designation_id: Joi.string().required().label("Designation"),
        short_name: Joi.string().required().label('Short Name'),
        is_active: Joi.boolean().optional().allow(0).label('Is Active'),
  }),
};

const deletePosition = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('ID'),
    }),
};

module.exports = {
    createPosition,
    getPosition,
    getAllPosition,
    updatePosition,
    deletePosition,
};