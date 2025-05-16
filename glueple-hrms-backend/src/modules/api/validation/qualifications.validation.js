const Joi = require('joi');

const addQualification = {
    body: Joi.object().keys({
        name: Joi.string().required().label('Name'),
        short_name: Joi.string().required().label('Short Name'),
        parent_id: Joi.string().optional().allow('').label('Parent Id'),
    }),
};

const getQualification = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
    }),
};

const getQualificationByParentId = {
    query: Joi.object().keys({
        parent_id: Joi.string().optional().allow('').label('Parent Id'),
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
    }),
};

const updateQualification = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('ID'),
        name: Joi.string().required().label('Name'),
        short_name: Joi.string().required().label('Short Name'),
        parent_id: Joi.string().optional().allow('').label('Parent Id'),
    }),
};

const deleteQualification = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('ID'),
    }),
};

module.exports = {
    addQualification,
    getQualification,
    getQualificationByParentId,
    updateQualification,
    deleteQualification,
};