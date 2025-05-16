const { name } = require('ejs');
const Joi = require('joi');

const updateAttendanceTracking = {
    body: Joi.object().keys({
        emp_id: Joi.string().required().label('emp id'),
        attendance_date: Joi.string().required().label('attendance date'),
        updated_status: Joi.string().optional().allow('').label("status"),
        type: Joi.string().required().allow(0).label('type'),
        punch_in_time: Joi.string().optional().allow('').label('Punch In Time'),
        punch_out_time:Joi.string().optional().allow('').label('Punch Out Time'),
  }),
};

const updateAttendanceTrackingInBulk = {
    body:Joi.object().keys({
        emp_id:Joi.string().required().label('emp id'),
        type:Joi.string().required().label('type'),
        attendance_details:Joi.array().required().label('Attendance Details')
    })
}

const addLoans = {
    body:Joi.object().keys({
        employee_id:Joi.string().required().label("Emp id"),
        loan_type: Joi.string().required().label("Loan Type"),
        amount:Joi.number().required().label("Amount"),
        start_date:Joi.string().required().label("start date"),
        end_date: Joi.string().required().label("end date"),
        tenure_duration: Joi.string().required().label("Duration"),
        installments:Joi.array().required().label("installment")
    })
}

const addEarningTypes = {
    body:Joi.object().keys({
        earning_type_name:Joi.string().required().label("Earning Type"),
        calculation_type:Joi.string().optional().allow(' '),
        is_active:Joi.boolean().required().label("Active"),
        show_in_payslip:Joi.string().required().label("Show in Payslip"),
        can_include_as_fbp:Joi.string().required().label('FBP'),
        is_pro_rata:Joi.string().required().label('Pro Rata'),
        is_included_in_epf:Joi.string().required().label('EPF'),
        is_included_in_esi:Joi.string().required().label('ESI'),

    })
}

const generateSalaryTemplate = {
    body:Joi.object().keys({
        is_include_bonus:Joi.number().optional().allow('').label('is include bonus'),
        meal_allowance:Joi.number().optional().allow('').label('meal allowance'),
        is_pf:Joi.number().optional().allow('').label('is pf'),
        is_esi:Joi.number().optional().allow('').label('is esi'),
        ctc:Joi.number().required().label('ctc'),
        template_id:Joi.string().optional().allow('')
    })
}

const calculateCtc = {
    body:Joi.object().keys({
        is_include_bonus:Joi.number().optional().allow('').label('is include bonus'),
        meal_allowance:Joi.number().optional().allow('').label('meal allowance'),
        earnings:Joi.array().required().label("Earning"),
        deductions:Joi.array().required().label('Deduction'),
        ctc:Joi.number().required().label('ctc'),
    })
}

const getArrears = {
     query: Joi.object().keys({
            limit: Joi.number().optional().allow(0).label('Limit'),
            page: Joi.number().optional().allow(0).label('Page'),
        })
}

const getSalaryTemplate = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
    })
};

const getAllSalaryTemplate = {
    query: Joi.object().keys({
        _id: Joi.string().optional().allow('').label('id'),
    })
};

const checkRuleFormula= {
    body:Joi.object().keys({
        formula:Joi.string().optional().allow("").label('Formula')
    })
}

const createSalaryTemplate = {
    body:Joi.object().keys({
        template_name:Joi.string().required().label('Template Name'),
        description:Joi.string().required().label('Description'),
        earnings:Joi.array().required().label('Earning'),
        deductions:Joi.array().required().label('Deduction'),
        bonus:Joi.object().required().label("Bonus"),
        ctc:Joi.object().required().label('CTC'),
        gross:Joi.object().required().label("Gross"),
        total_employee:Joi.object().required().label('Total Employee'),
        total_employer:Joi.object().required().label("Total Employer"),
        total_ctc:Joi.object().required().label('Total Ctc'),
        take_home:Joi.object().required().label("Take Home")
    })
}

const updateSalaryTemplate = {
    body:Joi.object().keys({
        _id:Joi.string().required().label("_id"),
        template_name:Joi.string().required().label('Template Name'),
        description:Joi.string().required().label('Description'),
        earnings:Joi.array().required().label('Earning'),
        deductions:Joi.array().required().label('Deduction'),
        bonus:Joi.object().required().label("Bonus"),
        ctc:Joi.object().required().label('CTC'),
        gross:Joi.object().required().label("Gross"),
        total_employee:Joi.object().required().label('Total Employee'),
        total_employer:Joi.object().required().label("Total Employer"),
        total_ctc:Joi.object().required().label('Total Ctc'),
        take_home:Joi.object().required().label("Take Home")
    })
}

const getEmployeeSalary = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
    })
};

const getAllEmployeeSalary = {
    query: Joi.object().keys({
        _id: Joi.string().optional().allow('').label('id'),
    })

};
const createEmployeeSalary = {
    body:Joi.object().keys({
        employee_id:Joi.string().required().label("Employee id"),
        earnings:Joi.array().required().label('Earning'),
        deductions:Joi.array().required().label('Deduction'),
        bonus:Joi.object().required().label("Bonus"),
        ctc:Joi.object().required().label('CTC'),
        gross:Joi.object().required().label("Gross"),
        total_employee:Joi.object().required().label('Total Employee'),
        total_employer:Joi.object().required().label("Total Employer"),
        total_ctc:Joi.object().required().label('Total Ctc'),
        take_home:Joi.object().required().label("Take Home"),
        _id:Joi.string().optional().allow(" ")
    })
}

