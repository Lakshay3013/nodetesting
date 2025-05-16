const Joi = require('joi');

const createCandidate = {
    body: Joi.object().keys({
        mrf_id: Joi.string().optional().allow("").label("MRF ID"),
        name: Joi.string().required().label("Name"),
        email: Joi.string().required().label("Email"),
        mobile: Joi.string().required().label("Mobile"),
        location: Joi.string().required().label("Location"),
        source: Joi.string().required().label("Source"),
        year_of_experience: Joi.string().required().label("Experience"),
        address: Joi.string().optional().allow("").label("Address"),
        pincode: Joi.string().optional().allow("").label("Pincode"),
        skills: Joi.array().optional().allow("").label("Skills")
    }),
};

const getAllCandidates = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
    }),
};

const getCandidatesByMRFId = {
    query: Joi.object().keys({
        mrf_id: Joi.string().required().label('MRF ID'),
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
    }),
};

const selectedCandidates = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
    }),
};

const updateCandidateDetails = {
    body: Joi.object().keys({
        _id: Joi.string().required().label("ID"),
        name: Joi.string().required().label("Name"),
        email: Joi.string().required().label("Email"),
        mobile: Joi.string().required().label("Mobile"),
        location: Joi.string().required().label("Location"),
    }),
};

const candidateDropout = {
    body: Joi.object().keys({
        _id: Joi.string().required().label("ID")
    }),
};

const sendCredentialsMail = {
    body: Joi.object().keys({
        _id: Joi.string().required().label("ID")
    }),
}

module.exports = {
    createCandidate,
    getAllCandidates,
    getCandidatesByMRFId,
    selectedCandidates,
    updateCandidateDetails,
    candidateDropout,
    sendCredentialsMail,
};