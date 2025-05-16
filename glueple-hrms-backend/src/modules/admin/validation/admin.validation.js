const Joi = require('joi');

exports.login = {
    body: Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required()
    }),
};

exports.createAdmin = {
    body: Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required(),
        first_name:Joi.string().required(),
        last_name:Joi.string().required(),
        username:Joi.string().required()
    }),
};

exports.getProfile = {
    query: Joi.object().keys({
        id:Joi.string().required()
    }),
};



