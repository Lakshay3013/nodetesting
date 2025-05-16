const express = require('express');
const validate = require('../../../middlewares/validate');
const taskManagementValidation = require('../validation/taskManagement.validation');
const taskManagementController = require('../controller/taskManagement.controller');
const isAuthenticated = require('../../../middlewares/auth');
const checkPermission = require('../../../middlewares/webAuth');

const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.post('/add-project-type', validate(taskManagementValidation.addProjectType), taskManagementController.addProjectType);
router.get('/get-project-type', validate(taskManagementValidation.getProjectType), taskManagementController.getProjectType);
router.get('/get-all-project-type', taskManagementController.getAllProjectType);
router.put('/update-project-type', validate(taskManagementValidation.updateProjectType), taskManagementController.updateProjectType);
router.delete('/delete-project-type', validate(taskManagementValidation.deleteProjectType), taskManagementController.addProjectType);

router.post('/add-project', taskManagementController.createProject);
router.get('/get-project', taskManagementController.getProject);
router.get('/get-all-project', taskManagementController.getAllProject);
router.put('/update-project', taskManagementController.updateProject);
router.delete('/delete-project', taskManagementController.deleteProject);

router.post('/add-task',taskManagementController.addTask);
router.get('/get-task',taskManagementController.getTask);
router.get('/get-all-task', taskManagementController.getAllTask);
router.put('/update-task', taskManagementController.updateTask);
router.delete('/delete-task', taskManagementController.deleteTask);


module.exports = router;