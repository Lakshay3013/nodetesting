const express = require('express');
const branchController = require('../controller/branches.controller');
const branchValidation = require('../validation/branches.validation')
const isAuthenticated = require('../../../middlewares/auth');
const checkPermission = require('../../../middlewares/webAuth');
const req = require('express/lib/request');
const validate = require('../../../middlewares/validate');

const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.post('/get-branch-list', validate(branchValidation.getBranchListFromCity), branchController.getAllBranches);

module.exports = router;