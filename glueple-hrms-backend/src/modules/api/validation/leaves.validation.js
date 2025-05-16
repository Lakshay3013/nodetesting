const { query } = require('express');
const Joi = require('joi');

const addLeaveType = {
    body: Joi.object().keys({
        name: Joi.string().required().label('Name'),
        short_name: Joi.string().required().label('Short Name'),
        max_leave_per_year: Joi.number().optional().allow(0).label('Max Leave Per Year'),
        is_carry_forwardable: Joi.boolean().optional().allow(0).label("Is Carry Forwardable"),
        carry_forward_limit: Joi.number().optional().allow('').label('Carry Formard Limit'),
        is_expirable: Joi.boolean().optional().allow(0).label("Is Expirable"),
        expire_on: Joi.string().optional().allow('').label("Expire On"),
        leave_unit: Joi.string().optional().allow('').label("Leave Unit"),
        is_encashment: Joi.boolean().optional().allow(0).label("Is Encashment"),
        max_days_encashable: Joi.number().optional().allow(0).label('Max Days Encashable'),
        encashable_formula: Joi.string().optional().allow("").label("Encashable Formula"),
        is_credit_on_probation: Joi.boolean().optional().allow(0).label("Is Credit On Probation"),
        can_view_on_probation: Joi.boolean().optional().allow(0).label("Can View On Probation"),
        is_deduction: Joi.boolean().optional().allow(0).label("Is Deduction"),
        is_allowed_on_notice: Joi.boolean().optional().allow(0).label("Can View On Probation"),
        leave_type: Joi.string().required().label("Leave Type"),
        balance_based_on: Joi.string().optional().allow("").label("Balance Based On"),
        validity_start_date: Joi.string().optional().allow("").label("Validity Start Date"),
        validity_end_date: Joi.string().optional().allow("").label("Validity End Date"),
        effective_after_number: Joi.number().optional().allow(0).label("Effective After Number"),
        effective_after_name: Joi.string().optional().allow("").label("Effective After Name"),
        effective_after_value: Joi.string().optional().allow("").label("Effective After Value"),
        minimum_days_for_request: Joi.number().optional().allow(0).label("Minimum Days For Request"),
        maximum_days_for_request: Joi.number().optional().allow(0).label("Maximum Days For Request"),
        minimum_interval_between_request: Joi.number().optional().allow(0).label("Minimum Interval Between Request"),
        applicable_gender: Joi.array().optional().allow('').label("Applicable Gender"),
        applicable_marital_status: Joi.array().optional().allow('').label("Applicable Marital Status"),
        applicable_employee: Joi.array().optional().allow('').label("Applicable Employee"),
        is_applicable_for_esi_employee: Joi.boolean().optional().allow(0).label("Is Applicable For ESI Employee"),
        minimum_service_days_to_apply: Joi.number().optional().allow(0).label("Minimum Service Days To Apply"),
        is_active: Joi.boolean().optional().allow(0).label("Is Active"),
    }),
};

const updateLeaveType = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('ID'),
        name: Joi.string().required().label('Name'),
        short_name: Joi.string().required().label('Short Name'),
        max_leave_per_year: Joi.number().optional().allow(0).label('Max Leave Per Year'),
        is_carry_forwardable: Joi.boolean().optional().allow(0).label("Is Carry Forwardable"),
        carry_forward_limit: Joi.number().optional().allow('').label('Carry Formard Limit'),
        is_expirable: Joi.boolean().optional().allow(0).label("Is Expirable"),
        expire_on: Joi.string().optional().allow('').label("Expire On"),
        leave_unit: Joi.string().optional().allow('').label("Leave Unit"),
        is_encashment: Joi.boolean().optional().allow(0).label("Is Encashment"),
        max_days_encashable: Joi.number().optional().allow(0).label('Max Days Encashable'),
        encashable_formula: Joi.string().optional().allow("").label("Encashable Formula"),
        is_credit_on_probation: Joi.boolean().optional().allow(0).label("Is Credit On Probation"),
        can_view_on_probation: Joi.boolean().optional().allow(0).label("Can View On Probation"),
        is_deduction: Joi.boolean().optional().allow(0).label("Is Deduction"),
        is_allowed_on_notice: Joi.boolean().optional().allow(0).label("Can View On Probation"),
        leave_type: Joi.string().required().label("Leave Type"),
        balance_based_on: Joi.string().optional().allow("").label("Balance Based On"),
        validity_start_date: Joi.string().optional().allow("").label("Validity Start Date"),
        validity_end_date: Joi.string().optional().allow("").label("Validity End Date"),
        effective_after_number: Joi.number().optional().allow(0).label("Effective After Number"),
        effective_after_name: Joi.string().optional().allow("").label("Effective After Name"),
        effective_after_value: Joi.string().optional().allow("").label("Effective After Value"),
        minimum_days_for_request: Joi.number().optional().allow(0).label("Minimum Days For Request"),
        maximum_days_for_request: Joi.number().optional().allow(0).label("Maximum Days For Request"),
        minimum_interval_between_request: Joi.number().optional().allow(0).label("Minimum Interval Between Request"),
        applicable_gender: Joi.array().optional().label("Applicable Gender"),
        applicable_marital_status: Joi.array().optional().label("Applicable Marital Status"),
        applicable_employee: Joi.array().optional().label("Applicable Employee"),
        is_applicable_for_esi_employee: Joi.boolean().optional().allow(0).label("Is Applicable For ESI Employee"),
        minimum_service_days_to_apply: Joi.number().optional().allow(0).label("Minimum Service Days To Apply"),
        is_active: Joi.boolean().optional().allow(0).label("Is Active"),
    }),
};

