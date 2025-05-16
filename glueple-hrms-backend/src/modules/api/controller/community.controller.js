const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const {
    communityService,
    mediaFilesService
} = require('../services');
const { successResponse, errorResponse } = require('../../../helpers');
const { messages } = require('../../../config/constants.js');
const { getSessionData } = require('../utils/appHelper.js');
const mongoose = require("mongoose")

/* Create Post */
const createPost = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    req.body['created_by'] = user?.id;
    const files = req.files
    const createPostData = await communityService.createPost(req.body);
    if (!files || !files.length) {
        if (createPostData?.data?._id && files?.length > 0) {
            const addFiles = files.map(({ filename, mimetype, size }) => ({
                post_id: createPostData.data._id,
                file_name: filename,
                mime_type: mimetype,
                size,
            }));
    
            await mediaFilesService.mediaFiles(addFiles);
        }
    }
   

    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, httpStatus.OK);
});

/* Update Post */
const updatePost = catchAsync(async (req, res) => {
    const updatePostData = await communityService.updatePost(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, httpStatus.OK);
});

/* Delete Post */
const deletePost = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    req.body['created_by'] = user?.id;
    const deletePostData = await communityService.deletePost(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, deletePostData, httpStatus.OK);

});

/* Get All Post */
const getAllPost = catchAsync(async (req, res) => {
    const getAllPostData = await communityService.getAllPost({}, req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getAllPostData, httpStatus.OK);
});

/* Post Like */
const postLike = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    req.body['emp_id'] = user?.id;

    const postLikeData = await communityService.postLike(req.body);
    return successResponse(req, res, postLikeData?.is_delete ? messages.alert.POST_DISLIKE : messages.alert.POST_LIKE, httpStatus.OK);
});

/* Get Likes By Post ID */
const getLikesByPostID = catchAsync(async (req, res) => {
    const { post_id } = req.query
    const filter = {
        post_id: mongoose.Types.ObjectId(post_id)
    }
    const likesByPostIdData = await communityService.getLikesByPostID({}, filter);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, likesByPostIdData, httpStatus.OK);
});

/* Post Comment */
const postComment = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    req.body['emp_id'] = user?.id;

    const postCommentData = await communityService.postComment(req.body);
    return successResponse(req, res, messages.alert.POST_COMMENT, httpStatus.OK);
});

/* Get Comments By Id */
const getCommentsById = catchAsync(async (req, res) => {
    const { post_id } = req.query
    const filter = {
        post_id: mongoose.Types.ObjectId(post_id)
    }
    const commentsByIdData = await communityService.getCommentsById({}, filter);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, commentsByIdData, httpStatus.OK);
});

/* Get Comments By Id */
const deleteComment = catchAsync(async (req, res) => {
    const {_id } = req.body
    const commentsByIdData = await communityService.deleteComment({_id});
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, commentsByIdData, httpStatus.OK);
});

/* Update Comment */
const updateComment = catchAsync(async (req, res) => {
    const updatePostData = await communityService.updateComment(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, httpStatus.OK);
});

const getPost = catchAsync(async(req, res)=>{
    const getPost = await communityService.getPost({type:req.query.type},req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getPost, httpStatus.OK);
})

const announcementsCount =catchAsync(async(req, res)=>{
    // const get 
})
module.exports = {
    createPost,
    updatePost,
    deletePost,
    getAllPost,
    postLike,
    getLikesByPostID,
    postComment,
    getCommentsById,
    deleteComment,
    updateComment,
    getPost
};