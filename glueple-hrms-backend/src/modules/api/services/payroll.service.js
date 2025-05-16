const calculatedAttendanceModel = require('../../../models/calculatedAttendance.model');
const employeeSchema = require('../../../models/employee.model')
const loanSchema = require('../../../models/loan.model')
const loanEmiModel = require('../../../models/loan_emi.model')
const payrollDeductionsTypeSchema = require('../../../models/payrollDeductionsType.model')
const { getServiceResFormat, getAggregatePagination, getDb } = require('../utils/appHelper');
const mongoose = require('mongoose');
const payrollEarningSchema = require('../../../models/payRollEarning.model');
const payrollDeductionsSchema = require('../../../models/payrollDeductions.model');
const payrollEarningTypeSchema = require('../../../models/payrollEarningType.mode');
const payrollArrearsSchema = require('../../../models/payrollArrears.model');
const payrollEmployeeSalarySchema = require('../../../models/payrollEmployeeSalary.model');
const payrollSalaryTemplateSchema = require('../../../models/payrollSalaryTemplate.model');
const payrollEmployeeMonthlySalarySchema = require('../../../models/payrollEmployeeMonthlySalary.model');
const payrollPayRunSchema = require('../../../models/payrollPayrun.model');
const payrollPayScheduleSchema = require('../../../models/payrollPaySchedule.model');
const payrollTaxSlabSchema = require('../../../models/payrollTaxSlab.model');
const payrollEmployeeInvestmentSchema = require('../../../models/payrollEmployeeInvestment.model');
const payrollInvestmentCategorySchema = require('../../../models/payrollInvestmentCategory.model');
const payrollInvestmentSubCategorySchema = require('../../../models/payrollInvestmentSubCategory.model');
const payrollAdvanceSchema = require('../../../models/payrollAdvance.model');
const payrollAdvanceEmiSchema = require('../../../models/payrollAdvanceEmi.model');
const payrollEmployeeInvestmentProofSchema = require('../../../models/payrollEmployeeInvestmentProof.mode');


const getEmployeeDetails = async (filter, options) => {
    const res = getServiceResFormat();
      let db = getDb()
    const totalRecords = await employeeSchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await employeeSchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup": {
                from: "calculated_attendances",
                localField: "_id",
                foreignField: "emp_id",
                as: "calculated_attendances_details"
            }
        },
        {
            "$addFields": {
                present_days: {
                    $size: {
                        $filter: {
                            input: "$calculated_attendances_details",
                            as: "attendance",
                            cond: { $eq: ["$$attendance.attendance_status", "PR"] }
                        }
                    }
                },
                absent_days: {
                    $size: {
                        $filter: {
                            input: "$calculated_attendances_details",
                            as: "attendance",
                            cond: { $eq: ["$$attendance.attendance_status", "AB"] }
                        }
                    }
                },
                pay_days: {
                    $size: {
                        $filter: {
                            input: "$calculated_attendances_details",
                            as: "attendance",
                            cond: { $eq: ["$$attendance.attendance_status", "PR"] }
                        }
                    }
                }
            }
        },
        {
            "$project": {
                "calculated_attendances_details": 0,
            }
        },
        options?.skips,
        options?.limits,

    ]);
    const queryRes = {
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        totalPages: options?.totalPages,
        data: records
    }
    if (queryRes && queryRes?.data?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const addLoans = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const addLoan = await loanSchema(db).create(data)
    if (addLoan) {
        res.data = addLoan
    } else {
        res.status = false;
    }
    return res
}
const addLoanEmi = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const addLoan = await loanEmiModel.create(data)
    if (addLoan.length) {
        res.data = addLoan
    } else {
        res.status = false;
    }
    return res
}

const getLoans = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const totalRecords = await loanSchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await loanSchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup": {
                from: "loan_emis",
                localField: "_id",
                foreignField: "loan_id",
                as: "installments"
            }
        },
        {
            "$lookup": {
                from: "employees",
                localField: "employee_id",
                foreignField: "_id",
                as: "employee_details"
            },
        },
        { "$unwind": { path: "$employee_details", preserveNullAndEmptyArrays: true } },
        {
            "$lookup": {
                from: "departments",
                localField: "employee_details.department_id",
                foreignField: "_id",
                as: "department_details"
            },
        },
        {
            "$lookup": {
                from: "dropdown_masters",
                localField: "loan_type",
                foreignField: "_id",
                as: "loan_type_detail"
            }
        },
        {
            "$lookup": {
                from: "dropdown_masters",
                localField: "tenure_duration",
                foreignField: "_id",
                as: "tenure_duration_detail"
            }
        },
        {
            "$set":
            {
                name: "$employee_details.name",
                emp_code: "$employee_details.emp_id",
                department_name: { "$ifNull": [{ "$arrayElemAt": ["$department_details.name", 0] }, null] },
                loan_type_name: { "$arrayElemAt": ["$loan_type_detail.category_key", 0] },
                tenure_duration_value: { "$arrayElemAt": ["$tenure_duration_detail.category_value", 0] },
                tenure_duration_label: { "$arrayElemAt": ["$tenure_duration_detail.category_label", 0] }

            }
        },
        {
            "$project": {
                employee_details: 0,
                department_details: 0,
                loan_type_detail: 0
            }
        },
        options?.skips,
        options?.limits,
    ])
    const queryRes = {
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        totalPages: options?.totalPages,
        data: records
    }
    if (queryRes && queryRes?.data?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const addEarnings = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const addLoan = await payrollEarningSchema(db).create(data)
    if (addLoan.length) {
        res.data = addLoan
    } else {
        res.status = false;
    }
    return res
}

const addDeductions = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const addDeductions = await payrollDeductionsSchema(db).create(data)
    if (addDeductions.length) {
        res.data = addDeductions
    } else {
        res.status = false
    }
    return res;
}

