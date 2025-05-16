const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');
const { boolean } = require('joi');
const appHelper = require('../modules/api/utils/appHelper')

const employeeSchema = mongoose.Schema(
    {
        emp_id: {
            type: String,
            required: true,
            trim: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        mobile: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Invalid email');
                }
            },
        },
        joining_date: {
            type: Date,
            required: true,
            default: null,
        },
        location: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'branches',
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        account_status: {
            type: String,
            default: null,
        },
        notice_period: {
            type: String,
            default: null,
        },
        probation_period: {
            type: String,
            default: null,
        },
        working_from: {
            type: mongoose.Types.ObjectId,
            default: null,
        },
        type: {
            type: String,
            // required: true,
            default: null,
        },
        primary_company_id: {
            type: mongoose.Schema.Types.ObjectId,
            // required: true,
            default: null,
        },
        primary_sub_company_id: {
            type: mongoose.Schema.Types.ObjectId,
            // required: true,
            default: null,
        },
        company_ids: {
            type: Array,
            // required: true,
            default: [],
        },
        sub_company_ids: {
            type: Array,
            // required: true,
            default: [],
        },
        candidate_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'candidates',
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        role_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'roles',
            // required: true,
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        department_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'departments',
            required: true,
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        designation_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'designations',
            required: true,
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        position_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'positions',
            // required: true,
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        reported_to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'emmployees',
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        device_id: {
            type: String,
            default: null,
        },
        installed_app_version: {
            type: String,
            default: null,
        },
        app_platform: {
            type: String,
            default: null,
        },
        fcm_token: {
            type: String,
            default: null,
        },
        token: {
            type: String,
            default: null,
        },
        login_attempt: {
            type: String,
            default: null,
        },
        last_login: {
            type: String,
            default: null,
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: 6,
            private: true,
        },
        dob: {
            type: String,
            default: null,
        },
        gender: {
            type: String,
            default: null,
        },
        marital_status: {
            type: String,
            default: null,
        },
        personal_mobile: {
            type: String,
            default: null,
        },
        personal_email: {
            type: String,
            default: null,
        },
        esic_no: {
            type: String,
            default: null,
        },
        uan_no: {
            type: String,
            default: null,
        },
        pan_no: {
            type: String,
            default: null,
        },
        pf_no: {
            type: String,
            default: null,
        },
        aadhar_no: {
            type: String,
            default: null,
        },
        is_aadhar_verified: {
            type: Boolean,
            default: false,
        },
        blood_group: {
            type: String,
            default: null,
        },
        emergency_mobile: {
            type: String,
            default: null,
        },
        present_address: {
            type: String,
            default: null,
        },
        permanent_address: {
            type: String,
            default: null,
        },
        present_city: {
            type: String,
            default: null,
        },
        present_state: {
            type: String,
            default: null,
        },
        present_postal_code: {
            type: String,
            default: null,
        },
        permanent_city: {
            type: String,
            default: null,
        },
        permanent_state: {
            type: String,
            default: null,
        },
        permanent_postal_code: {
            type: String,
            default: null,
        },
        additional_personal_details: {
            type: Object,
            default: {},
        },
        fathers_name: {
            type: String,
            default: null,
        },
        mothers_name: {
            type: String,
            default: null,
        },
        fathers_dob: {
            type: String,
            default: null,
        },
        mothers_dob: {
            type: String,
            default: null,
        },
        additional_family_details: {
            type: Object,
            default: {},
        },
        education_details: {
            type: Array,
            default: [],
        },
        ifsc_code: {
            type: String,
            default: null,
        },
        bank_name: {
            type: String,
            default: null,
        },
        branch_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'branches',
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        branch_name:{
            type: String,
            default: null,
        },
        bank_account_holder_name: {
            type: String,
            default: null,
        },
        bank_account_no: {
            type: String,
            default: null,
        },
        nominee_name: {
            type: String,
            default: null,
        },
        relation_with_nominee: {
            type: String,
            default: null,
        },
        additional_bank_details: {
            type: Object,
            default: {},
        },
        linkedin_id: {
            type: String,
            default: null,
        },
        facebook_id: {
            type: String,
            default: null,
        },
        twitter_id: {
            type: String,
            default: null,
        },
        instagram_id: {
            type: String,
            default: null,
        },
        additional_social_details: {
            type: Object,
            default: {},
        },
        work_experience_details: {
            type: Array,
            default: [],
        },
        reference_details: {
            type: Array,
            default: [],
        },
        accepted_policies: {
            type: Boolean,
            default: null,
        },
        policy_sign: {
            type: String,
            default: null,
        },
        branch_office: {
            type: String,
            default: null,
        },
        project:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            default: null,
            set: (value) => defaultValueForObjectId(value),
        }],
        skill:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: "skill",
            default: null,
            set: (value) => defaultValueForObjectId(value),
        }],
        rating_duration:{
            type:String,
            default:null
        },
        sub_department_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'sub_departments',
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        leave_date:{
            type:String,
            default:null
        },
        reason:{
            type:String,
            default:null

        },
        first_child_name:{
            type:String,
            default:null
        },
        first_child_dob:{
            type:String,
            default:null
        },
        second_child_name:{
            type:String,
            default:null
        },
        second_child_dob:{
            type:String,
            default:null
        },
        spouse_aadhaar:{
            type:String,
            default:null
        },
        spouse_dob:{
            type:String,
            default:null
        },
        spouse_name:{
            type:String,
            default:null
        },
        profile_picture:{
            type:String,
            default:null
        }



    },
    {
        timestamps: true,
    }
);

employeeSchema.plugin(toJSON);
employeeSchema.plugin(paginate);

/**
 * @typedef Employee
 */
// const db = appHelper.getDb();
// console.log("db",db)
// const employeeModel = db?.model('employees', employeeSchema) || mongoose.model('employees', employeeSchema);
// const employeeModel = mongoose.model('employees', employeeSchema);

module.exports = (db) => {
  return db.model('employees', employeeSchema);
};

// module.exports = {"schema":employeeSchema,"model":"employees"};

