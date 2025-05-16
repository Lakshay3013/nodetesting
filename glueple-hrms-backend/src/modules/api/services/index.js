const authService = require('./auth.service');
const departmentService = require('./department.service');
const employeeService = require('./employee.service');
const dropdownMastersService = require('./dropdownMasters.service');
const qualificationsService = require('./qualifications.service');
const mrfService = require('./mrf.service');
const permissionService = require('./permission.service');
const trainingCertificatesService = require('./trainingCertificates.service');
const designationService = require('./designation.service');
const positionService = require('./position.service');
const approvalManagementService = require('./approvalManagement.service');
const approverService = require('./approver.sevice');
const candidateService = require('./candidate.service');
const interviewManagementService = require('./interviewManagement.service');
const emailTemplateService = require('./emailTemplate.service')
const onboardingService = require('./onboarding.service');
const policyService = require('./policies.services');
const locationService = require('./location.service');
const otpService = require('./otp.service');
const leaveService = require('./leaves.service');
const shiftManagementService = require('./shiftManagement.service');
const attendanceService = require('./attendance.service');
const shortLeaveConfigurationService = require('./shortLeaveConfiguration.service');
const roleService = require('./role.service');
const branchService = require('./branches.service')
const holidayService = require('./holidays.service')
const payrollService = require('./payroll.service')
const kudosService =require('./kudos.service')
const communityService =require('./community.service')
const mediaFilesService =require('./mediaFiles.service')
const feedbackService =require('./feedback.service')
const clientService = require('./clients.service')
const performanceManagementService = require('./performanceManagement.service')
const travelAndClaimService = require('./travelAndClaim.service')
const financialYearService =require('./financialYear.service')
const dashBoardService = require("./dashBoard.service")
const taskManagementService = require('./taskManagement.service')
module.exports = {
    authService,
    departmentService,
    employeeService,
    dropdownMastersService,
    qualificationsService,
    mrfService,
    permissionService,
    trainingCertificatesService,
    designationService,
    positionService,
    approvalManagementService,
    approverService,
    candidateService,
    interviewManagementService,
    emailTemplateService,
    onboardingService,
    policyService,
    locationService,
    otpService,
    leaveService,
    shiftManagementService,
    attendanceService,
    shortLeaveConfigurationService,
    roleService,
    branchService,
    holidayService,
    payrollService,
    kudosService,
    communityService,
    mediaFilesService,
    feedbackService,
    clientService,
    performanceManagementService,
    travelAndClaimService,
    financialYearService,
    dashBoardService,
    taskManagementService
}