const getEarnings = async (filter, options) => {
    const res = getServiceResFormat()
    let db = getDb()
    const totalRecords = await payrollEarningSchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await payrollEarningSchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup": {
                from: "payroll_earning_types",
                localField: "earning_type",
                foreignField: "_id",
                as: "earning_type_details"
            }
        },
        {
            "$set":
            {
                earning_type_name: { $arrayElemAt: ["$earning_type_details.earning_type_name", 0] },
            }
        },
        {
            "$project": {
                earning_type_details: 0,
            }
        },
        options?.skips,
        options?.limits,
    ]);
    const queryRes = {
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        totalPages: options?.totalPages,
        data: records
    }
    if (queryRes && queryRes?.data?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const getDeductions = async (filter, options) => {
    const res = getServiceResFormat()
    let db = getDb()
    const totalRecords = await payrollDeductionsSchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await payrollDeductionsSchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup": {
                from: "payroll_deduction_types",
                localField: "deduction_type",
                foreignField: "_id",
                as: "deduction_type_details"
            }
        },
        {
            "$set":
            {
                deduction_type_name: { $arrayElemAt: ["$deduction_type_details.deduction_type_name", 0] },
            }
        },
        {
            "$project": {
                deduction_type_details: 0,
            }
        },
        options?.skips,
        options?.limits,
    ]);
    const queryRes = {
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        totalPages: options?.totalPages,
        data: records
    }
    if (queryRes && queryRes?.data?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const addEarningTypes = async (data) => {
    const res = getServiceResFormat()
    let db = getDb()
    const addEarningTypes = await payrollEarningTypeSchema(db).create(data);
    if (addEarningTypes.length) {
        res.data = addEarningTypes
    } else {
        res.status = false;
    }
    return res
}

const getEarningType = async (filter, options) => {
    const res = getServiceResFormat()
    let db = getDb()
    const totalRecords = await payrollEarningTypeSchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await payrollEarningTypeSchema(db).aggregate([
        { "$match": filter },
        options?.skips,
        options?.limits,
    ]);
    const queryRes = {
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        totalPages: options?.totalPages,
        data: records
    }
    if (queryRes && queryRes?.data?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;

}

const getEarningTypeById = async (filter) => {
    const res = getServiceResFormat()
    let db = getDb()
    const record = await payrollEarningTypeSchema(db).aggregate([{ "$match": filter }])
    if (record && record.length) {
        res.data = record;
    } else {
        res.status = false;
    }
    return res;
}

const getAllEarningType = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await payrollEarningTypeSchema(db).aggregate([
        { "$match": filter },
        {
            "$set":
            {
                label: "$earning_type_name",
                value: "$earning_type",
            }
        },
    ]).allowDiskUse();
    if (queryRes && queryRes?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;

}

const updateEarningType = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollEarningTypeSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true })
    if (record) {
        res.data = record
    } else {
        res.status = false;
    }
    return res
}

const updateEarning = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollEarningSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true })
    if (record) {
        res.data = record
    } else {
        res.status = false;
    }
    return res

}
const updateDeduction = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollDeductionsSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true })
    if (record) {
        res.data = record
    } else {
        res.status = false;
    }
    return res

}
const addDeductionTypes = async (data) => {
    const res = getServiceResFormat()
    let db = getDb()
    const addEarningTypes = await payrollDeductionsTypeSchema(db).create(data);
    if (addEarningTypes.length) {
        res.data = addEarningTypes
    } else {
        res.status = false;
    }
    return res
}

const getDeductionsType = async (filter, options) => {
    const res = getServiceResFormat()
    let db = getDb()
    const totalRecords = await payrollDeductionsTypeSchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await payrollDeductionsTypeSchema(db).aggregate([
        { "$match": filter },
        options?.skips,
        options?.limits,
    ]);
    const queryRes = {
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        totalPages: options?.totalPages,
        data: records
    }
    if (queryRes && queryRes?.data?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const getDeductionTypeById = async (filter) => {
    const res = getServiceResFormat()
    let db = getDb()
    const record = await payrollDeductionsTypeSchema(db).aggregate([{ "$match": filter }])
    if (record && record.length) {
        res.data = record;
    } else {
        res.status = false;
    }
    return res;
}
const updateDeductionType = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollDeductionsTypeSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true })
    if (record) {
        res.data = record
    } else {
        res.status = false;
    }
    return res
}

const getAllDeductionType = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await payrollDeductionsTypeSchema(db).aggregate([
        { "$match": filter },
        {
            "$set":
            {
                label: "$deduction_type_name",
                value: "$deduction_type",
            }
        },
    ]).allowDiskUse();
    if (queryRes && queryRes?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const getEarning = async (filter, optional) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollEarningSchema(db).aggregate([
        { $addFields: optional },
        { "$match": filter },
        {
            "$lookup": {
                from: "payroll_earning_types",
                localField: "earning_type",
                foreignField: "_id",
                as: "earning_type_details"
            }
        },
        {
            "$set":
            {
                earning_type_name: { $arrayElemAt: ["$earning_type_details.deduction_type_name", 0] },
                show_in_payslip: { $arrayElemAt: ["$earning_type_details.show_in_payslip", 0] },
                can_include_as_fbp: { $arrayElemAt: ["$earning_type_details.can_include_as_fbp", 0] },
                is_pro_rata: { $arrayElemAt: ["$earning_type_details.is_pro_rata", 0] },
                is_included_in_epf: { $arrayElemAt: ["$earning_type_details.is_included_in_epf", 0] },
                is_included_in_esi: { $arrayElemAt: ["$earning_type_details.is_included_in_esi", 0] },
            }
        },
        {
            "$project": {
                earning_type_details: 0,
            }
        },
    ]);
    if (record && record.length) {
        res.data = record;
    } else {
        res.status = false;
    }
    return res
};