const getArrearsEmployeeWise= {
    query: Joi.object().keys({
        _id: Joi.string().optional().allow('').label('id'),
    })
}

const addTaxSlab = {
    body:Joi.object().keys({
        type:Joi.string().required().label("Type"),
        start:Joi.number().required().label('Start'),
        end:Joi.number().required().label('End'),
        tex_percent:Joi.number().required().label("tex percent"),
        is_include_cess:Joi.boolean().required().label('is include'),
        cess_percent:Joi.number().required().label('cess Percent'),
        is_standard_deduction:Joi.boolean().required().label('is Standard'),
        standard_deduction_value:Joi.number().required().label('standard deduction'),
        tex_relaxation:Joi.number().required().label('tex relaxation'),
        constant_difference:Joi.number().required().label('constant difference'),
        is_rebate_allowed:Joi.boolean().optional().allow(""),
        rebate_rules:Joi.object().optional().allow(""),
        is_active:Joi.boolean().required().label("is Active")
    })
}

const getTaxSlab ={
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
    })
}

const deleteTaxSlab = {
    body:Joi.object().keys({
        _id: Joi.string().optional().allow('').label('id'),
    })

}

const addInvestmentCategory = {
    body:Joi.object().keys({
        category:Joi.string().required().label("category"),
        input_type: Joi.string().optional().allow('').label('input type'),
        alert: Joi.string().optional().allow('').label('Alert'),
        max_limit:Joi.boolean().required().label('Max limit'),
        max_limit_amount:Joi.number().required().label('max limit amount'),
        is_eligible_for_new:Joi.boolean().required().label("eligible for new"),
        is_eligible_for_old:Joi.boolean().required().label('eligible for old'),
    })

}
const getAllInvestmentCategory = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
    })

}

const updateInvestmentCategory = {
    body:Joi.object().keys({
        category:Joi.string().required().label("category"),
        input_type: Joi.string().optional().allow('').label('input type'),
        alert: Joi.string().optional().allow('').label('Alert'),
        max_limit:Joi.boolean().required().label('Max limit'),
        max_limit_amount:Joi.number().required().label('max limit amount'),
        is_eligible_for_new:Joi.boolean().required().label("eligible for new"),
        is_eligible_for_old:Joi.boolean().required().label('eligible for old'),
       _id:Joi.string().required().label('Id')
    })

}

const deleteInvestmentCategory = {
    body:Joi.object().keys({
        _id: Joi.string().optional().allow('').label('id'),
    })

}

const addInvestmentSubCategory = {
    body:Joi.object().keys({
        category_id:Joi.string().required().label("category id"),
        sub_category_name:Joi.string().required().label('sub category name'),
        input_type:Joi.string().required().label('input type'),
        max_limit:Joi.boolean().required().label("max limit"),
        max_limit_amount:Joi.number().required().label('max limit amount'),
    })
}

const updateInvestmentSubCategory = {
    body:Joi.object().keys({
        category_id:Joi.string().required().label("category id"),
        sub_category_name:Joi.string().required().label('sub category name'),
        input_type:Joi.string().required().label('input type'),
        max_limit:Joi.boolean().required().label("max limit"),
        max_limit_amount:Joi.number().required().label('max limit amount'),
       _id:Joi.string().required().label('Id')
    })
}

const deleteInvestmentSubCategory = {
    body:Joi.object().keys({
        _id: Joi.string().optional().allow('').label('id'),
    })
}

const getAllInvestmentSubCategory = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
    })
}

const approvePayroll = {
    body:Joi.object().keys({
        payroll_cost:Joi.number().required().label("Payroll Cost"),
        payroll_netPay:Joi.number().required().label("Net payroll Cost"),
        tex:Joi.number().required().label("Tax"),
        pre_tex_deduction:Joi.number().optional().allow(0),
        employee_no:Joi.number().required().label("Number of Employee"),
        pay_date:Joi.string().optional().allow('').label("Pay Date"),
        pay_month:Joi.string().required().label("pay month"),
        status:Joi.boolean().required().label("status")
    })
}
const getEmployeeMonthlySalary = {
    query: Joi.object().keys({
        employee_id: Joi.string().required().label('Employee id'),
        month: Joi.string().required().label('Month'),
    })

}

const sendOfferLetter={
    query:Joi.object().keys({
        salary_id:Joi.string().required().label("Salary Id"),
        employee_id:Joi.string().required().label("Employee Id"),
        is_preview:Joi.boolean().required().label("is Preview")
    })
}
 


module.exports = {
    updateAttendanceTracking,
    updateAttendanceTrackingInBulk,
    addLoans,
    addEarningTypes,
    generateSalaryTemplate,
    calculateCtc,
    getArrears,
    getSalaryTemplate,
    getAllSalaryTemplate,
    checkRuleFormula,
    createSalaryTemplate,
    getAllEmployeeSalary,
    getEmployeeSalary,
    updateSalaryTemplate,
    createEmployeeSalary,
    getArrearsEmployeeWise,
    addTaxSlab,
    getTaxSlab,
    deleteTaxSlab,
    addInvestmentCategory,
    getAllInvestmentCategory,
    updateInvestmentCategory,
    deleteInvestmentCategory,
    addInvestmentSubCategory,
    updateInvestmentSubCategory,
    deleteInvestmentSubCategory,
    getAllInvestmentSubCategory,
    approvePayroll,
    getEmployeeMonthlySalary,
    sendOfferLetter
};