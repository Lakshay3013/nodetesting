const httpStatus = require('http-status');
const moment = require('moment');
const catchAsync = require('../../../helpers/catchAsync.js');
const {
  mrfService,
  approvalManagementService,
  employeeService,
  approverService,
  interviewManagementService,
  roleService,
} = require('../services');
const { successResponse, errorResponse } = require('../../../helpers');
const { messages, autoIncrementId } = require('../../../config/constants.js');
const { getSessionData } = require('../utils/appHelper.js');
const mrfValidation = require('../validation/mrf.validation.js');
const { validateInController } = require('../utils/custom.validation.js');

const createUpdateMRF = catchAsync(async (req, res) => {
  const type = req.body.query_type;
  let mrfData = null;
  if (type == 'mrf_form') {
    req.body['step'] = 1;
    mrfData = await mrfFormData(req);
  } else if (type == 'jd') {
    req.body['step'] = 2;
    mrfData = await jdData(req);
  } else if (type == 'interviewer') {
    req.body['step'] = 3;
    mrfData = await interviewerData(req);
  } else {
    return errorResponse(req, res, messages.alert.MRF_TYPE_ERR, httpStatus.BAD_REQUEST);
  }
  if (mrfData?.status) {
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, mrfData, httpStatus.OK);
  } else {
    return errorResponse(req, res, messages.alert.SERVER_MSG, httpStatus.BAD_REQUEST);
  }
});

const mrfFormData = async (req) => {
  const user = getSessionData(req);
  if (req.body.type == 'vacancy') {
    validateInController(mrfValidation.addMRFVacancy, req);
  } else if (req.body.type == 'replacement') {
    validateInController(mrfValidation.addMRFReplacement, req);
  } else {
    return { status: false };
  }
  const maximumId = await mrfService.getLastData('auto_id');
  req.body['auto_id'] = maximumId?.status ? parseFloat(maximumId?.data?.auto_id) + 1 : autoIncrementId?.start;
  req.body['created_by'] = user?.id || '';
  const mrfData = await mrfService.mrfForm(req.body);
  return mrfData;
}

const jdData = async (req) => {
  validateInController(mrfValidation.addJobDescription, req);
  const mrfData = mrfService.mrfForm(req.body);
  return mrfData;
}

const interviewerData = async (req) => {
  let mrfData = '';
  validateInController(mrfValidation.addInterviewAuthority, req);
  let interviewData = req.body.interview_details || [];
  for (let i = 0; i < interviewData?.length; i++) {
    interviewData[i]['mrf_id'] = req.body.mrf_id;
    mrfData = interviewManagementService.addUpdateInterviewer(interviewData[i], req.body._id);
  }
  mrfData = await mrfService.mrfForm({ _id: req.body.mrf_id, step: req.body.step });
  return mrfData;
}

