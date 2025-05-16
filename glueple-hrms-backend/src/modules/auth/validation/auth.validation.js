const Joi = require('joi');
const { password } = require('./custom.validation');

exports.login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
    device_id:Joi.string().required()
  }),
};



