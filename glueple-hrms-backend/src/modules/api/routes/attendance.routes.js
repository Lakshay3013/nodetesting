const express = require('express');
const validate = require('../../../middlewares/validate');
const attendanceValidation = require('../validation/attendance.validation');
const attendanceController = require('../controller/attendance.controller');
const isAuthenticated = require('../../../middlewares/auth');
const { uploadAttendanceImage } = require('../../../middlewares/multer');
const checkPermission = require('../../../middlewares/webAuth');

const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.post("/check-in-check-out", uploadAttendanceImage.single("file"), validate(attendanceValidation.checkInCheckOut), attendanceController.checkInCheckOut);
router.post("/calculate-attendance", validate(attendanceValidation.calculatedAttendance), attendanceController.calculateAttendance);
router.get('/get-check-in-check-out',attendanceController.getCheckInCheckOut )
router.get('/get-attendance-summary', attendanceController.getAttendanceSummary)
router.post('/upload-attendance-logs', attendanceController.uploadAttendanceLogs);
router.get('/get-monthly-attendance',attendanceController.getMonthlyAttendance)
router.get('/get-attendance-dashboard', attendanceController.getAttendanceDashboard)

router.post('/apply-attendance-correction', validate(attendanceValidation.applyAttendanceCorrection),attendanceController.applyAttendanceCorrection)
router.get('/get-attendance-correction-request', attendanceController.getAttendanceCorrectionRequest)
router.get('/get-attendance-correction-approval', attendanceController.getAttendanceCorrectionApproval)
router.post('/approve-reject-attendance-correction', attendanceController.approveRejectAttendanceCorrection)
router.post('/update-attendance-log', attendanceController.updateAttendanceLog)
router.get('/get-attendance-logs', attendanceController.getAttendanceLogs)
router.get('/self-attendance',validate(attendanceValidation.getSelfAttendance), attendanceController.getSelfAttendance)
router.get('/my-team-attendance',  attendanceController.getMyTeamAttendance)
router.get('/all-team-attendance', attendanceController.getAllTeamAttendance)
router.post('/attendance-report', attendanceController.attendanceReport)
router.get('/get-comp-Off', attendanceController.getCompOffApproval)
router.post('/approve-reject-comp-off', attendanceController.approveRejectCompOff)
router.post('/apply-tour', validate(attendanceValidation.applyTours), attendanceController.applyTours);
router.get('/get-tours', attendanceController.getTours)
router.post('/approve-reject-tours',attendanceController.approveRejectTours)
router.get('/get-correction-notification', attendanceController.getCorrectionNotification)
router.post('/attendance-lock',validate(attendanceValidation.attendanceLock), attendanceController.attendanceLock)
router.get('/get-attendance-lock', validate(attendanceValidation.getAttendanceLock), attendanceController.getAttendanceLock);
router.put('/update-attendance-lock', validate(attendanceValidation.updateAttendanceLock), attendanceController.updateAttendanceLock)



module.exports = router;