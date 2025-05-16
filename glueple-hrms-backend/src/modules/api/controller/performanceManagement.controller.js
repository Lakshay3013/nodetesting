const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const config = require('../../../config/config.js');
const {performanceManagementService, approverService, approvalManagementService, employeeService, financialYearService} = require('../services/index.js');
const { successResponse, errorResponse } = require('../../../helpers/index.js');
const { messages } = require('../../../config/constants.js');
const { getSessionData, getServiceResFormat, getFinancialMonth } = require('../utils/appHelper.js');
const mongoose = require('mongoose');
const ApiError = require('../../../helpers/ApiError.js');
const { convertDateByMoment } = require('../utils/dateTimeHelper.js');

const createKra = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    req.body["created_by"] = user?.id;
    const addKraDetails = await performanceManagementService.createKra(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, addKraDetails, httpStatus.OK);
})

const getKraDetails = catchAsync(async(req, res)=>{
    const getKra = await performanceManagementService.getKraDetails({}, req.query)
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getKra, httpStatus.OK);
})

const updateKraDetail = catchAsync(async(req,res)=>{
    const update = await performanceManagementService.updateKraDetails({_id:mongoose.Types.ObjectId(req.body._id)},req.body);
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, update, httpStatus.OK);
})

const deleteKraDetail = catchAsync(async(req, res)=>{
    const deleteKra = await performanceManagementService.deleteKraDetails({_id:mongoose.Types.ObjectId(req.body._id)});
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, deleteKra, httpStatus.OK)
})

const createKraParameter = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    req.body["created_by"] = user?.id;
    let totalWeightage
    const getParameter = await performanceManagementService.getAllKraParameterDetails({kra_id:mongoose.Types.ObjectId(req.body.kra_id)})
    if(getParameter.status){
    totalWeightage = getParameter?.data?.reduce((sum, item) => sum + item.parameter_weightage, 0);
    }
    const newWeight = parseInt(req.body.parameter_weightage) || 0;
    const existingWeight = parseInt(totalWeightage) || 0;
    const combinedWeight = newWeight + existingWeight;
    if(combinedWeight > 100){
        throw new ApiError(httpStatus.BAD_REQUEST, messages.alert.PARAMETER_WEIGHAGE_EXCEEDED);
    }else if(combinedWeight == 100){
        await performanceManagementService.updateKraDetails({_id:mongoose.Types.ObjectId(req.body.kra_id)},{kra_weightage_status:true});
    }
    const addDetails = await performanceManagementService.createKraParameter(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, addDetails, httpStatus.OK);
})

const getKraParameter = catchAsync(async(req, res)=>{
    const getKra = await performanceManagementService.getKraParameter({}, req.query)
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getKra, httpStatus.OK);
})

const updateKraParameter = catchAsync(async(req, res)=>{
    const update = await performanceManagementService.updateKraParameter({_id:mongoose.Types.ObjectId(req.body._id)},req.body);
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, update, httpStatus.OK);
})

const deleteKraParameter = catchAsync(async(req, res)=>{
    const deleteKra = await performanceManagementService.deleteKraParameter({_id:mongoose.Types.ObjectId(req.body._id)});
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, deleteKra, httpStatus.OK)
})

const createKPiDetails = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    req.body["created_by"] = user?.id;
    let totalWeightage
    const getParameter = await performanceManagementService.getAllKraParameterDetails({_id:mongoose.Types.ObjectId(req.body.parameter_id)})
    if(!getParameter.status){
        throw new ApiError(httpStatus.BAD_REQUEST, messages.alert.PARAMETER_NOT_FOUND);
    }
    const getSubParameter = await performanceManagementService.getAllKpiDetails({parameter_id:mongoose.Types.ObjectId(req.body.parameter_id)});
    if(getSubParameter.status){
        totalWeightage = getSubParameter?.data?.reduce((sum, item) => sum + item.kpi_weightage, 0);
    }
    const newWeight = parseInt(req.body.kpi_weightage) || 0;
    const existingWeight = parseInt(totalWeightage) || 0;
    const combinedWeight = newWeight + existingWeight;
    if(combinedWeight > getParameter?.data[0]?.parameter_weightage){
        throw new ApiError(httpStatus.BAD_REQUEST, messages.alert.SUB_PARAMETER_WEIGHAGE_EXCEEDED);
    }else if(combinedWeight == getParameter?.data[0]?.parameter_weightage){
        await performanceManagementService.updateKraParameter({_id:mongoose.Types.ObjectId(req.body.parameter_id)},{is_active:true});
    }
    const getAllParameter = await performanceManagementService.getAllKraParameterDetails({kra_id:mongoose.Types.ObjectId(getParameter.data[0].kra_id)})
    if(getAllParameter.status){
        const allActive = getAllParameter?.data.every(item => item.is_active === true);
        if(allActive){
            await performanceManagementService.updateKraDetails({_id:mongoose.Types.ObjectId(getParameter.data[0].kra_id)},{is_eligible_for_assign_status:true})
        }
    }
    const addDetails = await performanceManagementService.createKpiDetails(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, addDetails, httpStatus.OK);

})

