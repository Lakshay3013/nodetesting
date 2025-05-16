const postSchema = require('../../../models/post.model');
const postLikesSchema = require('../../../models/postLikes.model')
const postCommentSchema = require('../../../models/postComments.model')
const httpStatus = require('http-status');
const ApiError = require('../../../helpers/ApiError');
const { getServiceResFormat, getAggregatePagination, getDb } = require('../utils/appHelper');
const mongoose = require("mongoose")

/* Create Post */
const createPost = async (data) => {
  const res = getServiceResFormat();
  let db = getDb()
    const postModel = postSchema(db);
  const createPost = await postModel.create(data);
  if (createPost) {
    res.data = createPost;
  } else {
    res.status = false;
  }
  return res;
};
/* Update Post */
const updatePost = async (data) => {
  const res = getServiceResFormat();
   let db = getDb()
    const postModel = postSchema(db);
  const updatePost = await postModel.findOneAndUpdate(
    { _id: data?._id },
    { $set: { description: data?.description } }
  );
  if (updatePost) {
    res.data = updatePost;
  } else {
    res.status = false;
  }
  return res;
};

/* Create Post */
const deletePost = async (data) => {
  const res = getServiceResFormat();
   let db = getDb()
    const postModel = postSchema(db);
     const postLikeModel = postLikesSchema(db);
  const deletePost = await postModel.findOneAndDelete(data);
  await postLikeModel.deleteMany({ post_id: data?._id })
    const postCommentModel = postCommentSchema(db);
  await postCommentModel.deleteMany({ post_id: data?._id })
  if (deletePost) {
    res.data = deletePost;
  } else {
    res.status = false;
  }
  return res;
};

/* Get All Post */
const getAllPost = async (filter, options) => {
  const res = getServiceResFormat();
   let db = getDb()
    const postModel = postSchema(db);
  const records = await postModel.aggregate([
    { $match: filter },
  
    // Lookup media files
    {
      $lookup: {
        from: "media_files",
        localField: "_id",
        foreignField: "post_id",
        as: "media",
      },
    },
  
    // Lookup post likes
    {
      $lookup: {
        from: "post_likes",
        localField: "_id",
        foreignField: "post_id",
        as: "post_likes",
      },
    },
  
    // Lookup post comments
    {
      $lookup: {
        from: "post_comments",
        localField: "_id",
        foreignField: "post_id",
        as: "post_comments",
      },
    },
  
    // Lookup employee info
    {
      $lookup: {
        from: "employees",
        localField: "created_by",
        foreignField: "_id",
        as: "emp_info",
      },
    },
    { $unwind: { path: "$emp_info", preserveNullAndEmptyArrays: true } },
  
    // Lookup designation info
    {
      $lookup: {
        from: "designations",
        localField: "emp_info.designation_id",
        foreignField: "_id",
        as: "designation_data",
      },
    },
  
    // Lookup department info
    {
      $lookup: {
        from: "departments",
        localField: "emp_info.department_id",
        foreignField: "_id",
        as: "department_data",
      },
    },
  
    // Add derived fields
    {
      $set: {
        "emp_info.designation_name": {
          $arrayElemAt: ["$designation_data.name", 0],
        },
        "emp_info.department_name": {
          $arrayElemAt: ["$department_data.name", 0],
        },
        likes: { $size: "$post_likes" },
        comments: { $size: "$post_comments" },
        likes_ids: {
          $map: {
            input: "$post_likes",
            as: "like",
            in: "$$like.emp_id"
          }
        }
        
      },
    },
  
    // Group by post
    {
      $group: {
        _id: "$_id",
        type: { $first: "$type" },
        description: { $first: "$description" },
        created_at: { $first: "$created_at" },
        updated_at: { $first: "$updated_at" },
        created_by: { $first: "$created_by" },
        media: { $first: "$media" },
        emp_info: { $first: "$emp_info" }, 
        likes: { $first: "$likes" },
        comments: { $first: "$comments" },
        likes_ids: { $first: "$likes_ids" },
      },
    },
  
    // Final projection
    {
      $project: {
        media: 1,
        emp_info: {
          name: 1,
          emp_id: 1,
          email: 1,
          profile_photo: 1,
          designation_name: 1,
          department_name: 1,
        },
        type: 1,
        description: 1,
        created_at: 1,
        updated_at: 1,
        created_by: 1,
        likes: 1,
        comments: 1,
        likes_ids: 1,
      },
    },
  ]);
  
  if (records && records?.length) {
    res.data = records;
  } else {
    res.status = false;
  }
  return res;
};

