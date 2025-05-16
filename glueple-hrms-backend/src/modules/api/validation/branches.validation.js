const Joi = require('joi');

const getBranchListFromCity = {
    body: Joi.object().keys({
        city_id: Joi.array().optional().allow("").label('City ID'),
    }),
};

module.exports = {
    getBranchListFromCity,
};