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
        confirmPassword:Joi.string().required(),
        name:Joi.string().required(),
    }),
};

exports.getProfile = {
    query: Joi.object().keys({
        id:Joi.string().required()
    }),
};