/* Post Like */
const postLike = async (data) => {
  const res = getServiceResFormat();
  let postLikeData = ''
  let isDelete = false
   let db = getDb()
    const postLikeModel = postLikesSchema(db);
  let findExistingData = await postLikeModel.findOne({
    emp_id:  mongoose.Types.ObjectId(data?.emp_id),
    post_id: mongoose.Types.ObjectId(data?.post_id),
  });

  if (findExistingData) {
    postLikeData = await postLikeModel.deleteOne(data);
    isDelete = true

  } else {
    postLikeData = await postLikeModel.create(data);
  }
  if (postLikeData) {
    res.data = postLikeData;
    res.is_delete = isDelete
  } else {
    res.status = false;
  }
  return res;
};

/* get Likes By Post ID */
const getLikesByPostID = async (options, filter) => {
  const res = getServiceResFormat();
  let db = getDb()
    const postLikeModel = postLikesSchema(db);
  const records = await postLikeModel.aggregate([
    { "$match": filter },
    {
      $lookup: {
        from: "employees",
        localField: "emp_id",
        foreignField: "_id",
        as: "emp_info",
      },
    },
    {
      $unwind: {
        path: "$emp_info",
        preserveNullAndEmptyArrays: true,
      },
    },
    // Lookup designation details for employees
    {
      $lookup: {
        from: "designations",
        localField: "emp_info.designation_id",
        foreignField: "_id",
        as: "designation_data",
      },
    },
    // Lookup department details for employees
    {
      $lookup: {
        from: "departments",
        localField: "emp_info.department_id",
        foreignField: "_id",
        as: "department_data",
      },
    },

    // Add designation and department names to emp_info
    {
      $set: {
        "emp_info.designation_name": {
          $arrayElemAt: ["$designation_data.name", 0],
        },
        "emp_info.department_name": {
          $arrayElemAt: ["$department_data.name", 0],
        },
      },
    },
    {
      $group: {
        _id: "$post_id",
        emoji: { $first: "$emoji" },
        created_at: { $first: "$created_at" },
        updated_at: { $first: "$updated_at" },
        emp_info: { $push: "$emp_info" }
      }
    },
    {
      $project: {
        emp_info: {
          name: 1,
          emp_id: 1,
          email: 1,
          profile_photo: 1,
          designation_name: 1,
          department_name: 1,
        },
        emoji: 1,
        created_at: 1,
        updated_at: 1,
      },
    },
  ]);
  console.log(records, "records....")
  if (records) {
    res.data = records;
  } else {
    res.status = false;
  }
  return res;
};

/* Post Comment */
const postComment = async (data) => {
  const res = getServiceResFormat();
  let db = getDb()
    const postCommentModel = postCommentSchema(db);
  const createPost = await postCommentModel.create(data);
  if (createPost) {
    res.data = createPost;
  } else {
    res.status = false;
  }
  return res;
};

/* Get Comments By Id */
const getCommentsById = async (options, filter) => {
  const res = getServiceResFormat();
   let db = getDb()
    const postCommentModel = postCommentSchema(db);
  const records = await postCommentModel.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: "employees",
        localField: "emp_id",
        foreignField: "_id",
        as: "emp_info",
      },
    },
    {
      $unwind: {
        path: "$emp_info",
        preserveNullAndEmptyArrays: true,
      },
    },
    // Lookup designation details for employees
    {
      $lookup: {
        from: "designations",
        localField: "emp_info.designation_id",
        foreignField: "_id",
        as: "designation_data",
      },
    },
    // Lookup department details for employees
    {
      $lookup: {
        from: "departments",
        localField: "emp_info.department_id",
        foreignField: "_id",
        as: "department_data",
      },
    },
    // Add designation and department names to emp_info
    {
      $set: {
        "emp_info.designation_name": {
          $arrayElemAt: ["$designation_data.name", 0],
        },
        "emp_info.department_name": {
          $arrayElemAt: ["$department_data.name", 0],
        },
      },
    },

    {
      $project: {
        emp_info: {
          _id: 1,
          name: 1,
          email: 1,
          profile_photo: 1,
          designation_name: 1,
          department_name: 1,
        },
        post_id: 1,
        content: 1,
        created_at: 1,
        updated_at: 1,
      },
    },
  ])
  
  if (records) {
    res.data = records;
  } else {
    res.status = false;
  }
  return res;
};

