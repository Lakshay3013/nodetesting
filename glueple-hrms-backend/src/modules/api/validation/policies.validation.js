const Joi = require('joi');

const createPolicyCategory = {
    body: Joi.object().keys({
      name: Joi.string().required().label("Name"),
      is_active: Joi.boolean().optional().allow("").label("IS Active"),
      sort_order: Joi.number().optional().allow(0).label("Sort Order"),
    }),
};

const getPolicyCategory = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
  }),
};

const updatePolicyCategory = {
    body: Joi.object().keys({
        _id: Joi.string().required().label("ID"),
        name: Joi.string().required().label("Name"),
        is_active: Joi.boolean().optional().allow("").label("Is Active"),
        sort_order: Joi.number().optional().allow(0).label("Sort Order"),
    }),
};

const createPolicy = {
    body: Joi.object().keys({
        category_id: Joi.string().required().label("Policy Category"),
        title: Joi.string().required().label("Title"),
        description: Joi.string().required().label("Description"),
        content: Joi.string().optional().allow("").label("Content"),
        is_active: Joi.boolean().optional().allow("").label("IS Active"),
        sort_order: Joi.number().optional().allow(0).label("Sort Order"),
    }),
};

const getPolicy = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
  }),
};

const getPolicyInCategory = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
  }),
}

const getPolicyByCategoryId = {
    query: Joi.object().keys({
        category_id: Joi.string().required().label("Category ID"),
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
  }),
};

const updatePolicy = {
    body: Joi.object().keys({
        _id: Joi.string().required().label("ID"),
        category_id: Joi.string().required().label("Policy Category"),
        title: Joi.string().required().label("Title"),
        description: Joi.string().required().label("Description"),
        content: Joi.string().optional().allow("").label("Content"),
        is_active: Joi.boolean().optional().allow("").label("IS Active"),
        sort_order: Joi.number().optional().allow(0).label("Sort Order"),
    }),
};

const deletePolicyCategory = {
    body: Joi.object().keys({
        _id: Joi.string().required().label("ID"),
    }),
};

const deletePolicy = {
    body: Joi.object().keys({
        _id: Joi.string().required().label("ID"),
    }),
};

const acceptPolicyByUser = {
    body: Joi.object().keys({
        employee_id: Joi.string().required().label("Employee ID"),
        policyAccepted: Joi.boolean().required().label("Policy Accepted"),
        userSign: Joi.string().required().label("Employee Signature"),
    }),
};

module.exports = {
    createPolicyCategory,
    getPolicyCategory,
    updatePolicyCategory,
    createPolicy,
    getPolicy,
    getPolicyInCategory,
    getPolicyByCategoryId,
    updatePolicy,
    deletePolicyCategory,
    deletePolicy,
    acceptPolicyByUser,
};