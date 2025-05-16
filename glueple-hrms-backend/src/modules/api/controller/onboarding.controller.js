const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const { onboardingService, employeeService, roleService } = require('../services');
const { successResponse, errorResponse } = require('../../../helpers');
const { messages } = require('../../../config/constants.js');
const { getSessionData } = require('../utils/appHelper.js');
const { validateInController } = require('../utils/custom.validation.js');
const onboardingValidation = require('../validation/onboarding.validation.js');
const  mongoose = require('mongoose');

const createOnboardingStep = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    req.body['created_by'] = user?.id;
    const onboardingStepData = await onboardingService.createOnboardingStep(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, onboardingStepData, httpStatus.OK);
});

const getOnboardingStep = catchAsync(async (req, res) => {
    const {view_profile} =req.query
    // const filter = Object.hasOwn(req.query, 'is_active') ? { is_active: req.query.is_active } : {};
    let filter ={is_active: true}
    if(view_profile){
        filter["view_profile"]=view_profile
    }
    const onboardingStepData = await onboardingService.queryOnboardingStep(filter, req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, onboardingStepData, httpStatus.OK);
});

const createOnboardingStepFields = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    req.body['created_by'] = user?.id;
    const onboardingStepFieldData = await onboardingService.createOnboardingStepFields(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, onboardingStepFieldData, httpStatus.OK);
});

const getOnboardingStepFields = catchAsync(async (req, res) => {
    const filter = Object.hasOwn(req.query, 'is_active') ? { step_id: req.query.step_id, is_active: req.query.is_active } : { step_id: req.query.step_id };
    const onboardingStepFieldData = await onboardingService.queryOnboardingStepFields(filter, req.query);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, onboardingStepFieldData, httpStatus.OK);
});

const saveOnboardingDetails = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    const {query_type, user_id} = req.body;
    req.body['user_id'] = user_id ? user_id : user?.id;
    let onboardingData = null;
    if (query_type == 'personal_details') {
        onboardingData = await savePersonalDetails(req);
    } else if (query_type == 'family_details') {
        onboardingData = await saveFamilyDetails(req);
    } else if (query_type == 'education_details') {
        onboardingData = await saveEducationDetails(req);
    } else if (query_type == 'bank_details') {
        onboardingData = await saveBankDetails(req);
    } else if (query_type == 'social_details') {
        onboardingData = await saveSocialDetails(req);
    } else if (query_type == 'work_experience_details') {
        onboardingData = await saveWorkExperienceDetails(req);
    } else if (query_type == 'reference_details') {
        onboardingData = await saveReferenceDetails(req);
    } else {
      return errorResponse(req, res, messages.alert.ONBOARDING_TYPE_ERR, httpStatus.BAD_REQUEST);
    }
    if (onboardingData?.status) {
      return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, onboardingData, httpStatus.OK);
    } else {
      return errorResponse(req, res, messages.alert.SERVER_MSG, httpStatus.BAD_REQUEST);
    }
    //   const personalDetailsData = await onboardingService.saveOnboardingDetails({user_id: req.body.user_id}, {$set: req.body});
});

const savePersonalDetails = async (req) => {
    validateInController(onboardingValidation.savePersonalDetails, req);
    const personalDetailsData = await onboardingService.saveOnboardingDetails({_id: req.body.user_id}, req.body, 'additional_personal_details');
    return personalDetailsData;
};

const saveFamilyDetails = async (req) => {
    validateInController(onboardingValidation.saveFamilyDetails, req);
    const familyDetailsData = await onboardingService.saveOnboardingDetails({_id: req.body.user_id}, req.body, 'additional_family_details');
    return familyDetailsData;
}

const saveEducationDetails = async (req) => {
    validateInController(onboardingValidation.saveEducationDetails, req);
    const educationDetailsData = await onboardingService.saveOnboardingKeyData({_id: req.body.user_id}, {$set: req.body});
    return educationDetailsData;
}

const saveBankDetails = async (req) => {
    validateInController(onboardingValidation.saveBankDetails, req);
    const bankDetailsData = await onboardingService.saveOnboardingDetails({_id: req.body.user_id}, req.body, 'additional_bank_details');
    return bankDetailsData;
}

const saveSocialDetails = async (req) => {
    validateInController(onboardingValidation.saveSocialDetails, req);
    const socailDetailsData = await onboardingService.saveOnboardingDetails({_id: req.body.user_id}, req.body, 'additional_social_details');
    return socailDetailsData;
}

const saveWorkExperienceDetails = async (req) => {
    validateInController(onboardingValidation.saveWorkExperienceDetails, req);
    const workExperienceDetailsData = await onboardingService.saveOnboardingKeyData({_id: req.body.user_id}, {$set: req.body});
    return workExperienceDetailsData;
}

const saveReferenceDetails = async (req) => {
    validateInController(onboardingValidation.saveReferenceDetails, req);
    const referenceDetailsData = await onboardingService.saveOnboardingKeyData({_id: req.body.user_id}, {$set: req.body});
    return referenceDetailsData;
}

const uploadEmployeeDocument = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    let data = []
    Object.entries(req.files).forEach(([key,value])=> {
        let obj = {
            employee_id: mongoose.Types.ObjectId(user.id),
            doc_name: key,
            filename: value[0].filename
        }
        data.push(obj)
    })
    // const getRole = await roleService.queryAllRoles({name:"Employee"})
    // await employeeService.updateUserByFilter({_id:mongoose.Types.ObjectId(user.id)},{role_id:getRole.data[0]._id})
    const upload = await onboardingService.uploadDocuments(data);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, upload, httpStatus.OK);

});

const getAllEmployeeDocuments = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    const userId = req.query._id ? req.query._id : user?.id;
    const employeeData = await onboardingService.getEmployeeDocs({employee_id: mongoose.Types.ObjectId(userId)});
    
    employeeData && employeeData?.data?.map((data) => {
        data.file = `https://saas.glueple.com:3001/documents/${data?.filename}`
    })
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, employeeData, httpStatus.OK);
});


module.exports = {
    createOnboardingStep,
    getOnboardingStep,
    createOnboardingStepFields,
    getOnboardingStepFields,
    saveOnboardingDetails,
    saveEducationDetails,
    saveBankDetails,
    saveSocialDetails,
    saveWorkExperienceDetails,
    saveReferenceDetails,
    uploadEmployeeDocument,
    getAllEmployeeDocuments,
};