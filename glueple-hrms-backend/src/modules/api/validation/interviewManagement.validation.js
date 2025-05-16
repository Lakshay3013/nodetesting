const Joi = require('joi');

const createUpdateQuestions = {
    body: Joi.object().keys({
        _id: Joi.string().optional().allow("").label("_id"),
        interview_stage: Joi.string().required().label("Interview Stage"),
        question: Joi.string().required().label('Question'),
        input_type: Joi.string().required().label('Input Type'),
        selection_type: Joi.string().optional().allow("").label("Selection Type"),
        options: Joi.array().optional().allow("").label("Options"),
        is_active: Joi.boolean().optional().allow(0).label('Is Active'),
        is_required: Joi.boolean().optional().allow(0).label('Is Required'),
    }),
};

const getQuestionByStage = {
    query: Joi.object().keys({
        interview_stage: Joi.string().required().label("Interview Stage"),
        is_active: Joi.boolean().optional().allow("").label("Active"),
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
    }),
};

const getInterviewer = {
    query: Joi.object().keys({
        candidate_id: Joi.string().required().label("Candidate Id"),
        mrf_id: Joi.string().required().label("MRF Id"),
    })
};

const fillInterviewForm = {
    body: Joi.object().keys({
        _id: Joi.string().required().label("ID"),
        interview_status: Joi.string().required().label("Interview Status"),
        feedback_form: Joi.object().required().label("Feedback Form"),
    })
};

const assignInterview = {
    body: Joi.object().keys({
        candidate_id: Joi.string().required().label('Candidate ID'),
        interview_details: Joi.array().required().label('Interview Details'),
    })
};

const getAssignedInterview = {
    query: Joi.object().keys({
        query_type: Joi.string().required().label("Query Type"),
        interview_status: Joi.string().optional().label("Interview Status"),
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
    })
};

const getInterviewDetails = {
    query: Joi.object().keys({
        _id: Joi.string().required().label("ID"),
    })
};

module.exports = {
    createUpdateQuestions,
    getQuestionByStage,
    getInterviewer,
    fillInterviewForm,
    assignInterview,
    getAssignedInterview,
    getInterviewDetails,
};