const nodemailer = require('nodemailer');
const logger = require('../config/logger');
const { getIntegartionConfiguration } = require('../models/integrationConfig.model');
const { getCache } = require('./cacheHelper');
const {getDb} = require('../modules/api/utils/appHelper')
let mailConfig = {};

async function createTransport() {
    let mailData = {};
    let db = getDb()
    //queue_jobs handling research
    const cachedData = getCache(`email_configuration`);
    if (cachedData) {
        mailData = cachedData;
    } else {
        mailData = await getIntegartionConfiguration(db);
    }
    if (mailData && mailData?._id) {
        const transport = nodemailer.createTransport(mailData);
        mailConfig = mailData;
        await transport
            .verify()
            .then(() => logger.info('Connected to email server'))
            .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options'));
        return transport;
    }
}

const transport = createTransport();

const sendEmail = async (to, subject, text) => {
    const msg = { from: mailConfig.from, to, subject, text };
    await transport.sendMail(msg);
};

module.exports = {
    sendEmail,
};