const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const config = require('../../../config/config.js');
const { travelAndClaimService, approverService, approvalManagementService } = require('../services/index.js');
const { successResponse, errorResponse } = require('../../../helpers/index.js');
const { messages } = require('../../../config/constants.js');
const { getSessionData, getServiceResFormat } = require('../utils/appHelper.js');
const mongoose = require('mongoose');
const ApiError = require('../../../helpers/ApiError.js');
const { convertDateByMoment } = require('../utils/dateTimeHelper.js');



const addTravelType = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    req.body["created_by"] = user.id;
    const addTravel = await travelAndClaimService.addTravelType(req.body)
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, addTravel, httpStatus.OK);
})

const getTraveType = catchAsync(async (req, res) => {
    const getTravelType = await travelAndClaimService.getTraveType({}, req.query)
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getTravelType, httpStatus.OK);
})

const getAllTravelType = catchAsync(async (req, res) => {
    const getAllTravelType = await travelAndClaimService.getAllTravelType({});
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getAllTravelType, httpStatus.OK)
})

const updateTravelType = catchAsync(async (req, res) => {
    const updateTravelType = await travelAndClaimService.updateTravelType({ _id: mongoose.Types.ObjectId(req.body._id) }, req.body)
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, updateTravelType, httpStatus.OK);
})

const deleteTravelType = catchAsync(async (req, res) => {
    const deleteTravelType = await travelAndClaimService.deleteTravelType({ _id: mongoose.Types.ObjectId(req.body._id) });
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, deleteTravelType, httpStatus.OK);
})

const createTravelApplication = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    req.body["created_by"] = user.id
    req.body["employee_id"] = user.id
    req.body["date"] = convertDateByMoment();
    const getTravelHierarchy = await getHierarchy(user, 'travel')
    if (!getTravelHierarchy) {
        return errorResponse(req, res, messages.alert.HIERARCHY_ERR, httpStatus.BAD_REQUEST);
    }
    const createTravel = await travelAndClaimService.addTravel(req.body);
    if (createTravel?.status) {
        let createTravelData = createTravel?.data
        let approverData = {
            "type": "travel",
            "collection_id": createTravelData?._id || '',
            "approver_id": [],
        }
        getTravelHierarchy.forEach(async (data) => {
            let approverId = [];
            if (data?.id) {
                approverId = [mongoose.Types.ObjectId(data?.id)];
            } else {
                const getRoleData = await roleService.querySingleRoleData({ _id: data?.role_id });
                if (getRoleData.data?.short_name == 'manager' || getRoleData.data?.short_name == 'hod') {
                    let userData = await employeeService.queryUserByFilter({ "_id": mongoose.Types.ObjectId(user?.id) }, {});
                    if (userData?.status) {
                        data = userData?.data[0];
                    }
                    approverId = getRoleData.data?.short_name == 'manager' ? [mongoose.Types.ObjectId(data?.reported_to)] : [mongoose.Types.ObjectId(user?.hod_id)];
                } else {
                    let userData = await employeeService.queryUserByFilter({ "role_id": data?.role_id }, {});
                    if (userData?.status) {
                        data = userData?.data;
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
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, createTravel, httpStatus.OK);
})

const getTravelRequest = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    const { limit, page } = req.query
    const getData = await travelAndClaimService.getTravelRequest({ approver_id: user?.id, type: 'travel' }, { limit, page, })
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getData, httpStatus.OK);
});

const getTravelApproval = catchAsync(async (req, res) => {
    const user = getSessionData(req)
    const { limit, page } = req.query
    const getData = await travelAndClaimService.getTravelApproval({ approver_id: user?.id, type: "travel" }, { limit, page, })
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getData, httpStatus.OK);
})

const updateTravelApplication = catchAsync(async (req, res) => {
    const updateTravel = await travelAndClaimService.updateTravel({ _id: mongoose.Types.ObjectId(req.body._id) }, req.body);
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, updateTravel, httpStatus.OK);
})

const deleteTravel = catchAsync(async (req, res) => {
    const deleteTravel = await travelAndClaimService.deleteTravel({ _id: mongoose.Types.ObjectId(req.body._id) });
    const deleteApprove = await approverService.deleteApproverDataByCollectionId({ collection_id: mongoose.Types.ObjectId(req.body._id) })
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, deleteTravel, httpStatus.OK);
})

