const Joi = require('joi');

const getProfile = {
    query: Joi.object().keys({
        _id: Joi.string().optional().allow("").label('ID'),
    }),
};

const getEmployeeByIds = {
    body: Joi.object().keys({
        ids: Joi.array().required().label('IDS'),
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
    }),
};

const createEmployee = {
    body: Joi.object().keys({
        branch_id: Joi.string().optional().allow('').label("Branch Name"),
        emp_id: Joi.string().required().label('Employee ID'),
        name: Joi.string().required().label('Name'),
        mobile: Joi.string().optional().allow('').label('Mobile'),
        email: Joi.string().required().label('Email'),
        joining_date: Joi.string().required().label('Joining Date'),
        // location: Joi.string().required().label('Location'),
        department_id: Joi.string().required().label("Department"),
        designation_id: Joi.string().required().label("Designation"),
        reported_to: Joi.string().optional().allow('').label("Reported To"),
        working_from: Joi.string().optional().allow('').label("Working From"),
        sub_department_id: Joi.string().optional().allow('').label("Sub Department Id"),
        project:Joi.array().required().label("Project"),
        skill:Joi.array().required().label("Skill")
    })
};

const getAllEmployee = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
    }),
};

const getUserOnRole = {
    query: Joi.object().keys({
        role_id: Joi.string().required().label('Role ID'),
    }),
};

module.exports = {
    getProfile,
    getEmployeeByIds,
    createEmployee,
    getAllEmployee,
    getUserOnRole,
};