const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const {
    kudosService,
    roleService,
    employeeService,
    approverService,
    approvalManagementService,
} = require('../services');
const { successResponse, errorResponse } = require('../../../helpers');
const { messages } = require('../../../config/constants.js');
const { getSessionData } = require('../utils/appHelper.js');
const { addInMomentDate, dateFormat } = require('../utils/dateTimeHelper.js');
const mongoose = require("mongoose")


const addKudosCategory = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    req.body['created_by'] = user?.id;
    const KudosCategoryData = await kudosService.addKudosCategory(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, KudosCategoryData, httpStatus.OK);
});


const getKudosCategory = catchAsync(async (req, res) => {
    const KudosCategoryData = await kudosService.getKudosCategory({ is_active: true }, req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, KudosCategoryData, httpStatus.OK);
});

const createKudosRequest = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    req.body['created_by'] = user?.id;
    req.body['action_to'] = user?.reported_to;
    req.body['expired_at'] = addInMomentDate('', 1, 'year', 'YYYY-MM-DD HH:mm:ss');


    const getTravelHierarchy = await getHierarchy(user, 'kudos')
    if (!getTravelHierarchy) {
        return errorResponse(req, res, messages.alert.HIERARCHY_ERR, httpStatus.BAD_REQUEST);
    }
    let createKudosRequest = await kudosService.createKudosRequest(req.body);
    let kudosRequest = createKudosRequest.data
    if (kudosRequest.length) {
        for (let i = 0; i < kudosRequest.length; i++) {
            let approverData = {
                "type": "kudos",
                "collection_id": kudosRequest[i]?._id || '',
                "approver_id": [],
            }
            getTravelHierarchy.forEach(async (data) => {
                let approverId = [];
                if (data?.id) {
                    approverId = [mongoose.Types.ObjectId(data?.id)];
                } else {
                    const getRoleData = await roleService.querySingleRoleData({ _id: data?.role_id });
                    if (getRoleData.data?.short_name == 'manager' || getRoleData.data?.short_name == 'hod') {
                        let getEmployee = await employeeService.queryUserByFilter({ "_id": mongoose.Types.ObjectId(user?.id) }, {});
                        if (getEmployee?.status) {
                            data = getEmployee?.data[0];
                        }
                        approverId = getRoleData.data?.short_name == 'manager' ? [mongoose.Types.ObjectId(data?.reported_to)] : [mongoose.Types.ObjectId(user?.hod_id)];
                    } else {
                        let getRole = await employeeService.queryUserByFilter({ "role_id": data?.role_id }, {});
                        if (getRole?.status) {
                            data = getRole?.data;
                            for (let j = 0; j < data?.length; j++) {
                                approverId.push(mongoose.Types.ObjectId(data[j]?._id));
                            }
                        }
                    }
                }
                if (approverId.length) {
                    approverData["approver_id"] = approverId;
                    await approverService.addApproverData(approverData)
                }
            })
        }
    }

    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, createKudosRequest, httpStatus.OK)
});

const getKudosRequest = catchAsync(async (req, res) => {
    const user = getSessionData(req);

    const { type, start_date, end_date } = req.query;
    let status = {}
    if (type === "approved_rejected") {
        status = { status: { $in: ["rejected", "approved"] } };
    } else if (type) {
        status = { status: { $in: [type] } };
    }
    let request_date = {};
    if (start_date || end_date) {
        request_date = {
            created_at: {
                $gte: dateFormat(start_date),
                $lte: dateFormat(end_date)
            }
        };
    }
    const filter = {
        ...status,
        ...request_date,
        ...(user?.createdById && { created_by: mongoose.Types.ObjectId(user.createdById) }),
        ...(user?.actionToId && { action_to: mongoose.Types.ObjectId(user.actionToId) }),
    };


    const KudosCategoryData = await kudosService.getKudosRequest(filter, req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, KudosCategoryData, httpStatus.OK);
});

