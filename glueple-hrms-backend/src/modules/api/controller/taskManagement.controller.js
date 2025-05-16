const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const config = require('../../../config/config.js');
const { taskManagementService } = require('../services/index.js');
const { successResponse, errorResponse } = require('../../../helpers/index.js');
const { messages } = require('../../../config/constants.js');
const { getSessionData } = require('../utils/appHelper.js');
const mongoose = require('mongoose')


const addProjectType = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    req.body["created_by"] = user.id;
    const addProjectType = await taskManagementService.addProjectType(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, addProjectType, httpStatus.OK)

})

const getProjectType = catchAsync(async (req, res) => {
    const getProjectType = await taskManagementService.getProjectType({}, req.query)
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getProjectType, httpStatus.OK);
})

const updateProjectType = catchAsync(async (req, res) => {
    const updateProjectType = await taskManagementService.updateProjectType({ _id: mongoose.Types.ObjectId(req.body._id) }, req.body)
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, updateProjectType, httpStatus.OK);

})

const deleteProjectType = catchAsync(async (req, res) => {
    const deleteProjectType = await taskManagementService.deleteProjectType({ _id: mongoose.Types.ObjectId(req.body._id) });
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, deleteProjectType, httpStatus.OK);

})

const getAllProjectType = catchAsync(async (req, res) => {
    const getAllProjectType = await taskManagementService.getAllProjectType({});
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getAllProjectType, httpStatus.OK)
});

const createProject = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    req.body["created_by"] = user.id;
    const createProject = await taskManagementService.createProject(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, createProject, httpStatus.OK)
});

const getProject = catchAsync(async(req, res)=>{
     const getProject = await taskManagementService.getProject({}, req.query)
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getProject, httpStatus.OK);
});

const getAllProject = catchAsync(async(req, res)=>{
     const getAllProject = await taskManagementService.getAllProject({});
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getAllProject, httpStatus.OK)

});

const updateProject = catchAsync(async(req, res)=>{
    const updateProject = await taskManagementService.updateProject({ _id: mongoose.Types.ObjectId(req.body._id) }, req.body)
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, updateProject, httpStatus.OK);
});

const deleteProject = catchAsync(async(req, res)=>{
    const deleteProject = await taskManagementService.deleteProject({ _id: mongoose.Types.ObjectId(req.body._id) });
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, deleteProject, httpStatus.OK);
});

const addTask = catchAsync(async(req,res)=>{
    const user = getSessionData(req);
    req.body["created_by"] = user.id;
    const createTask = await taskManagementService.addTask(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, createTask, httpStatus.OK)
});

const getTask = catchAsync(async(req, res)=>{
    const getTask = await taskManagementService.getTask({}, req.query)
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getTask, httpStatus.OK);
});

const getAllTask = catchAsync(async(req, res)=>{
    const getAllTask = await taskManagementService.getAllTask({});
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getAllTask, httpStatus.OK)
});

const updateTask = catchAsync(async(req, res)=>{
    const updateTask = await taskManagementService.updateTask({ _id: mongoose.Types.ObjectId(req.body._id) }, req.body)
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, updateTask, httpStatus.OK);
});

const deleteTask = catchAsync(async(req, res)=>{
    const deleteTask = await taskManagementService.deleteTask({ _id: mongoose.Types.ObjectId(req.body._id) });
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, deleteTask, httpStatus.OK);
});

const saveTimeTracking = catchAsync(async(req, res)=>{
    const user = getSessionData(req)
    req.body["created_by"] = user.id;
    const timeTracking = await taskManagementService.addTaskHistory(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, timeTracking, httpStatus.OK);
})




module.exports = {
    addProjectType,
    getProjectType,
    updateProjectType,
    deleteProjectType,
    getAllProjectType,
    createProject,
    getProject,
    getAllProject,
    updateProject,
    deleteProject,
    addTask,
    getTask,
    getAllTask,
    updateTask,
    deleteTask,
    saveTimeTracking
}