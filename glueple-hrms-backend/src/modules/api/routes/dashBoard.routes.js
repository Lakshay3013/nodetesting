const express = require('express');
const validate = require('../../../middlewares/validate');
const dashBoardValidation = require('../validation/dashBoard.validation');
const dashboardController = require('../controller/dashBoard.controller');
const isAuthenticated = require('../../../middlewares/auth');
const checkPermission = require('../../../middlewares/webAuth');

const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.get('/employee-request-pending', dashboardController.requestPending);
router.get('/employee-correction-count',dashboardController.employeeCorrectionCount);
router.get('/employee-weekly-attendance-trend',dashboardController.employeeWeeklyAttendanceTrend);
router.get('/employee-attendance-statistics',dashboardController.employeeAttendanceStatistics);
router.get('/employee-leaves-statistics',dashboardController.employeeLeavesStatistics);
router.get('/get-announcement-count', dashboardController.getAnnouncementCount);
router.post('/s3-update', dashboardController.s3)

module.exports = router;