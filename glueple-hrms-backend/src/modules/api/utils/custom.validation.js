const Joi = require('joi');
const httpStatus = require('http-status');
const pick = require('../../../helpers/pick');
const ApiError = require('../../../helpers/ApiError');

const objectId = (value, helpers) => {
    if (!value.match(/^[0-9a-fA-F]{24}$/)) {
      return helpers.message('"{{#label}}" must be a valid mongo id');
    }
    return value;
  };
  
  const password = (value, helpers) => {
    if (value.length < 8) {
      return helpers.message('password must be at least 8 characters');
    }
    if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
      return helpers.message('password must contain at least 1 letter and 1 number');
    }
    return value;
  };

  const validateInController = (schema, req) => {
    const validSchema = pick(schema, ['params', 'query', 'body']);
    const object = pick(req, Object.keys(validSchema));
    const { value, error } = Joi.compile(validSchema)
      .prefs({ errors: { label: 'key' }, abortEarly: true })
      .validate(object);
    if (error) {
      const errorMessage = error.details.map((details) => details.message.replace(/['"]/g, "")).join(', ');
      throw new ApiError(httpStatus.BAD_REQUEST, errorMessage);
    }
    return true;
  };


  
  module.exports = {
    objectId,
    password,
    validateInController,
  };
  