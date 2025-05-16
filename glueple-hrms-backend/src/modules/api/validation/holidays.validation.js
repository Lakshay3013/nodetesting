const Joi = require('joi');

const createHolidays = {
    body: Joi.object().keys({
        name: Joi.string().required().label("Holiday Name"),
        from_date: Joi.string().required().label('From Date'),
        to_date: Joi.string().required().label('To Date'),
        country: Joi.array().required().label('Country'),
        state: Joi.array().required().label('State'),
        city: Joi.array().required().label('City'),
        branch: Joi.array().required().label('Branch Name'),
        gender: Joi.array().optional().label("Gender"),
        description:Joi.string().optional().allow("").label("Description"),
        restricted:Joi.boolean().optional().label("Restricted"),
        notify_before_days:Joi.number().optional().label("Notify Before Days"),
        is_notify_to_employee:Joi.boolean().optional().label("Is notify to employee"),
        is_reprocess_leave:Joi.boolean().optional().label("Is reprocess leave"),
        holiday_data: Joi.array().required().label('Holiday Data'),
    })
};

const updateHoliday = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('ID'),
        name: Joi.string().required().label("Holiday Name"),
        from_date: Joi.string().required().label('From Date'),
        to_date: Joi.string().required().label('To Date'),
        country: Joi.array().required().label('Country'),
        state: Joi.array().required().label('State'),
        city: Joi.array().required().label('City'),
        branch: Joi.array().required().label('Branch Name'),
        gender: Joi.array().optional().label("Gender"),
        description:Joi.string().optional().allow("").label("Description"),
        restricted:Joi.boolean().optional().label("Restricted"),
        notify_before_days:Joi.number().optional().label("Notify Before Days"),
        is_notify_to_employee:Joi.boolean().optional().label("Is notify to employee"),
        is_reprocess_leave:Joi.boolean().optional().label("Is reprocess leave"),
        holiday_data: Joi.array().required().label('Holiday Data'),
    }),
};

const deleteHoliday = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('ID'),
    }),
};


module.exports = {
    createHolidays,
    updateHoliday,
    deleteHoliday,
};