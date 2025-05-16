const Joi = require('joi');

exports.getProfile = {
    query: Joi.object().keys({
        user_id: Joi.string().required(),
    }),
};



