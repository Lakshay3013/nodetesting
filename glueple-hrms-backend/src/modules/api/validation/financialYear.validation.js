const Joi = require('joi');

const addFinancialYear = {
    body: Joi.object().keys({
        from: Joi.string().required().label('from'),
        to: Joi.string().required().label('To Date'),
        is_active: Joi.boolean().optional().allow(0).label('Is Active'),
    }),
};

const getAllFinancialYear = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
    }),
};

const updateFinancialYear = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('ID'),
        from: Joi.string().required().label('from'),
        to: Joi.string().required().label('To Date'),
        is_active: Joi.boolean().optional().allow(0).label('Is Active'),
    }),
};
module.exports = {
    addFinancialYear,
    getAllFinancialYear,
    updateFinancialYear,

};