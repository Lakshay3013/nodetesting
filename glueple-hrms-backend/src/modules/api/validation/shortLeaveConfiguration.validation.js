const Joi = require('joi');

const createConfiguration = {
    body: Joi.object().keys({
        name: Joi.string().required().label('Name'),
        short_name: Joi.string().optional().allow('').label('Short Name'),
        used_as: Joi.string().optional().allow('').label('Used As'),
        applicable_within: Joi.string().optional().allow('').label('Applicable Within'),
        deducted_from: Joi.string().optional().allow('').label('Deducted From'),
        deduction_value: Joi.number().optional().allow(0).label('Deduction Value'),
        total_allowed_time: Joi.string().optional().allow('').label('Total Allowed Time'),
        minimum_time_per_request: Joi.string().optional().allow('').label('Minimum Time per request'),
        maximum_time_per_request: Joi.string().optional().allow('').label('Maximum Time per request'),
        total_allowed_request: Joi.number().optional().allow(0).label('Total Allowed Request'),
        applicable_for: Joi.string().optional().allow('').label('Applicable for'),
        applicable_department: Joi.array().optional().label('Department IDS'),
        applicable_designation: Joi.array().optional().label('Designation IDS'),
        applicable_location: Joi.array().optional().label('Location IDS'),
        applicable_role: Joi.array().optional().label('Role IDS'),
        applicable_employee: Joi.array().optional().label('Employee IDS'),
        is_approval_required: Joi.boolean().optional().label('Is Approval Required'),
        is_active: Joi.boolean().optional().label('Is Active'),
    }),
};

const updateConfiguration = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('ID'),
        name: Joi.string().required().label('Name'),
        short_name: Joi.string().optional().allow('').label('Short Name'),
        used_as: Joi.string().optional().allow('').label('Used As'),
        applicable_within: Joi.string().optional().allow('').label('Applicable Within'),
        deducted_from: Joi.string().optional().allow('').label('Deducted From'),
        deduction_value: Joi.number().optional().allow(0).label('Deduction Value'),
        total_allowed_time: Joi.string().optional().allow('').label('Total Allowed Time'),
        minimum_time_per_request: Joi.string().optional().allow('').label('Minimum Time per request'),
        maximum_time_per_request: Joi.string().optional().allow('').label('Maximum Time per request'),
        total_allowed_request: Joi.number().optional().allow(0).label('Total Allowed Request'),
        applicable_for: Joi.string().optional().allow('').label('Applicable for'),
        applicable_department: Joi.array().optional().label('Department IDS'),
        applicable_designation: Joi.array().optional().label('Designation IDS'),
        applicable_location: Joi.array().optional().label('Location IDS'),
        applicable_role: Joi.array().optional().label('Role IDS'),
        applicable_employee: Joi.array().optional().label('Employee IDS'),
        is_approval_required: Joi.boolean().optional().label('Is Approval Required'),
        is_active: Joi.boolean().optional().label('Is Active'),
    }),
};

const deleteConfiguration = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('ID'),
    }),
};

const getAllConfigurations = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('page'),
    }),
};

module.exports = {
    deleteConfiguration,
    createConfiguration,
    updateConfiguration,
    getAllConfigurations,
};