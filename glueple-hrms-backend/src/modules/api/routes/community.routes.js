const express = require('express');
const validate = require('../../../middlewares/validate');
const communityValidation = require('../validation/community.validation');
const communityController = require('../controller/community.controller');
const isAuthenticated = require('../../../middlewares/auth');
const checkPermission = require('../../../middlewares/webAuth');
const {uploadPostsFiles  } = require('../../../middlewares/multer');
const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.post('/create-post',uploadPostsFiles.array('file'), communityController.createPost);
router.put('/update-post',uploadPostsFiles.array('file'), communityController.updatePost);
router.delete('/delete-post', validate(communityValidation.deletePost),communityController.deletePost);
router.get('/get-all-post', validate(communityValidation.getAllPost), communityController.getAllPost);
router.post('/post-like', communityController.postLike);
router.get('/get-likes-by-id',validate(communityValidation.getLikesById), communityController.getLikesByPostID);
router.post('/post-comment',validate(communityValidation.postComment), communityController.postComment);
router.get('/get-comments-By-id',validate(communityValidation.getCommentsById), communityController.getCommentsById);
router.delete('/delete-comment',validate(communityValidation.deleteComment), communityController.deleteComment);
router.put('/update-comment',validate(communityValidation.updateComment), communityController.updateComment);
router.get('/get-post', validate(communityValidation.getPost),communityController.getPost)
module.exports = router;