const express = require('express');
const validate = require('../../../middlewares/validate');
const dropdownMastersValidation = require('../validation/dropdownMasters.validation');
const dropdownMastersController = require('../controller/dropdownMasters.controller');
const isAuthenticated = require('../../../middlewares/auth');
const checkPermission = require('../../../middlewares/webAuth');

const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.post('/add-dropdown-data', validate(dropdownMastersValidation.saveDropdownData), dropdownMastersController.saveDropdownData);
router.post('/get-filtered-dropdown-data', validate(dropdownMastersValidation.getFilteredDropdownMaster), dropdownMastersController.getFilteredDropdownMastersData);
router.get('/get-dropdown-data', validate(dropdownMastersValidation.getDropdownMaster), dropdownMastersController.getDropdownMastersData);
router.delete('/delete-dropdown-data', validate(dropdownMastersValidation.deleteDropdownData), dropdownMastersController.deleteDropdownData);
router.get('/get-dropdown-masters-constant', dropdownMastersController.getDropdownMasterConstantData);
router.put('/update-dropdown-data', validate(dropdownMastersValidation.updateDropdownData), dropdownMastersController.updateDropdownData);

router.post('/add-master-dropdown-category', validate(dropdownMastersValidation.saveCategory), dropdownMastersController.saveCategory);
router.get('/get-master-dropdown-category', validate(dropdownMastersValidation.getMasterCategory), dropdownMastersController.getMasterCategory);
router.get('/get-all-master-dropdown-category',  dropdownMastersController.getAllMasterCategory);
router.put('/update-master-dropdown-category', validate(dropdownMastersValidation.updateMasterCategory), dropdownMastersController.updateMasterCategory);
router.delete('/delete-master-dropdown-category', validate(dropdownMastersValidation.deleteMasterCategory), dropdownMastersController.deleteMasterCategory);






//update use put, 
module.exports = router;