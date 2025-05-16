const authRoutes = require('./auth.routes');
const departmentRoutes = require('./department.routes');
const dropdownMastersRoutes = require('./dropdownMasters.routes');
const qualificationsRoutes = require('./qualifications.routes');
const mrfRoutes = require('./mrf.routes');
const permissionRoutes = require('./permission.routes');
const trainingCertificatesRoutes = require('./trainingCertificates.routes');
const designationRoutes = require('./designation.routes');
const positionRoutes = require('./position.routes');
const approvalManagementRoutes = require('./approvalManagement.routes');
const candidateRoutes = require('./candidate.routes');
const interviewManagementRoutes = require('./interviewManagement.routes');
const emailTemplate = require('./emailTemplate.routes');
const onboardingRoutes = require('./onboarding.routes');
const policyRoutes = require('./policies.routes');
const employeeRoutes = require('./employee.routes');
const locationRoutes = require('./location.routes');
const leaveRoutes = require('./leave.routes');
const shiftManagementRoutes = require('./shiftManagement.routes');
const attendanceRoutes = require('./attendance.routes');
const shortLeaveConfigurationRoutes = require('./shortLeaveConfiguration.routes');
const commonRoutes = require('./common.routes');
const roleRoutes = require('./role.routes');
const branchRoutes = require('./branches.routes')
const holidayRoutes = require('./holidays.routes')
const payrollRoutes = require('./payroll.routes')
const kudosRoutes =require('./kudos.routes')
const communityRoutes =require('./community.routes')
const feedbackRoutes =require('./feedback.routes')
const clientRoutes = require('./clients.routes')
const performanceManagementRoutes = require('./performanceManagement.routes')
const travelAndClaimRouters = require('./travelAndClaim.routes')
const financialYear =require('./financialYear.routes')
const dashBoardRoutes = require('./dashBoard.routes')
const taskManagementRoutes = require('./taskManagement.routes')
module.exports = [
    authRoutes,
    departmentRoutes,
    dropdownMastersRoutes,
    qualificationsRoutes,
    mrfRoutes,
    permissionRoutes,
    trainingCertificatesRoutes,
    designationRoutes,
    positionRoutes,
    approvalManagementRoutes,
    candidateRoutes,
    interviewManagementRoutes,
    emailTemplate,
    onboardingRoutes,
    policyRoutes,
    employeeRoutes,
    locationRoutes,
    leaveRoutes,
    shiftManagementRoutes,
    attendanceRoutes,
    shortLeaveConfigurationRoutes,
    commonRoutes,
    roleRoutes,
    branchRoutes,
    holidayRoutes,
    payrollRoutes,
    kudosRoutes,
    communityRoutes,
    feedbackRoutes,
    clientRoutes,
    performanceManagementRoutes,
    travelAndClaimRouters,
    financialYear,
    dashBoardRoutes,
    taskManagementRoutes
];
