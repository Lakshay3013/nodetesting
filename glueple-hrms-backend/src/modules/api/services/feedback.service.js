
const feedbackTeamsSchema = require('../../../models/feedbackTeams.model')
const employeeFeedbackSchema = require('../../../models/employeeFeedback.model')
const httpStatus = require('http-status');
const ApiError = require('../../../helpers/ApiError');
const { getServiceResFormat, getAggregatePagination, getDb } = require('../utils/appHelper');
const employeeSchema = require('../../../models/employee.model')


const createFeedbackTeam = async (data) => {
  const res = getServiceResFormat();
  let db = getDb()
  const feedbackTeamsModel = feedbackTeamsSchema(db);
  const existData = await getAllFeedbackTeams({ name: data?.name }, {});
  if (existData && existData?.status) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name already exists.');
  }

  const createFeedbackTeam = await feedbackTeamsModel.create(data);
  if (createFeedbackTeam?.length) {
    res.data = createFeedbackTeam;
  } else {
    res.status = false;
  }
  return res;
};

const getAllFeedbackTeams = async (condition) => {
  const res = getServiceResFormat();
  let db = getDb()
  const feedbackTeamsModel = feedbackTeamsSchema(db);
  const queryRes = await feedbackTeamsModel.aggregate([
    { "$match": condition },
    {
      "$set":
      {
        label: "$name",
        value: "$_id",
      }
    },
  ]).allowDiskUse();
  if (queryRes && queryRes?.length) {
    res.data = queryRes;
  } else {
    res.status = false;
  }
  return res;
}

const createFeedback = async (data) => {
  const res = getServiceResFormat();
  let db = getDb()
  const employeeFeedback = employeeFeedbackSchema(db);
  const createFeedback = await employeeFeedback.create(data);
  if (createFeedback?.length) {
    res.data = createFeedback;
  } else {
    res.status = false;
  }
  return res;
};

const givenFeedback = async (condition) => {
  const res = getServiceResFormat();
  let db = getDb()
  const employeeFeedback = employeeFeedbackSchema(db);
  const queryRes = await employeeFeedback.aggregate([
    {
      $match: condition
    },
    {
      $lookup: {
        from: "employees",
        localField: "feedback_to",
        foreignField: "_id",
        as: "emp_info"
      }
    },
    {
      $unwind: {
        path: "$emp_info",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: "designations",
        localField: "emp_info.designation_id",
        foreignField: "_id",
        as: "designation_data"
      }
    },
    {
      $unwind: {
        path: "$designation_data",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: "departments",
        localField: "emp_info.department_id",
        foreignField: "_id",
        as: "department_data"
      }
    },
    {
      $unwind: {
        path: "$department_data",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $set: {
        designation_name: "$designation_data.name",
        department_name: "$department_data.name",
        name:"$emp_info.name",
      }
    },
    {
      $project: {
        _id: 1,
        name:1,
        feedback_team: 1,
        feedback_to: 1,
        feedback_title: 1,
        feedback_description: 1,
        feedback_rating: 1,
        feedback_type: 1,
        created_by: 1,
        type: 1,
        created_at: 1,
        updated_at: 1,
        team_name: 1,
        department_name: 1,
        designation_name: 1
      }
    }
  ]).allowDiskUse();
  if (queryRes && queryRes?.length) {
    res.data = queryRes;
  } else {
    res.status = false;
  }
  return res;
}

const getReceivedFeedbackOnFilter = async (options, filters) => {
  const res = getServiceResFormat();
  let db = getDb()
  const employeeFeedback = employeeFeedbackSchema(db);
  const queryRes = await employeeFeedback.aggregate([
    { "$match": filters },
    {
      $lookup: {
        from: "employees",
        localField: "feedback_to",
        foreignField: "_id",
        as: "emp_info"
      }
    },
    {
      $unwind: {
        path: "$emp_info",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: "designations",
        localField: "emp_info.designation_id",
        foreignField: "_id",
        as: "designation_data"
      }
    },
    {
      $unwind: {
        path: "$designation_data",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: "departments",
        localField: "emp_info.department_id",
        foreignField: "_id",
        as: "department_data"
      }
    },
    {
      $unwind: {
        path: "$department_data",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $set: {
        designation_name: "$designation_data.name",
        department_name: "$department_data.name",
        name:"$emp_info.name",
      }
    },
    {
      $project: {
        _id: 1,
        name:1,
        feedback_team: 1,
        feedback_to: 1,
        feedback_title: 1,
        feedback_description: 1,
        feedback_rating: 1,
        feedback_type: 1,
        created_by: 1,
        type: 1,
        created_at: 1,
        updated_at: 1,
        team_name: 1,
        department_name: 1,
        designation_name: 1
      }
    }
  ]).allowDiskUse();
  if (queryRes && queryRes?.length) {
    res.data = queryRes;
  } else {
    res.status = false;
  }
  return res;
}


const getFeedbackDashboardData = async (filters) => {
  const res = getServiceResFormat();
  let db = getDb()
  const employees = employeeSchema(db);
  const queryRes = await employees.aggregate([
    { "$match": filters },
    {
      $lookup: {
        from: "employee_feedbacks",
        localField: "_id",
        foreignField: "feedback_to",
        as: "received_feedbacks",
      },
    },
    {
      $lookup: {
        from: "employee_feedbacks",
        localField: "_id",
        foreignField: "created_by",
        as: "given_feedbacks",
      },
    },
    {
      $lookup: {
            from: "kudos_requests",
            localField:"_id",
           foreignField: "users",
            pipeline: [
                {
                    "$match": {
                        "status": "approved"
                    }
                }
            ],
            as: "received_kudos"
        }
    },
    {
      $lookup: {
        from: "kudos_requests",
        localField: "_id",
        foreignField: "created_by",
          pipeline: [
                {
                    "$match": { "status": "approved" }
                }
            ],
        as: "given_kudos",
      },
    },
    {
      $project: {
      _id: 0,  
        received_feedback: {$size: "$received_feedbacks" },  
        given_feedback: { $size: "$given_feedbacks" },  
        received_kudos: {$size: "$received_kudos"},
        given_kudos: {$size: "$given_kudos"},
      },
    },

  ]).allowDiskUse();
  if (queryRes && queryRes?.length) {
    res.data = queryRes;
  } else {
    res.status = false;
  }
  return res;
}

module.exports = {
  createFeedbackTeam,
  getAllFeedbackTeams,
  createFeedback,
  givenFeedback,
  getReceivedFeedbackOnFilter,
  getFeedbackDashboardData

};