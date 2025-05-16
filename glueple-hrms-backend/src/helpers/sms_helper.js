const smsModel = require('../models/sms_template');

async function getSmsTemplateDetails(name) {
    let templateData = await smsModel.findOne({name});
    return templateData;
}

async function sendSms(name){
    let templateData = await smsModel.findOne({ name });
    return templateData;
}

module.exports = {
    getSmsTemplateDetails,
    sendSms
}