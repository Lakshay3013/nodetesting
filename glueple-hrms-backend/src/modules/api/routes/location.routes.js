const express = require('express');
const validate = require('../../../middlewares/validate');
const locationValidation = require('../validation/location.validation');
const locationController = require('../controller/location.controller');
const isAuthenticated = require('../../../middlewares/auth');
const checkPermission = require('../../../middlewares/webAuth');

const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.post('/create-location', validate(locationValidation.createLocation), locationController.createLocation);
router.put('/update-location', validate(locationValidation.updateLocation), locationController.updateLocation);
router.delete('/delete-location', validate(locationValidation.deleteLocation), locationController.deleteLocation);
router.get('/get-locations', validate(locationValidation.getAllLocations), locationController.getLocation);
router.get('/get-location-list', validate(locationValidation.getLocation), locationController.getLocationDataList);
router.post('/upload-data', locationController.uploadData);
router.get("/get-all-countries-list", locationController.getAllCountriesList);
router.post("/get-all-state-from-country-list", validate(locationValidation.getStatesListFromCountry), locationController.getAllStateFromCountryList);
router.post("/get-all-city-from-state", validate(locationValidation.getCityListFromState), locationController.getCityListFromState);
router.post("/add-employee-location", locationController.addAttendanceLocation);
router.get('/get-location', locationController.getAttendanceLocation);
router.post('/update-multiple-employee-location', locationController.updateMultipleEmployeeLocation);
router.get('/get-all-city', locationController.getAllCity);
router.get('/get-all-city-from-country', locationController.getAllCityFromCountry)
router.get('/get-location-by-let-log',locationController.getLocationByLetLog)

module.exports = router;