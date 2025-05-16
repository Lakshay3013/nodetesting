const smsTemplateModel = require('../models/sms_template');
const ApiError = require('../../../helpers/ApiError');
const { ObjectId } = require('mongodb')

const createSmsTemplate = async (body) => {
    let insertedObj = await smsTemplateModel.create({
        ...body
    })
    return insertedObj;
}

const updateTemplateStatus = async (status, templateId) => {
    const updatedDoc = await smsTemplateModel.findOneAndUpdate({ _id: new ObjectId(templateId) }, { $set: { status } }, { new: true });
    return updatedDoc
}

module.exports = {
    createSmsTemplate,
    updateTemplateStatus
}