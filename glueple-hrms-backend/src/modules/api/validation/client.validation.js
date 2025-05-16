const Joi = require('joi');

const addClient = {
    body: Joi.object().keys({
        code:Joi.string().required().label("Code"),
        client_name:Joi.string().required().label("Client Name"),
        base_url:Joi.string().required().label("Base url"),
        port:Joi.number().required().label("Port"),
        attendance_correction_days:Joi.number().required().label("Attendance correction days"),
        is_attendance_correction_notification:Joi.boolean().required().label("is attendance correction notification"),
        attendance_correction_notification:Joi.string().optional().allow('').label("attendance correction notification"),
        auto_logout_days:Joi.number().required().label("auto logout day"),
        attendance_image_logs_days:Joi.number().required().label("attendance image logs day"),
        attendance_logs_days:Joi.number().required().label("attendance logs days"),
        is_active:Joi.boolean().required().label("Active")
    }),
};

const getClient = {
     query: Joi.object().keys({
            limit: Joi.number().optional().allow(0).label('Limit'),
            page: Joi.number().optional().allow(0).label('Page'),
        }),
}
const updateClient = {
    body: Joi.object().keys({
        code:Joi.string().required().label("Code"),
        client_name:Joi.string().required().label("Client Name"),
        base_url:Joi.string().required().label("Base url"),
        port:Joi.number().required().label("Port"),
        attendance_correction_days:Joi.number().required().label("Attendance correction days"),
        is_attendance_correction_notification:Joi.boolean().required().label("is attendance correction notification"),
        attendance_correction_notification:Joi.string().optional().allow('').label("attendance correction notification"),
        auto_logout_days:Joi.number().required().label("auto logout day"),
        attendance_image_logs_days:Joi.number().required().label("attendance image logs day"),
        attendance_logs_days:Joi.number().required().label("attendance logs days"),
        is_active:Joi.boolean().required().label("Active"),
        _id:Joi.string().required().label("id")
    }),
}

const deleteClient = {
    body: Joi.object().keys({
            _id: Joi.string().required().label('ID'),
        }),
}


module.exports ={
    addClient,
    getClient,
    updateClient,
    deleteClient,

}