const travelRequestApproveReject = catchAsync(async (req, res) => {
    const { _id, comment, action_type } = req.body;
    const user = getSessionData(req);
    const approverData = await approverService.queryApproverData({ _id: _id, action_type: { $in: ['approve', 'reject'] } });
    if (approverData?.status) {
        return errorResponse(req, res, messages.alert.LEAVE_ACTION, httpStatus.BAD_REQUEST);
    }
    const approvalReject = await approverService.updateApproverData({ _id: _id }, {
        $set: {
            comment: comment || '',
            action_type: action_type,
            action_by: user?.id,
            action_date: new Date(),
        }
    });
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, approvalReject, httpStatus.OK);

})


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


const createTravelAndClaimRule = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    req.body["created_by"] = user.id
    const addTravelRule = await travelAndClaimService.createTravelAndClaimRule(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, addTravelRule, httpStatus.OK);
})

const getTravelAndClaimRule = catchAsync(async (req, res) => {
    const getData = await travelAndClaimService.getTravelAndClaimRule({}, req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getData, httpStatus.OK);

})

const updateTravelAndClaimRule = catchAsync(async (req, res) => {
    const updateTravelAndClaim = await travelAndClaimService.updateTravelAndClaimRule({ _id: mongoose.Types.ObjectId(req.body._id) }, req.body);
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, updateTravelAndClaim, httpStatus.OK);

})

const deleteTravelAndClaimRule = catchAsync(async (req, res) => {
    const deleteTravelRule = await travelAndClaimService.deleteTravelAndClaimRule({ _id: mongoose.Types.ObjectId(req.body._id) });
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, deleteTravelRule, httpStatus.OK);

})

const getAllTravelAndClaimRule = catchAsync(async (req, res) => {
    const getAllTravelRule = await travelAndClaimService.getAllTravelAndClaimRule({});
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getAllTravelRule, httpStatus.OK);
})

const assignRule = catchAsync(async(req, res)=>{
    const {_id, rule_details} = req.body;
    // const user = getSessionData(req);
    // let created_by = user.id
    const updateRule = await travelAndClaimService.travelAndClaimAssignRule(rule_details);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, updateRule, httpStatus.OK);
});

const getTravelTypeById = catchAsync(async (req, res) => {
    const response = getServiceResFormat();
    const getTravelType = await travelAndClaimService.getAllTravelType({ _id: mongoose.Types.ObjectId(req.query._id) });
    if (!getTravelType.status) {
        return errorResponse(req, res, messages.alert.TRAVEL_ID_NOT_FOUND, httpStatus.BAD_REQUEST);
    }
    let rule = getTravelType.data[0].travel_and_claim_rule;
    let travelRule = await travelAndClaimService.getAllTravelAndClaimRule({ _id: { $in: rule } });
    let travelRuleData = (!travelRule?.data?.length) ? [] : travelRule?.data?.map(item => item.id)
    response.data = travelRuleData
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK);
});

