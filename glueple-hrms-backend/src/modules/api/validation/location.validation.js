const Joi = require('joi');

const createLocation = {
    body: Joi.object().keys({
        name: Joi.string().required().label('Name'),
        timezone: Joi.string().optional().allow("").label("Timezone"),
        address: Joi.string().optional().allow("").label('Short Name'),
        country: Joi.string().optional().allow("").label("Country"),
        city: Joi.string().optional().allow("").label("City"),
        state: Joi.string().optional().allow("").label("State"),
        postal_code: Joi.string().optional().allow("").label("Postal Code"),
        office_start_time: Joi.string().optional().allow("").label("Start Time"),
        office_end_time: Joi.string().optional().allow("").label("End Time"),
        employee_leave_year_start: Joi.string().optional().allow("").label("Leave Year Start"),
        office_working_hours: Joi.string().optional().allow("").label("Office working Hours"),
        is_metro: Joi.boolean().optional().allow(0).label('Is Metro'),
        is_active: Joi.boolean().optional().allow(0).label('Is Active'),
    }),
};

const updateLocation = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('ID'),
        name: Joi.string().required().label('Name'),
        timezone: Joi.string().optional().allow("").label("Timezone"),
        address: Joi.string().optional().allow("").label('Short Name'),
        country: Joi.string().optional().allow("").label("Country"),
        city: Joi.string().optional().allow("").label("City"),
        state: Joi.string().optional().allow("").label("State"),
        postal_code: Joi.string().optional().allow("").label("Postal Code"),
        office_start_time: Joi.string().optional().allow("").label("Start Time"),
        office_end_time: Joi.string().optional().allow("").label("End Time"),
        employee_leave_year_start: Joi.string().optional().allow("").label("Leave Year Start"),
        office_working_hours: Joi.string().optional().allow("").label("Office working Hours"),
        is_metro: Joi.boolean().optional().allow(0).label('Is Metro'),
        is_active: Joi.boolean().optional().allow(0).label('Is Active'),
    }),
};

const deleteLocation = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('ID'),
    }),
};

const getAllLocations = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
    }),
};

const getLocation = {
    query: Joi.object().keys({
        _id: Joi.string().optional().allow("").label('ID'),
        name: Joi.string().optional().allow("").label('Name'),
        address: Joi.string().optional().allow("").label('Short Name'),
        country: Joi.string().optional().allow("").label("Country"),
        city: Joi.string().optional().allow("").label("City"),
        state: Joi.string().optional().allow("").label("State"),
        postal_code: Joi.string().optional().allow("").label("Postal Code"),
        timezone: Joi.string().optional().allow("").label("Timezone"),
        office_start_time: Joi.string().optional().allow("").label("Start Time"),
        office_end_time: Joi.string().optional().allow("").label("End Time"),
        employee_leave_year_start: Joi.string().optional().allow("").label("Leave Year Start"),
        office_working_hours: Joi.string().optional().allow("").label("Office working Hours"),
    }),
};

const getStatesListFromCountry = {
    body: Joi.object().keys({
        country_id: Joi.array().required().label('Country ID'),
    }),
};

const getCityListFromState = {
    body: Joi.object().keys({
        state_id: Joi.array().optional().label('State ID'),
    }),
};

module.exports = {
    createLocation,
    updateLocation,
    deleteLocation,
    getAllLocations,
    getLocation,
    getStatesListFromCountry,
    getCityListFromState,
};