const getDeduction = async (filter, optional) => {
    const res = getServiceResFormat()
    let db = getDb()
    const record = await payrollDeductionsSchema(db).aggregate([
        { $addFields: optional },
        { "$match": filter },
        {
            "$lookup": {
                from: "payroll_deduction_types",
                localField: "deduction_type",
                foreignField: "_id",
                as: "deduction_type_details"
            }
        },
        {
            "$set":
            {
                earning_type_name: { $arrayElemAt: ["$deduction_type_details.deduction_type_name", 0] },
                show_in_payslip: { $arrayElemAt: ["$deduction_type_details.show_in_payslip", 0] },
                can_include_as_fbp: { $arrayElemAt: ["$deduction_type_details.can_include_as_fbp", 0] },
                is_pro_rata: { $arrayElemAt: ["$deduction_type_details.is_pro_rata", 0] },
                is_included_in_epf: { $arrayElemAt: ["$deduction_type_details.is_included_in_epf", 0] },
                is_included_in_esi: { $arrayElemAt: ["$deduction_type_details.is_included_in_esi", 0] },
            }
        },
        {
            "$project": {
                deduction_type_details: 0,
            }
        },

    ]);
    if (record && record.length) {
        res.data = record;
    } else {
        res.status = false;
    }
    return res
};

const getAllEarning = async (filter) => {
    const res = getServiceResFormat()
    let db = getDb()
    const records = await payrollEarningSchema(db).find(filter)
    if (records && records.length) {
        res.data = records;
    } else {
        res.status = false;
    }
    return res
};

const getAllDeduction = async (filter) => {
    const res = getServiceResFormat()
    let db = getDb()
    const records = await payrollDeductionsSchema(db).find(filter)
    if (records && records.length) {
        res.data = records;
    } else {
        res.status = false;
    }
    return res
};

const addArrears = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const records = await payrollArrearsSchema(db).create(data)
    console.log("dsfd", records)
    if (records) {
        res.data = records
    } else {
        res.status = false
    }
    return res;
};

const getArrears = async (filter, options) => {
    const res = getServiceResFormat()
    let db = getDb()
    const totalRecords = await payrollArrearsSchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await payrollArrearsSchema(db).aggregate([
        { "$match": filter },
        options?.skips,
        options?.limits,
    ]);
    const queryRes = {
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        totalPages: options?.totalPages,
        data: records
    }
    if (queryRes && queryRes?.data?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}
const getArrear = async (filter) => {
    let res = getServiceResFormat();
    let db = getDb()
    const record = await payrollArrearsSchema(db).find(filter)
    if (record && record.length) {
        res.data = record
    } else {
        res.status = false
    }
    return res
}
const saveTemplate = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollSalaryTemplateSchema(db).create(data);
    if (record.length) {
        res.data = record
    } else {
        res.status = false
    }
    return res;
}

const getSalaryTemplate = async (filter, options) => {
    const res = getServiceResFormat()
    let db = getDb()
    const totalRecords = await payrollSalaryTemplateSchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await payrollSalaryTemplateSchema(db).aggregate([
        { "$match": filter },
        options?.skips,
        options?.limits,
    ]);
    const queryRes = {
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        totalPages: options?.totalPages,
        data: records
    }
    if (queryRes && queryRes?.data?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;

}
const getAllSalaryTemplate = async (filter) => {
    const res = getServiceResFormat()
    let db = getDb()
    const records = await payrollSalaryTemplateSchema(db).aggregate([
        { "$match": filter },
        {
            "$set":
            {
                label: "$template_name",
                value: "$_id",
            }
        },
    ]).allowDiskUse();
    if (records && records.length) {
        res.data = records;
    } else {
        res.status = false;
    }
    return res

}

const updateSalaryTemplate = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollSalaryTemplateSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true })
    console.log("record", record)
    if (record) {
        res.data = record
    } else {
        res.status = false;
    }
    return res
}

const addEmployeeSalary = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    let record
    const getEmployee = await payrollEmployeeSalarySchema(db).find({ employee_id: data.employee_id })
    if (getEmployee.length) {
        record = await payrollEmployeeSalarySchema(db).findOneAndUpdate({ employee_id: data.employee_id }, { $set: data }, { new: true })
    } else {
        record = await payrollEmployeeSalarySchema(db).create(data);
    }
    if (record) {
        res.data = record
    } else {
        res.status = false
    }
    return res
}

const addEmployeeMonthlySalary = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollEmployeeMonthlySalarySchema(db).create(data);
    if (record.length) {
        res.data = record
    } else {
        res.status = false
    }
    return res
}


const getEmployeeSalary = async (filter, options) => {
    const res = getServiceResFormat()
    let db = getDb()
    const records = await payrollEmployeeSalarySchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup": {
                from: "employees",
                localField: "employee_id",
                foreignField: "_id",
                as: "employee_details"
            },
        },
        { "$unwind": { path: "$employee_details", preserveNullAndEmptyArrays: true } },
        {
            "$lookup": {
                from: "departments",
                localField: "employee_details.department_id",
                foreignField: "_id",
                as: "department_details"
            },
        },
        {
            "$lookup": {
                from: "designations",
                localField: "employee_details.designation_id",
                foreignField: "_id",
                as: "designations_details"
            },
        },
        {
            "$set":
            {
                employee_name: "$employee_details.name",
                emp_code: '$employee_details.emp_id',
                department: { $arrayElemAt: ['$department_details.name', 0] },
                designation: { $arrayElemAt: ['$designations_details.name', 0] },
                email: "$employee_details.email",
                create_salary: true
            }
        },
        {
            "$project": {
                employee_details: 0,
                department_details: 0,
                designations_details: 0
            }
        },
    ]);
    if (records && records?.length) {
        res.data = records;
    } else {
        res.status = false;
    }
    return res;

}
const getAllEmployeeSalary = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const records = await payrollEmployeeSalarySchema(db).find(filter);
    if (records && records.length) {
        res.data = records;
    } else {
        res.status = false;
    }
    return res

}

