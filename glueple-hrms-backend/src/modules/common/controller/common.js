const httpStatus = require('http-status');
const commonService = require('../services/service.js');
const { ObjectId } = require('mongodb');
const { successResponse, errorResponse } = require('../../../helpers');
const { validationMessage } = require('../../../config/constants.js');

const createSmsTemplate = async (req, res) => {
    try {
        let templateCreated = await commonService.createSmsTemplate(req.body);
        return successResponse(req, res, validationMessage.SUCCESS_GET_DATA, templateCreated, httpStatus.OK);
    } catch (error) {
        console.log(error);
        return errorResponse(req, res, validationMessage.SERVER_MSG, error);
    }
}

const updateTemplateStatus = async (req, res) => {
    try {
        const { status, template_id } = req.body;
        const updatedTemplate = await commonService.updateTemplateStatus(status, template_id);
        if (!updatedTemplate) {
            return errorResponse(req, res, validationMessage.SERVER_MSG, httpStatus.BAD_REQUEST);
        }
        return successResponse(req, res, validationMessage.SUCCESS_GET_DATA, updatedTemplate, httpStatus.OK);
    } catch (error) {
        console.log(error);
        return errorResponse(req, res, validationMessage.SERVER_MSG, error);
    }
}

module.exports = {
    createSmsTemplate,
    updateTemplateStatus
}