const addKudosPointHistory = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    req.body['created_by'] = user?.id;
    const addKudosPointHistory = await kudosService.addKudosPointHistory(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, addKudosPointHistory, httpStatus.OK)
});

const getPointStatement = catchAsync(async (req, res) => {
    const { start_date, end_date } = req.query;
    const user = getSessionData(req);

    let request_date = {};
    if (start_date || end_date) {
        request_date = {
            created_at: {
                $gte: dateFormat(start_date),
                $lte: dateFormat(end_date)
            }
        };
    }
    const filter = {
        employee_id: mongoose.Types.ObjectId(user?.id),
        ...request_date
    }
    const KudosCategoryData = await kudosService.getPointStatement(filter, req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, KudosCategoryData, httpStatus.OK);
});

const getUserKudosOnType = catchAsync(async (req, res) => {
    const { type } = req.query;
    const user = getSessionData(req);
    let filter = {
        status: "approved"
    };
    if (type === "received") {
        filter["users"] = mongoose.Types.ObjectId(user?.id);
    } else if (type === "given") {
        filter["created_by"] = mongoose.Types.ObjectId(user?.id);
    }

    const getUserKudosOnTypeData = await kudosService.getUserKudosOnType(filter, req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getUserKudosOnTypeData, httpStatus.OK);
});

const getHierarchy = async (user, type) => {
    let approvalData = [];
    let getApprovalHierarchy = await approvalManagementService.querySingleHierarchy({ type: type, department_id: mongoose.Types.ObjectId(user?.department_id), designation_id: mongoose.Types.ObjectId(user?.designation_id), position_id: mongoose.Types.ObjectId(user?.position_id) });
    if (getApprovalHierarchy?.status) {
        approvalData = getApprovalHierarchy?.data;
    } else {
        getApprovalHierarchy = await approvalManagementService.querySingleHierarchy({ type: type, department_id: mongoose.Types.ObjectId(user?.department_id), designation_id: mongoose.Types.ObjectId(user?.designation_id) });
        if (getApprovalHierarchy?.status) {
            approvalData = getApprovalHierarchy?.data;
        } else {
            getApprovalHierarchy = await approvalManagementService.querySingleHierarchy({ type: type, department_id: mongoose.Types.ObjectId(user?.department_id) });
            if (getApprovalHierarchy?.status) {
                approvalData = getApprovalHierarchy?.data;
            } else {
                getApprovalHierarchy = await approvalManagementService.querySingleHierarchy({ type: type, department_id: null });
                if (getApprovalHierarchy?.status) {
                    approvalData = getApprovalHierarchy?.data;
                } else {
                    throw new ApiError(httpStatus.BAD_REQUEST, messages.alert.HIERARCHY_ERR);
                }
            }
        }
    }
    return approvalData
}


const approveRejectKudos = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    const { _id, comment, status } = req.body
    const updateOptions = { remark: comment, status: status, approved_by: mongoose.Types.ObjectId(user?.id) }
    let updateKudosRequest = await kudosService.updateKudosRequest({ _id: mongoose.Types.ObjectId(_id) }, updateOptions);
    if (status === "approved") {
        const {
            employee_id,
            category_value,
            approved_by
        } = updateKudosRequest?.data
        let kudosPointHistoryData = {
            employee_id: mongoose.Types.ObjectId(employee_id),
            kudos_id: mongoose.Types.ObjectId(_id),
            points: category_value,
            created_by: mongoose.Types.ObjectId(user?.id),
            type: "CR",
            action_type: "earned",
            approved_by:mongoose.Types.ObjectId(approved_by)
        }
        await kudosService.addKudosPointHistory(kudosPointHistoryData)
    }
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, updateKudosRequest, httpStatus.OK);
});



module.exports = {
    addKudosCategory,
    getKudosCategory,
    createKudosRequest,
    getKudosRequest,
    addKudosPointHistory,
    getPointStatement,
    getUserKudosOnType,
    approveRejectKudos
};