const updateEmployeeSalary = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollEmployeeSalarySchema(db).findOneAndUpdate(filter, { $set: update }, { new: true })
    if (record) {
        res.data = record
    } else {
        res.status = false;
    }
    return res
}

const getAllEmployeeAssignStatus = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const totalRecords = await employeeSchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await employeeSchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup": {
                from: "payroll_employee_salaries",
                localField: "_id",
                foreignField: "employee_id",
                as: "employee_salary"
            }
        },
        {
            "$addFields": {
                "salary_status": { "$cond": { "if": { "$gt": [{ "$size": "$employee_salary" }, 0] }, "then": "active", "else": "inactive" } }
            }
        },
        {
            "$project": {
                employee_salary: 0,
            }
        },
        options?.skips,
        options?.limits,
    ]);
    const queryRes = {
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        totalPages: options?.totalPages,
        data: records
    }
    if (queryRes && queryRes?.data?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const createPayRun = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollPayRunSchema(db).create(data)
    if (record) {
        res.data = record
    } else {
        res.status = false
    }
    return res
}

const paySchedule = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollPayScheduleSchema(db).create(data);
    if (record) {
        res.data = record;
    } else {
        res.status = false;
    }
    return res;
}
const updateSchedule = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollPayScheduleSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true })
    if (record) {
        res.data = record;
    } else {
        res.status = false;
    }
    return res;
}

const getPaySchedule = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollPayScheduleSchema(db).find(filter);
    if (record && record.length) {
        res.data = record;
    } else {
        res.status = false;
    }
    return res;
}

const addTaxSlab = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollTaxSlabSchema(db).create(data)
    if (record) {
        res.data = record
    } else {
        res.status = false
    }
    return res
}

const getTaxSlab = async (filter, options) => {
    const res = getServiceResFormat()
    let db = getDb()
    const totalRecords = await payrollTaxSlabSchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await payrollTaxSlabSchema(db).aggregate([
        { "$match": filter },
        options?.skips,
        options?.limits,
    ]);
    const queryRes = {
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        totalPages: options?.totalPages,
        data: records
    }
    if (queryRes && queryRes?.data?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;

}

const updateTaxSlab = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollTaxSlabSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true })
    if (record) {
        res.data = record;
    } else {
        res.status = false;
    }
    return res;
}

const deleteTaxSlab = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await payrollTaxSlabSchema(db).findOneAndDelete(filter);
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const getAllTaxSlab = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollTaxSlabSchema(db).find(filter);
    if (record && record.length) {
        res.data = record
    } else {
        res.status = false
    }
    return res;
}

const addEmployeeInvestment = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollEmployeeInvestmentSchema(db).create(data);
    if (record) {
        res.data = record;
    } else {
        res.status = false;
    }
    return res
}

const getInvestmentByEmployee = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollEmployeeInvestmentSchema(db).aggregate([
        { "$match": filter }
    ]);
    if (record && record.length) {
        res.data = record;
    } else {
        res.status = false;
    }
    return res
}

const updateEmployeeInvestment = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollEmployeeInvestmentSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true });
    if (record) {
        res.data = record;
    } else {
        res.status = false;
    }
    return res;
}

const deleteEmployeeInvestment = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollEmployeeInvestmentSchema(db).findByIdAndDelete(filter);
    if (record) {
        res.data = record;
    } else {
        res.status = false;
    }
    return res;
}

const getPayRun = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollPayRunSchema(db).find(filter).sort({ created_at: -1 });
    if (record && record.length) {
        res.data = record
    } else {
        res.status = false
    }
    return res;
}

const addInvestmentCategory = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollInvestmentCategorySchema(db).create(data);
    if (record) {
        res.data = record
    } else {
        res.status = false
    }
    return res
}

const getInvestmentCategory = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollInvestmentCategorySchema(db).aggregate([
        { "$match": filter },
        {
            "$set":
            {
                label: "$category",
                value: "$_id",
            }
        },
    ]).allowDiskUse();
    if (record && record.length) {
        res.data = record
    } else {
        res.status = false;
    }
    return res
}


const getAllInvestmentCategory = async (filter, options) => {
    const res = getServiceResFormat()
    let db = getDb()
    const totalRecords = await payrollInvestmentCategorySchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await payrollInvestmentCategorySchema(db).aggregate([
        { "$match": filter },
        options?.skips,
        options?.limits,
    ]);
    const queryRes = {
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        totalPages: options?.totalPages,
        data: records
    }
    if (queryRes && queryRes?.data?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;

}

const updateInvestmentCategory = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollInvestmentCategorySchema(db).findOneAndUpdate(filter, { $set: update }, { new: true });
    if (record) {
        res.data = record;
    } else {
        res.status = false;
    }
    return res;

}
const deleteInvestmentCategory = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollInvestmentCategorySchema(db).findByIdAndDelete(filter);
    if (record) {
        res.data = record;
    } else {
        res.status = false;
    }
    return res;

}

const addInvestmentSubCategory = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollInvestmentSubCategorySchema(db).create(data);
    if (record) {
        res.data = record;
    } else {
        res.status = false;
    }
    return res
}

const getInvestmentSubCategory = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollInvestmentSubCategorySchema(db).aggregate([
        { "$match": filter },
        {
            "$set":
            {
                label: "$sub_category_name",
                value: "$_id",
            }
        },
    ]).allowDiskUse();
    if (record && record.length) {
        res.data = record;
    } else {
        res.status = false;
    }
    return res;
}