/* Delete Comment */
const deleteComment = async (filter) => {
  const res = getServiceResFormat();
   let db = getDb()
    const postCommentModel = postCommentSchema(db);
  const deleteComment = await postCommentModel.findOneAndDelete(filter);
  if (deleteComment) {
    res.data = deleteComment;
  } else {
    res.status = false;
  }
  return res;
};


/* Update Post */
const updateComment = async (data) => {
  const res = getServiceResFormat();
   let db = getDb()
    const postCommentModel = postCommentSchema(db);
  const updatePost = await postCommentModel.findOneAndUpdate(
    { _id: data?._id },
    { $set: { content: data?.content } }
  );
  if (updatePost) {
    res.data = updatePost;
  } else {
    res.status = false;
  }
  return res;
};

const getPost = async (filter, options) => {
  const res = getServiceResFormat();
   let db = getDb()
    const postModel = postSchema(db);
  const totalRecords = await postModel.find(filter).count();
  options = getAggregatePagination(options, totalRecords);
  const records = await postModel.aggregate([
    { "$match": filter },
    {
      $lookup: {
        from: "media_files",
        localField: "_id",
        foreignField: "post_id",
        as: "media",
      },
    },
    {
      $lookup: {
        from: "post_likes",
        localField: "_id",
        foreignField: "post_id",
        as: "post_likes",
      },
    },
    {
      $lookup: {
        from: "post_comments",
        localField: "_id",
        foreignField: "post_id",
        as: "post_comments",
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "created_by",
        foreignField: "_id",
        as: "emp_info",
      },
    },
    // Unwind emp_info to process individual employee data
    {
      $unwind: {
        path: "$emp_info",
        preserveNullAndEmptyArrays: true,
      },
    },
    // Lookup designation details for employees
    {
      $lookup: {
        from: "designations",
        localField: "emp_info.designation_id",
        foreignField: "_id",
        as: "designation_data",
      },
    },
    // Lookup department details for employees
    {
      $lookup: {
        from: "departments",
        localField: "emp_info.department_id",
        foreignField: "_id",
        as: "department_data",
      },
    },

    // Add designation and department names to emp_info
    {
      $set: {
        "emp_info.designation_name": {
          $arrayElemAt: ["$designation_data.name", 0],
        },
        "emp_info.department_name": {
          $arrayElemAt: ["$department_data.name", 0],
        },
        "likes": { $size: "$post_likes" },
        "comments": { $size: "$post_comments" },
      },
    },
    // Group data by post ID, combining media and emp_info, and keeping other fields
    {
      $group: {
        _id: "$_id",
        type: { $first: "$type" },
        description: { $first: "$description" },
        created_at: { $first: "$created_at" },
        updated_at: { $first: "$updated_at" },
        created_by: { $first: "$created_by" },
        media: { $first: "$media" },
        emp_info: { $push: "$emp_info" },
        likes: { $first: "$likes" },
        comments: { $first: "$comments" },
      },
    },
    // Final projection to structure the output
    {
      $project: {
        media: 1,
        emp_info: {
          name: 1,
          emp_id: 1,
          email: 1,
          profile_photo: 1,
          designation_name: 1,
          department_name: 1,
        },
        type: 1,
        description: 1,
        created_at: 1,
        updated_at: 1,
        created_by: 1,
        likes: 1,
        comments: 1
      },
    },
    options?.skips,
    options?.limits

  ]);
  const queryRes = {
    recordsTotal: totalRecords,
    recordsFiltered: totalRecords,
    totalPages: options?.totalPages,
    data: records
}
if (queryRes && queryRes?.data?.length) {
  res.data = queryRes;
} else {
  res.status = false;
}
return res;
};



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