const submitDraftMRF = catchAsync(async (req, res) => {
  const { _id, query_type } = req.body;
  let mrfData = '';
  const user = getSessionData(req);
  const getExistMRFData = await mrfService.queryMRF({ _id: _id, is_submitted: true });
  if (getExistMRFData?.status) {
    return errorResponse(req, res, messages.alert.MRF_ALREADY_SUBMITTED, httpStatus.BAD_REQUEST);
  }
  if (query_type == 'draft') {
    mrfData = await mrfService.updateMRF({ _id: _id }, { $set: { "is_draft": true } });
  } else if (query_type == 'submit') {
    let approvalData = [];
    let getApprovalHierarchy = await approvalManagementService.querySingleHierarchy({ type: 'mrf', department_id: user?.department_id, designation_id: user?.designation_id, position_id: user?.position_id });
    if (getApprovalHierarchy?.status) {
      approvalData = getApprovalHierarchy?.data;
    } else {
      getApprovalHierarchy = await approvalManagementService.querySingleHierarchy({ type: 'mrf', department_id: user?.department_id, designation_id: user?.designation_id });
      if (getApprovalHierarchy?.status) {
        approvalData = getApprovalHierarchy?.data;
      } else {
        getApprovalHierarchy = await approvalManagementService.querySingleHierarchy({ type: 'mrf', department_id: user?.department_id });
        if (getApprovalHierarchy?.status) {
          approvalData = getApprovalHierarchy?.data;
        } else {
          getApprovalHierarchy = await approvalManagementService.querySingleHierarchy({ type: 'mrf', department_id: null });
          if (getApprovalHierarchy?.status) {
            approvalData = getApprovalHierarchy?.data;
          } else {
            return errorResponse(req, res, messages.alert.MRF_HIERARCHY_ERR, httpStatus.BAD_REQUEST);
          }
        }
      }
    }
    if (approvalData?.length) {
      mrfData = await mrfService.updateMRF({ _id: _id }, { $set: { "is_submitted": true, "is_draft": false, "step": 4 } });
      const approverData = {
        "type": "mrf",
        "collection_id": mrfData?.data?._id || '',
        "approver_id": [],
      }
      for (let i = 0; i < approvalData?.length; i++) {
        const data = approvalData[i];
        let approverId = [];
        if (data?.id) {
          approverId = [data?.id];
        } else {
          const getRoleData = await roleService.querySingleRoleData({ _id: data?.role_id });
          if (getRoleData.data?.short_name == 'manager' || getRoleData.data?.short_name == 'hod') {
            let userData = await employeeService.queryUserByFilter({ "_id": user?._id }, {});
            if (userData?.status) {
              userData = userData?.data[0];
            }
            approverId = getRoleData.data?.short_name == 'manager' ? [data?.reported_to, data?.reported_to1, data?.reported_to2] : [user?.hod_id];
          } else {
            let userData = await employeeService.queryUserByFilter({ "role_id": data?.role_id }, {});
            if (userData?.status) {
              userData = userData?.data;
              for(let i=0; i<userData?.length; i++){
                approverId.push(userData[i]?._id);
              }
            }
          }
        }
        if(approverId?.length){
          approverData["approver_id"] = approverId;
          await approverService.addApproverData(approverData);
        }
      }
    }
  } else {
    return errorResponse(req, res, messages.alert.MRF_TYPE_ERR, httpStatus.BAD_REQUEST);
  }
  if (mrfData?.status) {
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, mrfData, httpStatus.OK);
  } else {
    return errorResponse(req, res, messages.alert.SERVER_MSG, httpStatus.BAD_REQUEST);
  }
});

const getAllMRF = catchAsync(async (req, res) => {
  let filters = {};
  const { query_type, type, start_date, end_date, limit, page, applied_for, approval_status } = req.query;
  const user = getSessionData(req);
  if (query_type == 'user' && type) {
    filters['created_by'] = user?.id;
    filters['is_submitted'] = type == 'submit' ? true : false;
    if (applied_for) {
      filters['type'] = applied_for;
    }
    if (approval_status) {
      filters['approval_status'] = approval_status;
    }
    if (start_date && end_date) {
      filters['created_at'] = {
        $gte: new Date(start_date),
        $lte: new Date(end_date),
      }
    }
  };
  const mrfData = await mrfService.queryMRFData(filters, req.query);
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, mrfData, httpStatus.OK);
});

const getMRFById = catchAsync(async (req, res) => {
  const mrfData = await mrfService.queryMRFData(req.query, {});
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, mrfData, httpStatus.OK);
});

const approveRejectMRF = catchAsync(async (req, res) => {
  const { _id, comment, action_type } = req.body;
  const user = getSessionData(req);
  const approverData = await approverService.queryApproverData({ _id: _id, action_type: { $in: ['approve', 'reject'] } });
  if (approverData?.status) {
    return errorResponse(req, res, messages.alert.MRF_ACTION, httpStatus.BAD_REQUEST);
  }
  const mrfData = await approverService.updateApproverData({ _id: _id }, {
    $set: {
      comment: comment || '',
      action_type: action_type,
      action_by: user?.id,
      action_date: new Date(),
    }
  });
  return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, mrfData, httpStatus.OK);
});