const updateInvestmentSubCategory = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollInvestmentSubCategorySchema(db).findOneAndUpdate(filter, { $set: update }, { new: true });
    if (record) {
        res.data = record;
    } else {
        res.status = false;
    }
    return res;

}
const deleteInvestmentSubCategory = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollInvestmentSubCategorySchema(db).findByIdAndDelete(filter);
    if (record) {
        res.data = record;
    } else {
        res.status = false;
    }
    return res;
}

const getAllInvestmentSubCategory = async (filter, options) => {
    const res = getServiceResFormat()
    let db = getDb()
    const totalRecords = await payrollInvestmentSubCategorySchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await payrollInvestmentSubCategorySchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup": {
                from: "payroll_investment_categories",
                localField: "category_id",
                foreignField: "_id",
                as: "category_details"
            }
        },
        {
            "$set":
            {
                category_name: { $arrayElemAt: ['$category_details.category', 0] },
            }
        },
        {
            "$project": {
                category_details: 0,

            }
        },
        options?.skips,
        options?.limits,
    ]);
    const queryRes = {
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        totalPages: options?.totalPages,
        data: records
    }
    if (queryRes && queryRes?.data?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;

}

const getAllCategory = async(filter) =>{
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollInvestmentCategorySchema(db).aggregate([
            { "$match": filter },
            {
                "$lookup": {
                    "from": "payroll_investment_subcategories",
                    "localField": "_id",
                    "foreignField": "category_id",
                    "as": "sub_category"
                }
            },
            {
                "$set": {
                
                    "sub_category": {
                        "$map": {
                            "input": "$sub_category",
                            "as": "sub",
                            "in": {
                                "label": "$$sub.sub_category_name",
                                "value": "$$sub.sub_category_name",
                                "sub_category_name": "$$sub.sub_category_name",
                                "input_type": "$$sub.input_type"  ,
                                "max_limit": "$$sub.max_limit",
                                "max_limit_amount":"$$sub.max_limit_amount",
                                
                            }
                        }
                    }
                }
            }
        ]);
    if(record && record.length){
        res.data = record;
    }else{
        res.status = false;
    }
    return res;

}

const addAdvance = async(data)=>{
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollAdvanceSchema(db).create(data);
    if(record){
        res.data = record;
    }else{
        res.status = false;
    }
    return res
}

const addAdvanceEmi = async(data) =>{
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollAdvanceEmiSchema(db).create(data);
    if(record){
        res.data = record;
    }else{
        res.status = false;
    }
    return res
}

