const express = require('express');
const validate = require('../../../middlewares/validate');
const payrollValidation = require('../validation/payroll.validation')
const payrollController = require('../controller/payroll.controller')
const isAuthenticated = require('../../../middlewares/auth');
const checkPermission = require('../../../middlewares/webAuth');
const { paySchedule } = require('../services/payroll.service');
const { employeeInvestmentProof } = require('../../../middlewares/multer');

const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.post('/get-employee-details', payrollController.getEmployeeDetailsByPayDays)
router.post('/get-attendance-status', payrollController.getAttendanceStatus);
router.post('/update-attendance-tracking', validate(payrollValidation.updateAttendanceTracking), payrollController.updateAttendanceTracking)
router.post('/update-attendance-tracking-in-bulk', validate(payrollValidation.updateAttendanceTrackingInBulk), payrollController.updateAttendanceTrackingInBulk)
router.post('/add-loans', validate(payrollValidation.addLoans), payrollController.addLoans);
router.get('/get-loans',payrollController.getLoans)
router.post('/add-earning', payrollController.addEarnings);
router.post('/add-deduction', payrollController.addDeductions);
router.put('/update-earning', payrollController.updateEarning)
router.put('/update-deductions', payrollController.updateDeductions)
router.get('/get-earning', payrollController.getEarnings);
router.get('/get-deduction', payrollController.getDeductions)
router.post('/add-tax-slabs', payrollController.addTaxSlabs)
router.post('/add-earning-type', validate(payrollValidation.addEarningTypes), payrollController.addEarningTypes);
router.get('/get-earning-type', payrollController.getEarningType);
router.get('/get-earning-type-by-id', payrollController.getEarningTypeById);
router.get('/get-all-earning-type', payrollController.getAllEarningType);
router.put('/update-earning-type',payrollController.updateEarningType);
router.post('/add-deductions-type', payrollController.addDeductionsType);
router.get('/get-deduction-type', payrollController.getDeductionsType);
router.get('/get-deduction-type-by-id', payrollController.getDeductionsTypeById);
router.put('/update-deduction-type', payrollController.updateDeductionType);
router.get('/get-all-deduction-type', payrollController.getAllDeductionType);
router.get('/get-all-earning', payrollController.getAllEarning)
router.get('/get-all-deduction', payrollController.getAllDeduction)

router.post('/generate-salary-template',validate(payrollValidation.generateSalaryTemplate), payrollController.generateSalaryTemplate);
router.post('/create-salary-template',validate(payrollValidation.createSalaryTemplate), payrollController.createSalaryTemplate);
router.get('/get-salary-template', validate(payrollValidation.getSalaryTemplate), payrollController.getSalaryTemplate);
router.get('/get-all-salary-template', validate(payrollValidation.getAllSalaryTemplate), payrollController.getAllSalaryTemplate);
router.get('/get-salary-template-by-id', validate(payrollValidation.getAllSalaryTemplate), payrollController.getAllSalaryTemplateById);
router.put('/update-salary-template', validate(payrollValidation.updateSalaryTemplate), payrollController.updateSalaryTemplate)
router.post('/calculate-ctc', validate(payrollValidation.calculateCtc), payrollController.calculateCtc)

router.post('/add-employee-salary', validate(payrollValidation.createEmployeeSalary), payrollController.addEmployeeSalary);
router.get('/get-employee-salary', validate(payrollValidation.getEmployeeSalary), payrollController.getEmployeeSalary);
router.get('/get-all-employee-salary', validate(payrollValidation.getAllSalaryTemplate), payrollController.getAllEmployeeSalary);
router.put('/update-employee-salary',validate(payrollValidation.createEmployeeSalary), payrollController.updateEmployeeSalary)
router.post('/get-all-employee-assign-status', payrollController.getAllEmployeeAssignStatus)
router.post('/add-pay-schedule', payrollController.addPaySchedule)
router.put('/update-pay-schedule', payrollController.updatePaySchedule)
router.get('/upcoming-payrolls', payrollController.upcomingPayrolls)
router.get('/pay-run-notification',payrollController.payRunNotification)
router.post('/add-pay-run', payrollController.calculateEmployeeSalary)
router.get('/get-pay-run', payrollController.getPayRun)
router.get('/get-pay-run-history', payrollController.getPayRunHistory);
router.post('/approve-payroll',validate(payrollValidation.approvePayroll), payrollController.approvePayroll);
router.get('/get-pay-run-Dashboard', payrollController.getPayRunDashboard)