const getMRFForApproval = catchAsync(async (req, res) => {
  const { action_type, start_date, end_date } = req.query;
  const user = getSessionData(req);
  let filters = {
    approver_id: user?.id,
    action_type: action_type,
    type: 'mrf'
  };
  if (start_date && end_date) {
    filters['created_at'] = {
      $gte: new Date(start_date),
      $lte: new Date(end_date),
    }
  };
  const mrfData = await approverService.queryApproverDataByFilter(filters, req.query);
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, mrfData, httpStatus.OK);
});

const assignMRFToRecruiter = catchAsync(async (req, res) => {
  const { _id, recruiter_id } = req.body;
  const user = getSessionData(req);
  const mrfData = await mrfService.updateMRF({ _id: _id }, {
    $set: {
      recruiter_id: recruiter_id || '',
      assigned_to_recruiter: 1,
      mrf_assigned_by: user?.id,
      mrf_assigned_at: new Date(),
    }
  });
  return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, mrfData, httpStatus.OK);
});

const changeMRFStatus = catchAsync(async (req, res) => {
  const { _id, mrf_status } = req.body;
  const mrfData = await mrfService.updateMRF({ _id: _id }, {
    $set: {
      mrf_status: mrf_status || '',
    }
  });
  return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, mrfData, httpStatus.OK);
});

const ijpReferral = catchAsync(async (req, res) => {
  const mrfData = await mrfService.updateMRF({ _id: req.body._id }, {
    $set: req.body
  });
  return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, mrfData, httpStatus.OK);
});

const getInterviewerList = catchAsync(async (req, res) => {
  const interviewerData = await employeeService.queryUserByFilter({ designation_id: req.query.designation_id, account_status: 'active' }, { value: "$_id", _id: 1, emp_id: 1, name: 1, email: 1, account_status: 1 });
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, interviewerData, httpStatus.OK);
});

const mrfDashboardAndHierarchy = catchAsync(async (req, res) => {
  const user = getSessionData(req);
  const submitCloseData = await mrfService.getMRFSubmitCloseCount({ created_by: user?.id });
  const pendingCloseData = await approverService.getApprovalPendingApprovedCount({ approver_id: { $in: [user?.id] } });
  let mrfData = {
    dashboard_count: {
      "mrf_submitted": 0,
      "mrf_completed": 0,
      "approval_pending": 0,
      "mrf_actioned": 0,
    },
    approval_hierarchy: [],
  };
  let approvalData = [];
  let getApprovalHierarchy = await approvalManagementService.querySingleHierarchy({ type: 'mrf', department_id: user?.department_id, designation_id: user?.designation_id, position_id: user?.position_id });
  if (getApprovalHierarchy?.status) {
    approvalData = getApprovalHierarchy?.data;
  } else {
    getApprovalHierarchy = await approvalManagementService.querySingleHierarchy({ type: 'mrf', department_id: user?.department_id, designation_id: user?.designation_id });
    if (getApprovalHierarchy?.status) {
      approvalData = getApprovalHierarchy?.data;
    } else {
      getApprovalHierarchy = await approvalManagementService.querySingleHierarchy({ type: 'mrf', department_id: user?.department_id });
      if (getApprovalHierarchy?.status) {
        approvalData = getApprovalHierarchy?.data;
      } else {
        getApprovalHierarchy = await approvalManagementService.querySingleHierarchy({ type: 'mrf', department_id: null });
        if (getApprovalHierarchy?.status) {
          approvalData = getApprovalHierarchy?.data;
        } else {
          return errorResponse(req, res, messages.alert.MRF_HIERARCHY_ERR, httpStatus.BAD_REQUEST);
        }
      }
    }
  }
  mrfData = {
    dashboard_count: { ...mrfData.dashboard_count, ...submitCloseData?.data, ...pendingCloseData?.data },
    approval_hierarchy: approvalData,
  };
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, mrfData, httpStatus.OK);
});

module.exports = {
  createUpdateMRF,
  submitDraftMRF,
  getAllMRF,
  getMRFById,
  approveRejectMRF,
  getMRFForApproval,
  assignMRFToRecruiter,
  changeMRFStatus,
  ijpReferral,
  getInterviewerList,
  mrfDashboardAndHierarchy,
};