const getAdvanceRequest = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const { request_for, parameter, status, limit, page, user } = filter
    const approvalCondition = status == '' ? { "approvers_details.type": parameter } : { "approvers_details.action_type": status, "approvers_details.type": parameter }
    const Condition = request_for == "applied" ? { employee_id: mongoose.Types.ObjectId(user.id) } : ""
    const totalRecords = await payrollAdvanceSchema(db).find(Condition).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await payrollAdvanceSchema(db).aggregate([
        { "$match": Condition },
        {
            "$lookup": {
                from: 'payroll_advance_emis',
                localField: "_id",
                foreignField: "advance_id",
                as: "advance_emi_details"
            }
        },
        {
            "$lookup": {
                from: 'approvers',
                localField: "_id",
                foreignField: "collection_id",
                as: "approvers_details"
            }
        },
        { $match: approvalCondition },
        {
            "$lookup": {
                from: 'employees',
                localField: 'emp_id',
                foreignField: "_id",
                as: "employee_details"
            }
        },
        { $unwind: { path: "$employee_details", preserveNullAndEmptyArrays: true } },
        {
            $set:{
                emp_id: "$employee_details.emp_id",
                name: "$employee_details.name",
                employee_id: '$employee_details._id',
                approvers_status: { "$arrayElemAt": ["$approvers_details.action_type", 0] },
                approval_id: { "$arrayElemAt": ["$approvers_details._id", 0] },

            },
            $project: {
                employee_details: 0,
                approvers_details:0
            }
        },
        options?.skips,
        options?.limits
    ]).allowDiskUse()
    const queryRes = {
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        totalPages: options?.totalPages,
        data: records
    }
    if (queryRes && queryRes?.data?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const getAdvanceApproval = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    filter = filter?.approver_id ? { ...filter, approver_id: { $in: [mongoose.Types.ObjectId(filter?.approver_id)] } } : filter;
    const totalRecords = await approverModel.find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await approverModel.aggregate([
        { "$match": filter },
        {
            "$lookup":
            {
                from: "payroll_advances",
                localField: "collection_id",
                foreignField: "_id",
                as: "advance_details",
            },
        },
        { $unwind: { path: "$advance_details", preserveNullAndEmptyArrays: true } },
        {
            "$lookup": {
                from: 'payroll_advance_emis',
                localField: "advance_details._id",
                foreignField: "advance_id",
                as: "advance_emi_details"
            }
        },
        {
            "$lookup":
            {
                from: "approvers",
                localField: "collection_id",
                foreignField: "collection_id",
                as: "approval_status",
            },
        },
        {
            "$lookup":
            {
                from: "employees",
                localField: "approval_status.approver_id",
                foreignField: "_id",
                as: "approver_data"
            }
        },
        {
            "$lookup":
            {
                from: "employees",
                localField: "advance_details.employee_id",
                foreignField: "_id",
                as: "employee_details"
            }
        },
        {
            "$lookup":
            {
                from: "designations",
                localField: "employee_details.designation_id",
                foreignField: "_id",
                as: "designations_details"
            }
        },
        {
            "$lookup":
            {
                from: "roles",
                localField: "approver_data.role_id",
                foreignField: "_id",
                as: "role_data"
            },
        },
        {
            "$set": {
                approver_data: {
                    "$map": {
                        input: "$approver_data",
                        as: "role",
                        in: {
                            "$mergeObjects": [
                                "$$role",
                                {
                                    role_name: {
                                        "$let": {
                                            vars: {
                                                matchedRole: {
                                                    "$arrayElemAt": [
                                                        {
                                                            "$filter": {
                                                                input: "$role_data",
                                                                as: "role_name",
                                                                cond: { "$eq": ["$$role_name._id", "$$role.role_id"] }
                                                            }
                                                        },
                                                        0
                                                    ]
                                                }
                                            },
                                            in: { "$ifNull": ["$$matchedRole.name", ""] }
                                        }
                                    },
                                }
                            ]
                        }
                    }
                }
            }
        },
        {
            "$set": {
                approval_status: {
                    "$map": {
                        input: "$approval_status",
                        as: "approver",
                        in: {
                            "$mergeObjects": [
                                "$$approver",
                                {
                                    approver_name: {
                                        "$let": {
                                            vars: {
                                                matchedEmployee: {
                                                    "$arrayElemAt": [
                                                        {
                                                            "$filter": {
                                                                input: "$approver_data",
                                                                as: "employee",
                                                                cond: { "$eq": ["$$employee._id", "$$approver.action_by"] }
                                                            }
                                                        },
                                                        0
                                                    ]
                                                }
                                            },
                                            in: { "$ifNull": [{ $concat: ["$$matchedEmployee.name", ' (', "$$matchedEmployee.emp_id", ')'] }, ""] }
                                        }
                                    },
                                },
                                {
                                    role_name: {
                                        "$let": {
                                            vars: {
                                                matchedEmployee: {
                                                    "$arrayElemAt": [
                                                        {
                                                            "$filter": {
                                                                input: "$approver_data",
                                                                as: "employee",
                                                                cond: { "$eq": ["$$employee._id", "$$approver.action_by"] }
                                                            }
                                                        },
                                                        0
                                                    ]
                                                }
                                            },
                                            in: { "$ifNull": ["$$matchedEmployee.role_name", ""] }
                                        }
                                    },
                                },
                                {
                                    concatenated_name: {
                                        "$let": {
                                            vars: {
                                                matchedEmployee: {
                                                    "$filter": {
                                                        input: "$approver_data",
                                                        as: "employee",
                                                        cond: { "$in": ["$$employee._id", "$$approver.approver_id"] }
                                                    }
                                                }
                                            },
                                            in: {
                                                "$ifNull": [{
                                                    "$reduce": {
                                                        input: {
                                                            "$map": {
                                                                input: "$$matchedEmployee",
                                                                as: "user",
                                                                in: { $toString: "$$user._id" }
                                                            }
                                                        },
                                                        initialValue: "",
                                                        in: {
                                                            "$cond": {
                                                                if: { "$eq": ["$$value", ""] },
                                                                then: "$$this",
                                                                else: { "$concat": ["$$value", ", ", "$$this"] }
                                                            }
                                                        }
                                                    }
                                                }, ""]
                                            }
                                        }
                                    }
                                }


                            ]
                        }
                    }
                }
            }
        },
        {
            "$addFields": {
                last_approval: {
                    "$arrayElemAt": [
                        "$approval_status",
                        -1
                    ]
                },
                rejection: {
                    "$filter": {
                        input: "$approval_status",
                        as: "approval",
                        cond: { "$eq": ["$$approval.action_type", "reject"] }
                    }
                },
                pending: {
                    "$filter": {
                        input: "$approval_status",
                        as: "approval",
                        cond: { "$eq": ["$$approval.action_type", "pending"] }
                    }
                },
            }
        },
        {
            "$set":
            {
                emp_id: { "$arrayElemAt": ["$employee_details.emp_id", 0] },
                name: { "$arrayElemAt": ["$employee_details.name", 0] },
                email: { "$arrayElemAt": ["$employee_details.email", 0] },
                employee_id: { "$arrayElemAt": ["$employee_details._id", 0] },
                payment_date: { "$arrayElemAt": ["$advance_details.payment_date", 0] },
                designations_name: { "$arrayElemAt": ["$designations_details.name", 0] },
                approval_id: "$_id",
                leave_type: { "$arrayElemAt": ["$leave_data.type", 0] },
                approval_status_name: {
                    "$cond": {
                        if: { "$gt": [{ "$size": "$rejection" }, 0] },
                        then: "reject",
                        else: {
                            "$cond": {
                                if: { "$gt": [{ "$size": "$pending" }, 0] },
                                then: "pending",
                                else: { "$arrayElemAt": ["$approval_status.action_type", -1] }
                            }
                        }
                    }
                },
                approval_action_to: {
                    "$cond": {
                        if: { "$gt": [{ "$size": "$rejection" }, 0] },
                        then: "$rejection.approver_name",
                        else: {
                            "$cond": {
                                if: { "$gt": [{ "$size": "$pending" }, 0] },
                                then: { "$arrayElemAt": ["$pending.concatenated_name", 0] },
                                else: { "$arrayElemAt": ["$approval_status.approver_name", -1] }
                            }
                        }
                    }
                },
            }
        },
        options?.skips,
        options?.limits
    ]).allowDiskUse()
    const queryRes = {
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        totalPages: options?.totalPages,
        data: records
    }
    if (queryRes && queryRes?.data?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const getAdvanceProgress = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const records = await payrollAdvanceSchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup": {
                from: "approvers",
                localField: "_id",
                foreignField: "collection_id",
                as: "approval_status",
                pipeline: [
                    {
                        $lookup: {
                            from: "employees",
                            localField: "approver_id",
                            foreignField: "_id",
                            as: "employee_data",
                            pipeline: [
                                {
                                    $lookup: {
                                        from: "roles",
                                        localField: "role_id",
                                        foreignField: "_id",
                                        as: "role_data"
                                    }
                                },
                                {
                                    $project: {
                                        emp_id: 1,
                                        name: 1,
                                        email: 1,
                                        role_name: { $arrayElemAt: ["$role_data.name", 0] }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $project: {
                            approver_id: 1,
                            comment: 1,
                            action_type: 1,
                            employee_data: { $arrayElemAt: ["$employee_data", 0] }
                        }
                    }
                ]
            }
        },
        {
            "$set": {
                approver_data: {
                    "$map": {
                        input: "$approval_status",
                        as: "status",
                        in: {
                            emp_id: "$$status.employee_data.emp_id",
                            name: "$$status.employee_data.name",
                            email: "$$status.employee_data.email",
                            role_name: "$$status.employee_data.role_name",
                            comment: "$$status.comment",
                            action_type: "$$status.action_type"
                        }
                    }
                }
            }
        },
        {
            "$project": {
                approval_status: 0
            }
        }
    ]);
    if (records) {
        res.data = records
    } else {
        res.status = false
    }
    return res
}

const getLoansEmi = async(filter)=>{
    const res = getServiceResFormat();
    let db = getDb()
    const Condition = {"loan_emi_details.payment_date":filter.payment_date}
    const record = await loanSchema(db).aggregate([
        {
            "$match": {employee_id:filter.employee_id}
        },
        {
            "$lookup": {
                from: 'loan_emis',
                localField: "_id",
                foreignField: "loan_id",
                as: "loan_emi_details"
            }
        },
        {
            "$unwind": "$loan_emi_details" 
        },
        { 
            "$match": Condition
        }
    ]);
    if(record && record.length){
        res.data = record
    }else{
        res.status = false
    }
    return res;

}

const getAdvanceEmi = async(filter)=>{
    let db = getDb()
    const res = getServiceResFormat();
    const Condition = {"loan_emi_details.payment_date":filter.payment_date}
    const record = await loanSchema(db).aggregate([
        {
            "$match": {employee_id:filter.employee_id,}
        },
        {
            "$lookup": {
                from: 'loan_emis',
                localField: "_id",
                foreignField: "loan_id",
                as: "loan_emi_details"
            }
        },
        {
            "$unwind": "$loan_emi_details" 
        },
        { 
            "$match": Condition
        }
    ]);
    if(record && record.length){
        res.data = record
    }else{
        res.status = false
    }
    return res;

}

const saveMonthlySalaryInBulk = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    let bulk = payrollEmployeeMonthlySalarySchema(db).collection.initializeUnorderedBulkOp();
    for (let i = 0; i < data?.length; i++) {
        const item = data[i];
        bulk.find({ employee_id: item.employee_id, year_mon: item.year_mon }).upsert().updateOne({ $set: item });
    }
    bulk.execute(async (err, result) => {
        if (result) {
            res.data = result;
        } else {
            res.status = false;
        }
    });
    return res;
};

