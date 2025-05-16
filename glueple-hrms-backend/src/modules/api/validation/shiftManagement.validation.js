const { query } = require('express');
const Joi = require('joi');

const createShift = {
    body: Joi.object().keys({
        shift_name: Joi.string().required().label('Shift Name'),
        shift_code: Joi.string().required().label('Short Name'),
        color: Joi.string().optional().allow('').label('Color Name'),
        is_active:Joi.boolean().required().label('Status'),
        shift_start_time:Joi.string().required().label('Shfit Start Name'),
        shift_end_time:Joi.string().required().label('shift end Time'),
        break_start_time:Joi.string().optional().allow(''),
        break_end_time:Joi.string().optional().allow(''),
        early_arrival_tolerance:Joi.string().optional().allow(''),
        late_departure_tolerance:Joi.string().optional().allow(''),
        grace_start_time:Joi.string().optional().allow(''),
        grace_end_time:Joi.string().optional().allow(''),
        half_day_policy_time:Joi.string().required().label('Half day policy time'),
        full_day_policy_time:Joi.string().required().label('Full day policy time'),
        shift_type:Joi.string().required().label('shift type'),
        shift_configuration:Joi.string().optional().allow('').label('shift configuration'),
        is_ot_time:Joi.boolean().optional().allow(''),
        minimum_ot_hours:Joi.string().optional().allow(' '),
        maximum_ot_hours:Joi.string().optional().allow(' '),
        calendatr_id:Joi.string().optional().allow(' ')
  }),
};

const UpdateShift = {
    body: Joi.object().keys({
        _id:Joi.string().required().label('Id'),
        shift_name: Joi.string().required().label('Shift Name'),
        shift_code: Joi.string().required().label('Short Name'),
        color: Joi.string().optional().allow('').label('Color Name'),
        is_active:Joi.boolean().required().label('Status'),
        shift_start_time:Joi.string().required().label('Shfit Start Name'),
        shift_end_time:Joi.string().required().label('shift end Time'),
        break_start_time:Joi.string().optional().allow(''),
        break_end_time:Joi.string().optional().allow(''),
        early_arrival_tolerance:Joi.string().optional().allow(''),
        late_departure_tolerance:Joi.string().optional().allow(''),
        grace_start_time:Joi.string().optional().allow(''),
        grace_end_time:Joi.string().optional().allow(''),
        half_day_policy_time:Joi.string().required().label('Half day policy time'),
        full_day_policy_time:Joi.string().required().label('Full day policy time'),
        shift_type:Joi.string().required().label('shift type'),
        shift_configuration:Joi.string().optional().allow('').label('shift configuration'),
        is_ot_time:Joi.boolean().optional().allow(''),
        minimum_ot_hours:Joi.string().optional().allow(''),
        maximum_ot_hours:Joi.string().optional().allow(''),
        calendatr_id:Joi.string().optional().allow('')
  }),
};

const getShift = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('page'),
    }),
};

const getShiftById = {
    query:Joi.object().keys({
        id:Joi.string().required().label('Id')
    })
}

const deleteShift = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('ID'),
    }),
};

const createShiftConfiguration = {
    body:Joi.object().keys({
        shift_id:Joi.string().required().label('Shift Id'),
        is_OT_time:Joi.boolean().optional().allow(''),
        minimum_ot_hours:Joi.string().optional().allow(''),
        maximum_ot_hours:Joi.string().optional().allow(''),
        calendar_id:Joi.string().optional().allow(''),
        is_default:Joi.string().optional().allow(''),
        over_time:Joi.string().optional().allow(""),
        working_days:Joi.string().optional().allow(""),
        alternative_saturday_off:Joi.string().optional().allow(""),
        week_off:Joi.string().optional().optional().allow("")
    })
}

const getShiftConfigurationByShiftId = {
    query: Joi.object().keys({
        _id: Joi.string().required().label('id')
    }),
}

const shiftAssign = {
    body:Joi.object().keys({
        shift_id:Joi.string().required().label('Shift Id'),
        employee_id:Joi.array().required().label('employee'),
        start_date:Joi.string().optional().allow(''),
        end_date:Joi.string().optional().allow(''),
        assignment_type:Joi.string().optional().allow('')
    })
}

const addWeekOff = {
    body:Joi.object().keys({
        weekoff_details:Joi.array().required().label("employee Id"),
    })
}


const AddCalendar = {
    body:Joi.object().keys({
        title:Joi.string().required().label('Calendar Title'),
        working_days:Joi.string().optional().allow(''),
        alternative_saturday_off:Joi.array().optional().allow(''),
        week_off:Joi.array().optional().allow('')
    })
}

const updateCalendar = {
    body:Joi.object().keys({
        _id:Joi.string().required().label('Id'),
        title:Joi.string().required().label('Calendar Title'),
        working_days:Joi.string().optional().allow(''),
        alternative_saturday_off:Joi.array().optional().allow(''),
        week_off:Joi.array().optional().allow(''),
        
    })
}

const getCalendar = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('page'),
    }),
}

const deleteCalendar = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('ID'),
    }),
}

const getEmployeeByShiftId = {
    query: Joi.object().keys({
        shift_id: Joi.string().required().label('id')
    }),
}

const getAllShiftDetails = {
    query:Joi.object().keys({
        shift_id:Joi.string().optional().allow(''),
        start_date:Joi.string().required().label('Start Date'),
        end_date:Joi.string().required().label('end date')
    })
}

const deleteEmployeeInShift = {
    body: Joi.object().keys({
        employee_id: Joi.string().required().label('ID'),
    }),
}

const isActiveOrInActive = {
    query:Joi.object().keys({
        id:Joi.string().required().label('Id'),
        is_active:Joi.boolean().required().label('Active Status')
    })
}

const getEmployeeShiftDetailsById = {
    query:Joi.object().keys({
        employee_id:Joi.string().required().label('Employee id'),
        start_date:Joi.string().required().label('start date'),
        end_date:Joi.string().required().label('end date')
    })
}



module.exports = {
    createShift,
    UpdateShift,
    getShift,
    deleteShift,
    createShiftConfiguration,
    getShiftConfigurationByShiftId,
    shiftAssign,
    AddCalendar,
    updateCalendar,
    getCalendar,
    deleteCalendar,
    getShiftById,
    addWeekOff,
    getEmployeeByShiftId,
    getAllShiftDetails,
    deleteEmployeeInShift,
    isActiveOrInActive,
    getEmployeeShiftDetailsById
};