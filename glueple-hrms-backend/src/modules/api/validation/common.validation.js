const Joi = require('joi');

const getConstantByCategorySubcategory = {
    query: Joi.object().keys({
        category: Joi.string().required().label('Category'),
        subcategory: Joi.string().optional().allow('').label('Sub-Category'),
    }),
};

module.exports = {
    getConstantByCategorySubcategory,
};