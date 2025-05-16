const Joi = require('joi');

const addKudosCategory = {
    body: Joi.object().keys({
        name: Joi.string().required().label('Name'),
        points: Joi.number().required().label('Points'),
        type: Joi.string().required().label('Type'),
        description: Joi.string().required().label('Description'),
        is_active: Joi.boolean().optional().allow(0).label('Is Active'),
    }),
};

const getKudosCategory = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
    }),
};


const createKudosRequest = {
    body: Joi.object().keys({
        kudos_type: Joi.string().required().label('Kudos Type'),
        kudos_category: Joi.string().required().label('Kudos Category'),
        category_value: Joi.number().required().label('Kudos Points '),
        users: Joi.array().required().label('users'),
        description: Joi.string().optional().label('Description'),
    }),
};


const getKudosRequest = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
        type: Joi.string().optional().label('type'),
        start_date: Joi.string().optional().label("start date"),
        end_date: Joi.string().optional().label("end date"),
    }),
};

const getPointStatement = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
       
    }),
};
module.exports = {
    addKudosCategory,
    getKudosCategory,
    createKudosRequest,
    getKudosRequest,
    getPointStatement
};