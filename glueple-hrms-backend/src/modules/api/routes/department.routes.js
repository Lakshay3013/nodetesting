const express = require('express');
const validate = require('../../../middlewares/validate');
const departmentValidation = require('../validation/department.validation');
const departmentController = require('../controller/department.controller');
const isAuthenticated = require('../../../middlewares/auth');
const checkPermission = require('../../../middlewares/webAuth');
const { getSubDepartment } = require('../services/department.service');

const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.post('/create-department', validate(departmentValidation.createDepartment), departmentController.createDepartment);
router.get('/get-departments', validate(departmentValidation.getDepartment), departmentController.getDepartment);
router.put('/update-department', validate(departmentValidation.updateDepartment), departmentController.updateDepartment);
router.delete('/delete-department', validate(departmentValidation.deleteDepartment), departmentController.deleteDepartment);
router.post('/assign-department-hod', validate(departmentValidation.assignDepartmentHod), departmentController.assignDepartmentHod);
router.get('/get-department-list', departmentController.getDepartmentDataList);

router.post('/create-sub-department', validate(departmentValidation.createSubDepartment), departmentController.createSubDepartment);
router.get('/get-sub-department',validate(departmentValidation.getSubDepartment), departmentController.getSubDepartment);
router.put('/update-sub-department',validate(departmentValidation.updateSubDepartment), departmentController.updateSubDepartment);
router.get('/get-all-sub-department', departmentController.getAllSubDepartment);
router.post('/create-project', validate(departmentValidation.createProject), departmentController.createProject);
router.get('/get-project',validate(departmentValidation.getProject), departmentController.getProject);
router.put('/update-project', validate(departmentValidation.updateProject),departmentController.updateProject);
router.get('/get-all-project', departmentController.getAllProject);
router.post('/create-skill',validate(departmentValidation.createSkill), departmentController.createSkill);
router.get('/get-skill',validate(departmentValidation.getSkill), departmentController.getSkill);
router.put('/update-skill',validate(departmentValidation.updateSkill), departmentController.updateSkill);
router.get('/get-all-skill', departmentController.getAllSkill)
router.post('/assign-project', validate(departmentValidation.assignProject), departmentController.assignProject);
router.get('/get-assign-project', validate(departmentValidation.getAssignProject), departmentController.getAssignProject);
router.post('/assign-skill', validate(departmentValidation.assignSkill), departmentController.assignSkill);
router.get('/get-assign-skill', validate(departmentValidation.getAssignSkill), departmentController.getAssignSkill);
router.get('/get-sub-department-by-department', validate(departmentValidation.getSubDepartmentByDepartment),departmentController.getSubDepartmentByDepartment)

module.exports = router;