router.post('/add-arrears', payrollController.addArrears);
router.get('/get-arrears', validate(payrollValidation.getArrears), payrollController.getArrears);

router.post('/add-tax-slab', validate(payrollValidation.addTaxSlab), payrollController.addTaxSlab);
router.put('/update-tax-slab', payrollController.updateTaxSlab);
router.get('/get-tax-slab',validate(payrollValidation.getTaxSlab), payrollController.getTaxSlab);
router.get('/get-all-tax-slab',payrollController.getAllTaxSlab);
router.delete('/delete-tax-slab',validate(payrollValidation.deleteTaxSlab),payrollController.deleteTaxSlab);

router.post('/add-employee-investment', payrollController.addEmployeeInvestment);
router.get('/get-employee-investment', payrollController.getEmployeeInvestment);
router.put('/update-employee-investment', payrollController.updateEmployeeInvestment);
router.delete('/delete-employee-investment', payrollController.deleteEmployeeInvestment)
router.post('/add-investment-category',validate(payrollValidation.addInvestmentCategory), payrollController.addInvestmentCategory);
router.get('/get-all-investment-category',validate(payrollValidation.getAllInvestmentCategory), payrollController.getAllInvestmentCategory);
router.get('/get-investment-category', payrollController.getInvestmentCategory);
router.put('/update-investment-category',validate(payrollValidation.updateInvestmentCategory), payrollController.updateInvestmentCategory);
router.delete('/delete-investment-category',validate(payrollValidation.deleteInvestmentCategory),payrollController.deleteInvestmentCategory);
router.post('/add-investment-sub-category',validate(payrollValidation.addInvestmentSubCategory), payrollController.addInvestmentSubCategory);
router.get('/get-investment-sub-category', payrollController.getInvestmentSubCategory)
router.get('/get-all-investment-sub-Category',validate(payrollValidation.getAllInvestmentSubCategory), payrollController.getAllInvestmentSubCategory);
router.put('/update-investment-sub-Category',validate(payrollValidation.updateInvestmentSubCategory), payrollController.updateInvestmentSubCategory);
router.delete('/delete-investment-sub-Category',validate(payrollValidation.deleteInvestmentSubCategory), payrollController.deleteInvestmentSubCategory);
router.get('/get-all-investment-category-details', payrollController.getAllCategoryDetails);

router.post('/apply-advance', payrollController.applyAdvance);
router.get('/get-advance-approval', payrollController.getAdvanceApproval);
router.get('/get-advance-request', payrollController.getAdvanceRequest);
router.post('/approval-reject-advance', payrollController.approvalRejectAdvance);

router.post('/employee-investment-proof',employeeInvestmentProof.single('file'), payrollController.employeeInvestmentProof);
router.get('/get-employee-investment-proof', payrollController.getEmployeeInvestmentProof);
router.put('/update-employee-investment-proof',payrollController.updateEmployeeInvestmentProof);
router.delete('/delete-employee-investment-proof',payrollController.deleteEmployeeInvestmentProof);
router.put('/comment-in-employee-investment-proof',payrollController.commentInEmployeeInvestmentProof);
router.get('/get-employee-monthly-salary', validate(payrollValidation.getEmployeeMonthlySalary), payrollController.getEmployeeMonthlySalary);
router.get('/generate-salary-slip', payrollController.generateSalarySlip)
router.get('/send-offer-letter',validate(payrollValidation.sendOfferLetter),payrollController.sendOfferLetter)


//check-rule-formula
router.post('/check-rule-formula',validate(payrollValidation.checkRuleFormula), payrollController.checkRuleFormula)


module.exports = router;