const mongoose = require('mongoose');
const validator = require('validator');

const employeeSchema = mongoose.Schema(
    {
        emp_id: {
            type: String,
        },
        username: {
            type: String,
            required: true,
            trim: true
        },
        first_name: {
            type: String,
            required: true,
            trim: true
        },
        last_name: {
            type: String,
            required: true,
            trim: true
        },
        mobile: {
            type: String,
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
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: 6,
            // validate(value) {
            //   if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
            //     throw new Error('Password must contain at least one letter and one number');
            //   }
            // },
            private: true, // used by the toJSON plugin
        },
        salt: {
            type: String,
        },
        joining_date: {
            type: Date,
        },
        company_id: {
            type: mongoose.Schema.Types.ObjectId,
        },
        location: {
            type: String
        },
        department_id: {
            type: mongoose.Schema.Types.ObjectId,
        },
        role_id: {
            type: mongoose.Schema.Types.ObjectId
        },
        panel_role: {
            type: String
        },
        reported_to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'emmployee'
        },
        random_string: {
            type: mongoose.Schema.Types.ObjectId
        },
        ctc: {
            type: String
        },
        account_status: {
            type: String
        },
        notice_period: {
            type: String
        },
        is_password_changed: {
            type: Boolean
        },
        is_auto_approve_asset: {
            type: Boolean
        },
        is_auto_approve_mrf: {
            type: Boolean
        },
        role_right: {
            type: String
        },
        candidate_ref_id: {
            type: mongoose.Schema.Types.ObjectId
        },
        assigned_to_hr_for_creating_emp_id_at: {
            type: Date
        },
        emp_id_created_by: {
            type: mongoose.Schema.Types.ObjectId
        },
        emp_id_created_at: {
            type: Date
        },
        emp_id_created_status: {
            type: String
        },
        email_type: {
            type: String
        },
        email_id_created_by: {
            type: mongoose.Schema.Types.ObjectId
        },
        email_id_created_status: {
            type: String
        },
        email_id_created_at: {
            type: Date
        },
        email_password: {
            type: String
        },
        email_update_verify: {
            type: String
        },
        request_for_id_card: {
            type: Boolean
        },
        send_welcome_letter: {
            type: Boolean
        },
        welcome_letter_send_type: {
            type: String
        },
        send_welcome_letter_at: {
            type: Date
        },
        send_welcome_letter_by: {
            type: mongoose.Schema.Types.ObjectId
        },
        is_survey_done: {
            type: Boolean
        },
        account_type: {
            type: String
        },
        emp_probation: {
            type: String
        },
        device_id: {
            type: String
        },
        branch_office: {
            type: mongoose.Schema.Types.ObjectId
        },
        emp_attendance_source: {
            type: Number
        },
        is_esi: {
            type: Boolean
        },
        is_pf: {
            type: Boolean
        },
        working_from: {
            type: Date
        },
        token: {
            type: String
        },
        is_admin: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
    }
);



/**
 * @typedef Employee
 */
const employeeModel = mongoose.model('employee', employeeSchema);

module.exports = employeeModel;