const getKpiDetails = catchAsync(async(req, res)=>{
    const getKra = await performanceManagementService.getKpiDetails({}, req.query)
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getKra, httpStatus.OK);

})

const updateKpiDetail = catchAsync(async(req, res)=>{
    const update = await performanceManagementService.updateKpiDetail({_id:mongoose.Types.ObjectId(req.body._id)},req.body);
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, update, httpStatus.OK);

})

const deleteKpiDetail = catchAsync(async(req, res)=>{
    const deleteKra = await performanceManagementService.deleteKpiDetail({_id:mongoose.Types.ObjectId(req.body._id)});
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, deleteKra, httpStatus.OK)
})

const getAllKraDetails = catchAsync(async(req, res)=>{
    let filter = req.query._id ? {_id:mongoose.Types.ObjectId(req.query._id)} : {}
    const getKra = await performanceManagementService.getAllKraDetails(filter)
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getKra, httpStatus.OK);

});
const getAllKraParameterDetails = catchAsync(async(req, res)=>{
    let filter = req.query.kra_id ? {kra_id:mongoose.Types.ObjectId(req.query.kra_id)} : {}
    const getKra = await performanceManagementService.getAllKraParameterDetails(filter)
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getKra, httpStatus.OK);
    
})
const getAllKpiDetails = catchAsync(async(req, res)=>{
    let filter = req.query.parameter_id ? {parameter_id:mongoose.Types.ObjectId(req.query.parameter_id)} : {}
    const getKra = await performanceManagementService.getAllKpiDetails(filter)
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getKra, httpStatus.OK);
})


const createKraRatingTypeForDepartment = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    req.body["created_by"] = user?.id;
    const addDetails = await performanceManagementService.createKraRatingTypeForDepartment(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, addDetails, httpStatus.OK);

})

const getKraRatingTypeForDepartment = catchAsync(async(req, res)=>{
    const getKra = await performanceManagementService.getKraRatingTypeForDepartment({}, req.query)
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getKra, httpStatus.OK);

})

const updateKraRatingTypeDepartment = catchAsync(async(req, res)=>{
    const update = await performanceManagementService.updateKraRatingTypeDepartment({_id:mongoose.Types.ObjectId(req.body._id)},req.body);
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, update, httpStatus.OK);

})

const deleteKraRatingTypeForDepartment = catchAsync(async(req, res)=>{
    const deleteKra = await performanceManagementService.deleteKraRatingTypeForDepartment({_id:mongoose.Types.ObjectId(req.body._id)});
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, deleteKra, httpStatus.OK)
})

const getAllKraRatingTypeForDepartment = catchAsync(async(req, res)=>{
    const filter = req.query.function_id ? {function_id:mongoose.Types.ObjectId(req.query.function_id)} :{} 
    const getKra = await performanceManagementService.getAllKraRatingTypeForDepartment(filter)
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getKra, httpStatus.OK);

})

const createSelfRatingPermission = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    req.body["created_by"] = user?.id;
    const addDetails = await performanceManagementService.createSelfRatingPermission(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, addDetails, httpStatus.OK);

})

const getSelfRatingPermission = catchAsync(async(req, res)=>{
    const getKra = await performanceManagementService.getSelfRatingPermission({}, req.query)
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getKra, httpStatus.OK);

})

const updateSelfRatingPermission = catchAsync(async(req, res)=>{
    const update = await performanceManagementService.updateSelfRatingPermission({_id:mongoose.Types.ObjectId(req.body._id)},req.body);
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, update, httpStatus.OK);

})

const deleteSelfRatingPermission = catchAsync(async(req, res)=>{
    const deleteKra = await performanceManagementService.deleteSelfRatingPermission({_id:mongoose.Types.ObjectId(req.body._id)});
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, deleteKra, httpStatus.OK)
})

const getAllSelfRatingPermission = catchAsync(async(req, res)=>{
    const getKra = await performanceManagementService.getAllSelfRatingPermission(req.query)
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getKra, httpStatus.OK);

})

const assignKra = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    req.body["created_by"] = user?.id;
    let employee_ids = req.body.employee_ids
    const addDetails = await performanceManagementService.assignKra(req.body,employee_ids);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, addDetails, httpStatus.OK);

})

const getAssignKra = catchAsync(async(req, res)=>{
    const getKra = await performanceManagementService.getAssignKra({}, req.query)
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getKra, httpStatus.OK);

})

const updateAssignKra = catchAsync(async(req, res)=>{
    const update = await performanceManagementService.updateAssignKra({_id:mongoose.Types.ObjectId(req.body._id)},req.body);
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, update, httpStatus.OK);

})

const deleteAssignKra = catchAsync(async(req, res)=>{
    const deleteKra = await performanceManagementService.deleteAssignKra({_id:mongoose.Types.ObjectId(req.body._id)});
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, deleteKra, httpStatus.OK)
})