const deleteLeaveType = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('ID'),
    }),
};

const getLeaveSettingByLeaveType = {
    query: Joi.object().keys({
        leave_type_id: Joi.string().required().label('Leave Type'),
    }),
};

const addLeaveSetting = {
    body: Joi.object().keys({
        leave_type_id: Joi.string().required().label('Leave Type'),
        department_id: Joi.string().required().label('Department'),
        designation_id: Joi.string().optional().allow("").label('Designation'),
        leave_rules: Joi.array().optional().label("Leave Rules"),
        consider_present_status: Joi.array().optional().label('Consider Present Status'),
        is_allowed_on_notice: Joi.boolean().optional().allow(0).label("Is Allowed On Notice"),
        base_on_credit: Joi.string().optional().allow('').label("Base On Credit"),
        first_month_rules: Joi.array().optional().label("First Month Rules"),
        last_month_rules: Joi.array().optional().label("Last Month Rules"),
        count_weekend_as_leave: Joi.boolean().optional().allow(0).label("Count Weekend as Leave"),
        count_leave_for_preceding_weekends: Joi.boolean().optional().allow(0).label("Count Leave For Preceding Weekend"),
        count_leave_for_succeeding_weekends: Joi.boolean().optional().allow(0).label("Count Leave For Succeeding Weekend"),
        count_holiday_as_leave: Joi.boolean().optional().allow(0).label("Count Holiday as Leave"),
        count_leave_for_preceding_holiday: Joi.boolean().optional().allow(0).label("Count Leave For Preceding Holiday"),
        count_leave_for_succeeding_holiday: Joi.boolean().optional().allow(0).label("Count Leave For Succeeding Holiday"),
        allow_request_for: Joi.string().optional().allow('').label("Allow Request For"),
        allow_request_days: Joi.number().optional().allow(0).label("Allow Request Days"),
        allow_request_value: Joi.string().optional().allow('').label("Allow Request Value"),
        administration_management: Joi.boolean().optional().allow(0).label("Administration Management"),
        enable_file_option: Joi.boolean().optional().allow(0).label("Enable File Option"),
        leave_exceed_for_file: Joi.number().optional().allow(0).label("Leave Exceed For File"),
        not_allowed_clubbing_with: Joi.array().optional().label("Not Allowed Clubbing With"),
        is_active: Joi.boolean().optional().allow(0).label("Is Active"),
    }),
};