const getMonthSalary = async(filter)=>{
    let db = getDb()
    const res = getServiceResFormat();
    const record = await payrollEmployeeMonthlySalarySchema(db).find(filter);
    if(record && record.length){
        res.data = record
    }else{
        res.status = false
    }
    return res;

}

const getPayRunMonthlySalary = async(filter,options)=>{
    let db = getDb()
    const res = getServiceResFormat();
    const totalRecords = await payrollEmployeeMonthlySalarySchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await payrollEmployeeMonthlySalarySchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup":
            {
                from: "employees",
                localField: "employee_id",
                foreignField: "_id",
                as: "employee_details"
            }
        },
        {
            "$set":
            {
                employee_name: { $arrayElemAt: ['$employee_details.name', 0] },
                emp_code:{ $arrayElemAt: ['$employee_details.emp_id', 0] },
            }
        },
        {
            "$project": {
                employee_details: 0,
            }
        },
        options?.skips,
        options?.limits,
    ]);
    const queryRes = {
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        totalPages: options?.totalPages,
        data: records
    }
    if(queryRes){
        res.data = queryRes
    }else{
        res.status = false;
    }
    return res;
}

const approvePayroll = async(data)=>{
    let db = getDb()
    const res = getServiceResFormat();
    const record = await payrollPayRunSchema(db).create(data);
    if(record){
        res.data = record;
    }else{
        res.status = false;
    }
    return res;
}

const getPayRunHistory = async(filter,options)=>{
    const res = getServiceResFormat()
    let db = getDb()
    const totalRecords = await payrollPayRunSchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await payrollPayRunSchema(db).aggregate([
        { "$match": filter },
        options?.skips,
        options?.limits,
    ]);
    const queryRes = {
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        totalPages: options?.totalPages,
        data: records
    }
    if (queryRes && queryRes?.data?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const employeeInvestmentProof = async(data)=>{
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollEmployeeInvestmentProofSchema(db).create(data);
    if(record && record.length){
        res.data = record
    }else{
        res.status = false;
    }
    return res;
}

const getEmployeeInvestmentProof = async(filter)=>{
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollEmployeeInvestmentProofSchema(db).aggregate([
        {"$match":filter}
    ])
    if(record && record.length){
        res.data = record;
    }else{
        res.status = false;
    }
    return res;
}

const updateEmployeeInvestmentProof = async(filter, update)=>{
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollEmployeeInvestmentProofSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true });
    if(record){
        res.data = record;
    }else{
        res.status = false;
    }
    return res;
}

const deleteEmployeeInvestmentProof = async(filter)=>{
    const res = getServiceResFormat();
    let db = getDb()
    const record = await payrollEmployeeInvestmentProofSchema(db).findOneAndDelete(filter);
    if(record){
        res.data = record;
    }else{
        res.status = false;
    }
    return res;
}

