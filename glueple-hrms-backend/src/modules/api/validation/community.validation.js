const Joi = require('joi');
const { query } = require('winston');

const createPost = {
    body: Joi.object().keys({
        description: Joi.string().optional().label('Description'),
    }),
};

const deletePost = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('ID'),
    }),
};

const getAllPost = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),

    }),
};
const getLikesById = {
    query: Joi.object().keys({
        post_id: Joi.string().required().label('Post id'),
    }),
};

const postComment = {
    body: Joi.object().keys({
        post_id: Joi.string().required().label('Post id'),
        content: Joi.string().required().label('Content'),
    }),
};

const getCommentsById = {
    query: Joi.object().keys({
        post_id: Joi.string().required().label('Post id'),
    }),
};

const deleteComment = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('Comment id'),
    }),
};

const updateComment = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('Comment id'),
        content: Joi.string().required().label('Content'),
    }),
};

const getPost = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
        type:Joi.string().optional().allow("").label("Status")

    }),
}
module.exports = {
    createPost,
    getAllPost,
    deletePost,
    getLikesById,
    postComment,
    getCommentsById,
    deleteComment,
    updateComment,
    getPost

};