const getAllAssignKra = catchAsync(async(req, res)=>{
    let filter = req.query.parameter_id ? {kra_id:mongoose.Types.ObjectId(req.query.kra_id)} : {}
    const getKra = await performanceManagementService.getAllAssignKra(filter)
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getKra, httpStatus.OK);

});

const getEmployeeByKra = catchAsync(async(req, res)=>{
    let filter = req.query.reported_to ? {reported_to:mongoose.Types.ObjectId(req.query.reported_to)} : {}
    const getEmployee = await performanceManagementService.getEmployeeByKra(filter);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getEmployee, httpStatus.OK);
})

const getKraDetailsByEmployee = catchAsync(async(req, res)=>{
    const response = getServiceResFormat()
     const getAllEmp = await performanceManagementService.getKraDetailsByEmployee(req.query)
     response.data = getAllEmp.status ? getAllEmp?.data[0]?.kra_assign_details[0]?.kra_parameter_details :[]
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response,httpStatus.OK)
})

const giveRating = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    const {rating_remark} = req.body
    req.body["created_by"] = user.id
    if(rating_remark && rating_remark.length == 0){
        throw new ApiError(httpStatus.BAD_REQUEST, messages.alert.RATING_FIRST);
    }
    const giveRating = await performanceManagementService.giveRating(req.body,rating_remark);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, giveRating, httpStatus.OK);

})

const updateEmployeeRatingDuration = catchAsync(async (req, res) => {
    const { department_id, subDepartment_id, ratingDuration, employee_ids } = req.body;
    let updateData;
    if (!department_id) {
        const validEmployeeIds = (employee_ids || []).filter(id => id);
        updateData = await Promise.all(
            validEmployeeIds.map(id =>
                employeeService.updateUserByFilter(
                    { _id: mongoose.Types.ObjectId(id) },
                    { rating_duration: ratingDuration }
                )
            )
        );
    } else {
        const filter = {
            department_id: mongoose.Types.ObjectId(department_id),subDepartment_id: mongoose.Types.ObjectId(subDepartment_id)};
        updateData = await employeeService.updateUserByFilter(filter,{ rating_duration: ratingDuration });
    }

    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, updateData, httpStatus.OK);
});

const getGivenRating = catchAsync(async(req, res)=>{
    const response = getServiceResFormat();
    const {financial_id,employee_id,kra_id,rating_month} = req.query;
    const getRatingData = await performanceManagementService.getGivenRating({financial_id,employee_id,kra_id},rating_month)
    response.data = getRatingData.status ? getRatingData?.data[0]?.kra_assign_details[0]?.kra_parameter_details :[]
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA,response,httpStatus.OK)
})


const getRatingWiseEmployee = catchAsync(async(req, res)=>{
    const {financial_id} = req.query
    const getRating = await performanceManagementService.getRatingWiseEmployee({financial_id:mongoose.Types.ObjectId(financial_id)});
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getRating, httpStatus.OK)

})

const getAverageRating = catchAsync(async(req, res)=>{
    const {employee_id,financial_id} = req.query;
    const getFinancialYearList = await financialYearService.getFinancialYearList({_id:mongoose.Types.ObjectId(financial_id)})
    if(!getFinancialYearList.status){
      throw new ApiError(httpStatus.BAD_REQUEST, messages.alert.FINANCIAL_YEAR_NOT_FOUND);
    }
    const financialMonth = getFinancialMonth(getFinancialYearList.data[0].from,getFinancialYearList.data[0].to);
    console.log("Hello", financialMonth)
    const getRating = await performanceManagementService.getAverageRating({employee_id:mongoose.Types.ObjectId(employee_id),financial_id:mongoose.Types.ObjectId(financial_id)});
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getRating, httpStatus.OK)
})



module.exports ={
    createKra,
    getKraDetails,
    updateKraDetail,
    deleteKraDetail,
    createKraParameter,
    getKraParameter,
    updateKraParameter,
    deleteKraParameter,
    createKPiDetails,
    getKpiDetails,
    updateKpiDetail,
    deleteKpiDetail,
    assignKra,
    getAllKraDetails,
    getAllKraParameterDetails,
    getAllKpiDetails,
    createKraRatingTypeForDepartment,
    getKraRatingTypeForDepartment,
    updateKraRatingTypeDepartment,
    deleteKraRatingTypeForDepartment,
    getAllKraRatingTypeForDepartment,
    createSelfRatingPermission,
    getSelfRatingPermission,
    updateSelfRatingPermission,
    deleteSelfRatingPermission,
    getAllSelfRatingPermission,
    getAssignKra,
    updateAssignKra,
    deleteAssignKra,
    getAllAssignKra,
    getEmployeeByKra,
    giveRating,
    updateEmployeeRatingDuration,
    getKraDetailsByEmployee,
    getGivenRating,
    getRatingWiseEmployee,
    getAverageRating
}