const getEmployeeMonthlySalary = async(filter)=>{
    const res = getServiceResFormat();
    let db = getDb()
    const records = await payrollEmployeeMonthlySalarySchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup": {
                from: "payroll_employee_salaries",
                localField: "employee_id",
                foreignField: "employee_id",
                as: "employee_salary"
            }
        }
    ]);
    if(records && records.length){
        res.data = records
    }else{
        res.status = false
    }
    return res
}
const getEmployeeMonthly = async (filter, options) => {
    const res = getServiceResFormat()
    let db = getDb()
    const records = await payrollEmployeeMonthlySalarySchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup": {
                from: "employees",
                localField: "employee_id",
                foreignField: "_id",
                as: "employee_details"
            },
        },
        { "$unwind": { path: "$employee_details", preserveNullAndEmptyArrays: true } },
        {
            "$lookup": {
                from: "departments",
                localField: "employee_details.department_id",
                foreignField: "_id",
                as: "department_details"
            },
        },
        {
            "$lookup": {
                from: "designations",
                localField: "employee_details.designation_id",
                foreignField: "_id",
                as: "designations_details"
            },
        },
        {
            "$set":
            {
                department: { $arrayElemAt: ['$department_details.name', 0] },
                designation: { $arrayElemAt: ['$designations_details.name', 0] },
                
            }
        },
        {
            $replaceRoot: {
              newRoot: {
                $mergeObjects: [
                  "$employee_details",   
                  "$$ROOT"              
                ]
              }
            }
          },
        {
            "$project": {
                department_details: 0,
                designations_details: 0,
                employee_details:0
            }
        },
    ]);
    if (records && records?.length) {
        res.data = records;
    } else {
        res.status = false;
    }
    return res;

}

const EmployeeSalary = async (filter) => {
    const res = getServiceResFormat()
    let db = getDb()
    const records = await payrollEmployeeSalarySchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup": {
                from: "employees",
                localField: "employee_id",
                foreignField: "_id",
                as: "employee_details"
            },
        },
        { "$unwind": { path: "$employee_details", preserveNullAndEmptyArrays: true } },
        {
            "$lookup": {
                from: "departments",
                localField: "employee_details.department_id",
                foreignField: "_id",
                as: "department_details"
            },
        },
        {
            "$lookup": {
                from: "designations",
                localField: "employee_details.designation_id",
                foreignField: "_id",
                as: "designations_details"
            },
        },
        {
            "$lookup": {
                from: "employees",
                localField: "employee_details.reported_to",
                foreignField: "_id",
                as: "employee_reported"
            },
        },
        {
            "$lookup": {
                from: "locations",
                localField: "employee_details.location",
                foreignField: "_id",
                as: "employee_location"
            },
        },
        {
            "$set":
            {
                department: { $arrayElemAt: ['$department_details.name', 0] },
                designation: { $arrayElemAt: ['$designations_details.name', 0] },
                reporting_name: { $arrayElemAt: ['$employee_reported.name', 0] },
                location:{ $arrayElemAt: ['$employee_location.name', 0] }
            }
        },
        {
            $replaceRoot: {
              newRoot: {
                $mergeObjects: [
                  "$employee_details",   
                  "$$ROOT"              
                ]
              }
            }
          },
        {
            "$project": {
                employee_details: 0,
                department_details: 0,
                designations_details: 0,
                employee_reported:0
            }
        },
    ]);
    if (records && records?.length) {
        res.data = records;
    } else {
        res.status = false;
    }
    return res;

}

module.exports = {
    getEmployeeDetails,
    addLoans,
    addLoanEmi,
    getLoans,
    addEarnings,
    addDeductions,
    getEarnings,
    getDeductions,
    addEarningTypes,
    getEarningType,
    getEarningTypeById,
    getAllEarningType,
    updateEarningType,
    updateEarning,
    updateDeduction,
    addDeductionTypes,
    getDeductionsType,
    getDeductionTypeById,
    getEarning,
    getDeduction,
    updateDeductionType,
    getAllDeductionType,
    getAllEarning,
    getAllDeduction,
    addArrears,
    getArrears,
    addEmployeeSalary,
    saveTemplate,
    getSalaryTemplate,
    getAllSalaryTemplate,
    updateSalaryTemplate,
    getEmployeeSalary,
    getAllEmployeeSalary,
    updateEmployeeSalary,
    addEmployeeMonthlySalary,
    getArrear,
    createPayRun,
    getAllEmployeeAssignStatus,
    paySchedule,
    updateSchedule,
    getPaySchedule,
    addTaxSlab,
    getTaxSlab,
    updateTaxSlab,
    deleteTaxSlab,
    getAllTaxSlab,
    addEmployeeInvestment,
    getInvestmentByEmployee,
    updateEmployeeInvestment,
    deleteEmployeeInvestment,
    getPayRun,
    addInvestmentCategory,
    getInvestmentCategory,
    addInvestmentSubCategory,
    getInvestmentSubCategory,
    updateInvestmentCategory,
    deleteInvestmentCategory,
    updateInvestmentSubCategory,
    deleteInvestmentSubCategory,
    getAllInvestmentCategory,
    getAllInvestmentSubCategory,
    addAdvance,
    addAdvanceEmi,
    getAllCategory,
    getAdvanceRequest,
    getAdvanceApproval,
    getAdvanceProgress,
    getLoansEmi,
    saveMonthlySalaryInBulk,
    getPayRunMonthlySalary,
    getMonthSalary,
    approvePayroll,
    getPayRunHistory,
    employeeInvestmentProof,
    getEmployeeInvestmentProof,
    updateEmployeeInvestmentProof,
    deleteEmployeeInvestmentProof,
    getEmployeeMonthlySalary,
    getEmployeeMonthly,
    EmployeeSalary
};