const createClaimRequest = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    req.body["employee_id"] = user.id

    const travelDetails = req.body.travel_details || []
    
    req.files.forEach((file) => {
        const match = file.fieldname.match(/\[(\d+)\]\[bill_image\]/);
        if (match) {
            const index = parseInt(match[1], 10);
            if (travelDetails[index]) {
                travelDetails[index].bill_image = file.filename;
            }
        }
    });
    
    let data = {
        employee_id:user.id,
        travel_id:req.body.travel_id,
        is_draft:req.body.is_draft,
        travel_details:travelDetails.map((detail) => ({
            ...detail,
            bill_image: detail.bill_image || null, 
        }))
    }

    const getTravelHierarchy = await getHierarchy(user, 'claim')
    if (!getTravelHierarchy) {
        return errorResponse(req, res, messages.alert.HIERARCHY_ERR, httpStatus.BAD_REQUEST);
    }
    const createClaim = await travelAndClaimService.createClaimApplication(data);
    if (createClaim?.status) {
        let createClaimData = createClaim?.data
        let approverData = {
            "type": "claim",
            "collection_id": createClaimData?._id || '',
            "approver_id": [],
        }
        getTravelHierarchy.forEach(async (data) => {
            let approverId = [];
            if (data?.id) {
                approverId = [mongoose.Types.ObjectId(data?.id)];
            } else {
                const getRoleData = await roleService.querySingleRoleData({ _id: data?.role_id });
                if (getRoleData.data?.short_name == 'manager' || getRoleData.data?.short_name == 'hod') {
                    let userData = await employeeService.queryUserByFilter({ "_id": mongoose.Types.ObjectId(user?.id) }, {});
                    if (userData?.status) {
                        data = userData?.data[0];
                    }
                    approverId = getRoleData.data?.short_name == 'manager' ? [mongoose.Types.ObjectId(data?.reported_to)] : [mongoose.Types.ObjectId(user?.hod_id)];
                } else {
                    let userData = await employeeService.queryUserByFilter({ "role_id": data?.role_id }, {});
                    if (userData?.status) {
                        data = userData?.data;
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
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, createClaim, httpStatus.OK);

})

const updateClaimRequest = catchAsync(async (req, res) => {
    const updateTravelAndClaim = await travelAndClaimService.updateClaimRequest({ _id: mongoose.Types.ObjectId(req.body._id) }, req.body);
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, updateTravelAndClaim, httpStatus.OK);
})

const deleteClaimRequest = catchAsync(async (req, res) => {
    const deleteTravelRule = await travelAndClaimService.deleteClaimRequest({ _id: mongoose.Types.ObjectId(req.body._id) });
    const deleteApprove = await approverService.deleteApproverDataByCollectionId({ collection_id: mongoose.Types.ObjectId(req.body._id) })
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, deleteTravelRule, httpStatus.OK);

})

const getClaimRequest = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    const { limit, page ,is_draft} = req.query
    const getData = await travelAndClaimService.getClaimRequest({ approver_id: user?.id, type: 'claim' ,is_draft : is_draft == 'true' ? true: false}, { limit, page, })
    getData?.data?.data?.map(item=>{
        item?.travel_details?.map(data =>{
            if(data?.bill_image){
                data.bill_image = `http://localhost:3001/travel_claim/${data?.bill_image}`
            }
        })
    })
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getData, httpStatus.OK);
})

const getClaimApproval = catchAsync(async (req, res) => {
    const user = getSessionData(req)
    const { limit, page } = req.query
    const getData = await travelAndClaimService.getClaimApproval({ approver_id: user?.id, type: "claim" }, { limit, page, })
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getData, httpStatus.OK);

});

const approveRejectClaimRequest = catchAsync(async (req, res) => {
    const { _id, comment, action_type } = req.body;
    const user = getSessionData(req);
    const approverData = await approverService.queryApproverData({ _id: _id, action_type: { $in: ['approve', 'reject'] } });
    if (approverData?.status) {
        return errorResponse(req, res, messages.alert.LEAVE_ACTION, httpStatus.BAD_REQUEST);
    }
    const approvalReject = await approverService.updateApproverData({ _id: _id }, {
        $set: {
            comment: comment || '',
            action_type: action_type,
            action_by: user?.id,
            action_date: new Date(),
        }
    });
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, approvalReject, httpStatus.OK);
})


const getAllTravelApprovalData = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    const getAllData = await travelAndClaimService.getAllTravelApprovalData({ employee_id: mongoose.Types.ObjectId(user?.id) });
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getAllData, httpStatus.OK);

})

const getAssignRule = catchAsync(async (req, res) => {
    const getAssignRule = await travelAndClaimService.getAssignRule({});
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getAssignRule, httpStatus.OK);
})





module.exports = {
    addTravelType,
    getTraveType,
    getAllTravelType,
    updateTravelType,
    deleteTravelType,
    createTravelApplication,
    getTravelRequest,
    getTravelApproval,
    updateTravelApplication,
    deleteTravel,
    travelRequestApproveReject,
    createTravelAndClaimRule,
    getTravelAndClaimRule,
    updateTravelAndClaimRule,
    deleteTravelAndClaimRule,
    getAllTravelAndClaimRule,
    assignRule,
    getTravelTypeById,
    createClaimRequest,
    updateClaimRequest,
    deleteClaimRequest,
    getClaimRequest,
    getClaimApproval,
    approveRejectClaimRequest,
    getAllTravelApprovalData,
    getAssignRule,

}