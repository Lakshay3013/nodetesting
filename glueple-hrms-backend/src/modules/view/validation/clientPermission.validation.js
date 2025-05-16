const Joi = require('joi');

exports.createClientPermission = {
    body: Joi.object().keys({
      title:Joi.string().required().label("title"),
      permission_type:Joi.string().required().label("Permission type"),
      parent:Joi.string().optional().allow("").label("parent"),
      is_active:Joi.boolean().required().label("Status"),
      key:Joi.string().required().label("Kays")
    }),
};

exports.addAccessControl = {
    body:Joi.object().keys({
        collection_id:Joi.string().required().label("Client id"),
        permission_ids:Joi.array().required().label("permission_ids")
    })
}