const express = require('express');
const holidayController = require('../controller/holidays.controller');
const holidayValidation = require('../validation/holidays.validation')
const isAuthenticated = require('../../../middlewares/auth');
const checkPermission = require('../../../middlewares/webAuth');
const validate = require('../../../middlewares/validate');
const { uploadHolidayData } = require('../../../middlewares/multer');


const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.post('/create-holidays', isAuthenticated, validate(holidayValidation.createHolidays), holidayController.createHolidays);
router.get('/get-holidays', isAuthenticated, holidayController.getHolidays);
router.put('/update-holiday', validate(holidayValidation.updateHoliday), holidayController.updateHoliday);
router.delete('/delete-holiday', validate(holidayValidation.deleteHoliday), holidayController.deleteHoliday);
router.post("/upload-holiday", uploadHolidayData.single("file"), holidayController.bulkUploadHoliday);
router.get('/download-sample', isAuthenticated, holidayController.downloadSample)

module.exports = router;