const updateLeaveSetting = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('ID'),
        leave_type_id: Joi.string().required().label('Leave Type'),
        department_id: Joi.string().required().label('Department'),
        designation_id: Joi.string().optional().allow("").label('Designation'),
        leave_rules: Joi.array().optional().label("Leave Rules"),
        consider_present_status: Joi.array().optional().label('Consider Present Status'),
        is_allowed_on_notice: Joi.boolean().optional().allow(0).label("Is Allowed On Notice"),
        base_on_credit: Joi.string().optional().allow('').label("Base On Credit"),
        first_month_rules: Joi.array().optional().label("First Month Rules"),
        last_month_rules: Joi.array().optional().label("Last Month Rules"),
        count_weekend_as_leave: Joi.boolean().optional().allow(0).label("Count Weekend as Leave"),
        count_leave_for_preceding_weekends: Joi.boolean().optional().allow(0).label("Count Leave For Preceding Weekend"),
        count_leave_for_succeeding_weekends: Joi.boolean().optional().allow(0).label("Count Leave For Succeeding Weekend"),
        count_holiday_as_leave: Joi.boolean().optional().allow(0).label("Count Holiday as Leave"),
        count_leave_for_preceding_holiday: Joi.boolean().optional().allow(0).label("Count Leave For Preceding Holiday"),
        count_leave_for_succeeding_holiday: Joi.boolean().optional().allow(0).label("Count Leave For Succeeding Holiday"),
        allow_request_for: Joi.string().optional().allow('').label("Allow Request For"),
        allow_request_days: Joi.number().optional().allow(0).label("Allow Request Days"),
        allow_request_value: Joi.string().optional().allow('').label("Allow Request Value"),
        administration_management: Joi.boolean().optional().allow(0).label("Administration Management"),
        enable_file_option: Joi.boolean().optional().allow(0).label("Enable File Option"),
        leave_exceed_for_file: Joi.number().optional().allow(0).label("Leave Exceed For File"),
        not_allowed_clubbing_with: Joi.array().optional().label("Not Allowed Clubbing With"),
        is_active: Joi.boolean().optional().allow(0).label("Is Active"),
    }),
};

const getAllLeaveSetting = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
    }),
};

const getLeaveSetting = {
    query: Joi.object().keys({
        leave_type_id: Joi.string().required().label('Leave Type'),
    }),
};

const getLeaveType = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
    }),
};

const getFilteredLeaveBalanceData = {
    query: Joi.object().keys({
        emp_id: Joi.string().optional().allow('').label('Leave Type'),
        start_date: Joi.string().optional().allow('').label('Start Date'),
        end_date: Joi.string().optional().allow('').label('End Date')
    }),
};

const applyLeave ={
    body:Joi.object().keys({
        leaveDetails:Joi.array().required().label('Leave Details'),
        reason:Joi.string().required().label("Reason")
        // emp_id: Joi.string().required().label("Employee id"),
        // leave_start_date:Joi.string().required().label('leave start dete'),
        // leave_end_date:Joi.string().label("Leave end date"),
        // leave_type: Joi.string().required().label("leave type"),
        // leave_status: Joi.string().required().label("Leave status"),
        // reason:Joi.string().required().label('Reason'),
        // attechment:Joi.string().optional().allow(''),
        // short_leave_start_time:Joi.string().optional().allow(''),
        // short_leave_end_time:Joi.string().optional().allow(''),
        // is_cancel:Joi.boolean().optional().allow(''),
        // cancel_date:Joi.string().optional().allow('')

    })
}

const sandwichLeaveDates = {
    body:Joi.object().keys({
        leaveDetails:Joi.array().required().label('Leave Details'),
        // reason:Joi.string().required().label("Reason")
    })
}

const approveRejectLeave = {
    body:Joi.object().keys({
        _id:Joi.string().required().label("Id"),
        comment:Joi.string().required().label("Comment"),
        action_type:Joi.string().required().label("Action Type")
    })
}

const cancelLeave = {
    query:Joi.object().keys({
        cancel_id:Joi.string().required().label("Cancel Id"),
        employee_id:Joi.string().required().label("leave Type"),
    })
}

const getAllEmployeeLeave = {
    query:Joi.object().keys({
        start_date:Joi.string().required().label("Start Date"),
        end_date:Joi.string().required().label("End Date")
    })
}

const creditDebitLeave = {
    body:Joi.object().keys({
        employee_id:Joi.string().required().label("Employee Id"),
        leave_type:Joi.string().required().label('Leave type'),
        no_of_leave:Joi.number().required().label('No Of Leave'),
        credit_debit:Joi.string().required().label("credit debit"),
        remark:Joi.string().required().label("Remark")

    })
}

const getCreditDebitLeave = {
    query:Joi.object().keys({
        employee_id:Joi.string().required().label("Employee Id"),
    })
}


module.exports = {
    addLeaveType,
    updateLeaveType,
    deleteLeaveType,
    addLeaveSetting,
    updateLeaveSetting,
    getLeaveSettingByLeaveType,
    getAllLeaveSetting,
    getLeaveSetting,
    applyLeave,
    sandwichLeaveDates,
    getLeaveType,
    getFilteredLeaveBalanceData,
    approveRejectLeave,
    cancelLeave,
    getAllEmployeeLeave,
    creditDebitLeave,
    getCreditDebitLeave,
};