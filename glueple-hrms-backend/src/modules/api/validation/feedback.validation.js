const Joi = require('joi');

const createFeedbackTeam = {
    body: Joi.object().keys({
        name: Joi.string().required().label('Name'),
        emp_ids: Joi.array().required().label('Employee Ids'),
    }),
};


const createFeedback = {
    body: Joi.object().keys({
        type: Joi.string().required().label('Name'),
        feedback_team: Joi.string().optional().allow(null).label('Team'),
        feedback_to: Joi.array().optional().label('Recipient'),
        feedback_title: Joi.string().required().label('Feedback Title'),
        feedback_description: Joi.string().required().label('Feedback'),
        feedback_rating: Joi.number().optional().label('Feedback Rating'),
        feedback_type:Joi.string().optional().allow('').label('Feedback Type'),
    }),
};



module.exports = {
    createFeedbackTeam,
    createFeedback
};