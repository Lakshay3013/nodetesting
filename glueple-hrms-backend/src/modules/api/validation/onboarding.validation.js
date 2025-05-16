const { name } = require('ejs');
const Joi = require('joi');

const createOnboardingStep = {
    body: Joi.object().keys({
        name: Joi.string().required().label('Name'),
        short_name: Joi.string().required().label('Short Name'),
        sort_order: Joi.number().optional().allow(0).label("Sort Order"),
        is_active: Joi.boolean().optional().allow(0).label('Is Active'),
        is_required: Joi.boolean().optional().allow(0).label('Is Required'),
  }),
};

const getOnboardingStep = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
        is_active: Joi.boolean().optional().allow("").label("Active"),
        view_profile: Joi.boolean().optional().allow("").label("view_profile"),
  }),
};

const createOnboardingStepFields = {
    body: Joi.object().keys({
        name: Joi.string().required().label('Name'),
        key_name: Joi.string().required().label('Key Name'),
        step_id: Joi.string().required().label('Step ID'),
        sort_order: Joi.number().optional().allow(0).label("Sort Order"),
        is_active: Joi.boolean().optional().allow(0).label('Is Active'),
        is_required: Joi.boolean().optional().allow(0).label('Is Required'),
  }),
};

const getOnboardingStepFields = {
    query: Joi.object().keys({
        step_id: Joi.string().required().label("Step ID"),
        limit: Joi.number().optional().allow(0).label("Limit"),
        page: Joi.number().optional().allow(0).label("page"),
        is_active: Joi.boolean().optional().allow("").label("Active"),
        view_profile: Joi.boolean().optional().allow("").label("view_profile"),

    }),
};

const savePersonalDetails = {
    body: Joi.object().keys({
        user_id: Joi.string().optional().allow("").label("User ID"),
        step_id: Joi.string().required().label("Step ID"),
        query_type: Joi.string().required().label('Query Type'),
        name: Joi.string().required().label("Name"),
        dob: Joi.string().required().label("DOB"),
        gender: Joi.string().required().label("Gender"),
        marital_status: Joi.string().required().label("Marital Status"),
        personal_mobile: Joi.string().required().label("Personal Mobile"),
        personal_email: Joi.string().required().label("Personal Email"),
        esic_no: Joi.string().optional().allow("").label("ESIC No"),
        uan_no: Joi.string().optional().allow("").label("UAN No"),
        pan_no: Joi.string().optional().allow("").label("PAN No"),
        pf_no: Joi.string().optional().allow("").label("PF No"),
        aadhar_no: Joi.string().required().label("Aadhar No"),
        blood_group: Joi.string().required().label("Blood Group"),
        emergency_mobile: Joi.string().required().label("Emergency Mobile"),
        present_address: Joi.string().required().label("Present Address"),
        present_city: Joi.string().required().label("Present City"),
        present_state: Joi.string().required().label("Present State"),
        present_postal_code: Joi.string().required().label("Present Postal Code"),
        permanent_address: Joi.string().required().label("Permanent Address"),
        permanent_city: Joi.string().required().label("Permanent City"),
        permanent_state: Joi.string().required().label("Permanent State"),
        permanent_postal_code: Joi.string().required().label("Permanent Postal Code"),
    }).unknown(true)
};

const saveFamilyDetails = {
    body: Joi.object().keys({
        user_id: Joi.string().optional().allow("").label("User ID"),
        step_id: Joi.string().required().label("Step ID"),
        query_type: Joi.string().required().label('Query Type'),
        fathers_name: Joi.string().required().label('Fathers Name'),
        fathers_dob: Joi.string().optional().allow("").label('Fathers DOB'),
        mothers_name: Joi.string().required().label('Mothers Name'),
        mothers_dob: Joi.string().optional().allow("").label('Mothers DOB'),
    }).unknown(true)
};

const saveEducationDetails = {
    body: Joi.object().keys({
        user_id: Joi.string().optional().allow("").label("User ID"),
        step_id: Joi.string().required().label("Step ID"),
        query_type: Joi.string().required().label('Query Type'),
        education_details: Joi.array().required().label('Education Details'),
    }).unknown(true)
};

const saveBankDetails = {
    body: Joi.object().keys({
        user_id: Joi.string().optional().allow("").label("User ID"),
        step_id: Joi.string().required().label("Step ID"),
        query_type: Joi.string().required().label('Query Type'),
        ifsc_code: Joi.string().required().label('IFSC Code'),
        bank_name: Joi.string().required().label('Bank Name'),
        branch_name: Joi.string().required().label('Branch Name'),
        bank_account_holder_name: Joi.string().required().label('Bank Account Holder Name'),
        bank_account_no: Joi.string().required().label('Bank Account Number'),
        nominee_name: Joi.string().required().label('Nominee Name'),
        relation_with_nominee: Joi.string().required().label('Relation with Nominee'),
    }).unknown(true)
};

const saveSocialDetails = {
    body: Joi.object().keys({
        user_id: Joi.string().optional().allow("").label("User ID"),
        step_id: Joi.string().required().label("Step ID"),
        query_type: Joi.string().required().label('Query Type'),
        linkedin_id: Joi.string().optional().allow("").label('LinkedIn ID'),
        facebook_id: Joi.string().optional().allow("").label('Facebook ID'),
        twitter_id: Joi.string().optional().allow("").label('Twitter ID'),
        instagram_id: Joi.string().optional().allow("").label('Instagram ID'),
    }).unknown(true)
};

const saveWorkExperienceDetails = {
    body: Joi.object().keys({
        user_id: Joi.string().optional().allow("").label("User ID"),
        step_id: Joi.string().required().label("Step ID"),
        query_type: Joi.string().required().label('Query Type'),
        work_experience_details: Joi.array().optional().label('Work Experience Details'),
    }).unknown(true)
};

const saveReferenceDetails = {
    body: Joi.object().keys({
        user_id: Joi.string().optional().allow("").label("User ID"),
        step_id: Joi.string().required().label("Step ID"),
        query_type: Joi.string().required().label('Query Type'),
        reference_details: Joi.array().required().label('Reference Details'),
    }).unknown(true)
};


module.exports = {
    createOnboardingStep,
    getOnboardingStep,
    createOnboardingStepFields,
    getOnboardingStepFields,
    savePersonalDetails,
    saveFamilyDetails,
    saveEducationDetails,
    saveBankDetails,
    saveSocialDetails,
    saveWorkExperienceDetails,
    saveReferenceDetails,
};