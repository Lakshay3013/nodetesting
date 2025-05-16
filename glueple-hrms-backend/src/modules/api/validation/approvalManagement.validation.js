const Joi = require('joi');

const createHierarchy = {
    body: Joi.object().keys({
        department_id: Joi.string().required().label('Department'),
        approval_level: Joi.string().required().label('Approval Level'),
        auto_approve_assign_after: Joi.number().required().label('Is Active'),
        auto_approve_assign_to: Joi.string().required().label('Auto Assigned To'),
        assigned_to: Joi.array().required().label('Assigned To'),
        type: Joi.string().required().label("Type"),
        designation_id: Joi.string().optional().label('Designation'),
        position_id: Joi.string().optional().label('Position'),
        sub_department_id:Joi.string().optional().label("Sub Department")
  }),
};

const getHierarchy = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
  }),
};

const deleteHierarchy = {
    body:Joi.object().keys({
        _id:Joi.string().required().label("Id")
    }),
}

module.exports = {
    createHierarchy,
    getHierarchy,
    deleteHierarchy
};