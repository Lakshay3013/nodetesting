const Joi = require('joi');

const createDepartment = {
    body: Joi.object().keys({
        name: Joi.string().required().label('Name'),
        short_name: Joi.string().required().label('Short Name'),
        is_active: Joi.boolean().optional().allow(0).label('Is Active'),
    }),
};

const getDepartment = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
    }),
};

const updateDepartment = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('ID'),
        name: Joi.string().required().label('Name'),
        short_name: Joi.string().required().label('Short Name'),
        is_active: Joi.boolean().optional().allow(0).label('Is Active'),
    }),
};

const deleteDepartment = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('ID'),
    }),
};

const assignDepartmentHod = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('ID'),
        head_id: Joi.array().required().label('Head ID'),
    }),
};

const createSubDepartment = {
    body: Joi.object().keys({ 
        name:Joi.string().required().label("Name"),
        short_name:Joi.string().required().label("Short Name"),
        department_id:Joi.string().required().label("Department id"),
        function_head_id:Joi.string().required().label("Function Head Id"),
        is_active:Joi.boolean().required().label("Active")
    })

}

const getSubDepartment = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
    }),
}

const updateSubDepartment = {
    body: Joi.object().keys({ 
        name:Joi.string().required().label("Name"),
        short_name:Joi.string().required().label("Short Name"),
        department_id:Joi.string().required().label("Department id"),
        function_head_id:Joi.string().required().label("Function Head Id"),
        is_active:Joi.boolean().required().label("Active"),
        _id:Joi.string().required().label("Id")
    })

}

const createProject = {
    body: Joi.object().keys({ 
        name:Joi.string().required().label("Name"),
        short_name:Joi.string().required().label("Short Name"),
        department_id:Joi.string().required().label("Department id"),
        function_head_id:Joi.string().required().label("Function Head Id"),
        sub_department_id:Joi.string().required().label("sub department  Id"),
        project_manager_id:Joi.string().required().label("project manager Id"),
        is_active:Joi.boolean().required().label("Active"),
    })

}

const getProject = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
    }),
}

const updateProject = {
    body: Joi.object().keys({ 
        name:Joi.string().required().label("Name"),
        short_name:Joi.string().required().label("Short Name"),
        department_id:Joi.string().required().label("Department id"),
        function_head_id:Joi.string().required().label("Function Head Id"),
        sub_department_id:Joi.string().required().label("sub department  Id"),
        project_manager_id:Joi.string().required().label("project manager Id"),
        is_active:Joi.boolean().required().label("Active"),
        _id:Joi.string().required().label("Id")
    })

}

const createSkill = {
    body: Joi.object().keys({ 
        name:Joi.string().required().label("Name"),
        short_name:Joi.string().required().label("Short Name"),
        is_active:Joi.boolean().required().label("Active"),
        
    })

}

const getSkill = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
    }),
}

const updateSkill = {
    body: Joi.object().keys({ 
        name:Joi.string().required().label("Name"),
        short_name:Joi.string().required().label("Short Name"),
        _id:Joi.string().required().label("Id"),
        is_active:Joi.boolean().required().label("Active"),
    })

}

const assignProject = {
    body: Joi.object().keys({
        employee_id:Joi.string().required().label("employee id"),
        project_id:Joi.string().required().label("Project Id")
    }),
}

const getAssignProject = {
    query: Joi.object().keys({
       employee_id:Joi.string().required().label("Employee Id")
    }),
}

const assignSkill = {
    body: Joi.object().keys({
        employee_id:Joi.string().required().label("employee id"),
        skill_id:Joi.string().required().label("Project Id")
    }),
}

const getAssignSkill = {
    query: Joi.object().keys({
        employee_id:Joi.string().required().label("Employee Id")
    }),
}

const getSubDepartmentByDepartment = {
    query: Joi.object().keys({
        department_id:Joi.string().required().label("Employee Id")
    }),
}

module.exports = {
    createDepartment,
    getDepartment,
    updateDepartment,
    deleteDepartment,
    assignDepartmentHod,
    createSubDepartment,
    getSubDepartment,
    updateSubDepartment,
    createProject,
    getProject,
    updateProject,
    createSkill,
    getSkill,
    updateSkill,
    assignProject,
    getAssignProject,
    assignSkill,
    getAssignSkill,
    getSubDepartmentByDepartment
};