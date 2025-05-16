const Joi = require('joi');

exports.createClient = {
    body: Joi.object().keys({
        name: Joi.string().required().label("Name"),
        employee_strength: Joi.string().optional().allow("").label("Employee Strength"),
        email:Joi.string().required().label("Email"),
        phone:Joi.number().required().label("Phone"),
        industry_type:Joi.string().required().label("Industry Type"),
        country:Joi.string().required().label("Country"),
        state:Joi.string().optional().allow("").label("State"),
        city:Joi.string().optional().allow("").label("City"),
        address:Joi.string().optional().allow("").label("Address"),
        time_zone:Joi.string().required().label("Time Zone"),
        is_active:Joi.boolean().required().label("Status"),
        org_code:Joi.string().required().label("Org Code"),
        emp_code:Joi.string().optional().allow("").label("Emp Code"),
        emp_code_start:Joi.number().optional().allow("").label("Emp code Start"),
        emp_code_format:Joi.string().optional().allow("").label("Emp code format"),
        emp_code_preview:Joi.string().optional().allow("").label("Emp Code preview"),
        logo:Joi.string().required().label("Logo"),
        favicon:Joi.string().optional().allow("").label("Fav icon"),
        water_mark:Joi.string().optional().allow("").label("water mark"),
        primary_color:Joi.string().optional().allow("").label("Primary Color"),
        contact_person_name:Joi.string().required().label("Contact Person name"),
        contact_person_email:Joi.string().required().label("Contact Person Email"),
        contact_person_mobile:Joi.number().required().label("Contact Person Phone"),
        db_name:Joi.string().optional().allow("").label("DB Name"),
        db_host_name:Joi.string().optional().allow("").label("DB host Name"),
        db_user_name:Joi.string().optional().allow("").label("DB User Name"),
        db_password:Joi.string().optional().allow("").label("DB Password"),


    }),
};