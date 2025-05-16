const Joi = require('joi');

const createTravelAndClaimRuleType = {
    body: Joi.object().keys({
        travel_id: Joi.string().required().label('Travel Id'),
        label: Joi.string().required().label('Label'),
        input_type: Joi.string().optional().label('Input type'),
    }),
};

const getTravelAndClaimRuleType = {
    query: Joi.object().keys({
        travel_id: Joi.string().optional().allow("").label('Id'),
    }),
};

module.exports = {
    createTravelAndClaimRuleType,
    getTravelAndClaimRuleType,
};