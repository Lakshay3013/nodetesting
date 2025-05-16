const mongoose = require('mongoose');
const { enumList } = require('../config/enum');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');


const mrfSchema = mongoose.Schema(
    {
        parent_id: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        auto_id: {
            type: Number,
            required: true,
            default: null,
          },
        emp_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'employees',
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        type: {
            type: String,
            enum: enumList?.mrfType?.list,
            default: enumList?.mrfType?.default,
            required: true,
        },
        department_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'departments',
            required: true,
        },
        designation_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'designations',
            required: true,
        },
        position_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'positions',
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        priority: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'dropdown_masters',
            required: true,
        },
        min_qualififcation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'qualifications',
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        preferred_qualification: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'qualifications',
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        business_impact: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'dropdown_masters',
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        hiring_for: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'locations',
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        vacant_position: {
            type: Number,
            default: null
        },
        learning_development_cost: {
            type: Object,
            default: {
                is_cost: false,
                min_cost: 0,
                max_cost: 0,
            }
        },
        year_of_experience: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'dropdown_masters',
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        type_of_appointment: {
            type: Object,
            default: {
                type: 'permanent',
                duration: '',
            },
        },
        mrf_justification: {
            type: String,
            default: null,
            trim: true,
        },
        max_amount: {
            type: Number,
            default: 0,
        },
        min_amount: {
            type: Number,
            default: 0,
        },
        is_submitted: {
            type: Boolean,
            default: false,
        },
        is_draft: {
            type: Boolean,
            default: true,
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'employees',
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        assigned_to_recruiter: {
            type: Boolean,
            default: false,
        },
        recruiter_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'employees',
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        mrf_assigned_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'employees',
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        mrf_assigned_at: {
            type: Date,
            default: null,
        },
        mrf_status: {
            type: String,
            enum: enumList?.mrfStatus?.list,
            default: enumList?.mrfStatus?.default,
        },
        role_summary: {
            type: String,
            default: null,
        },
        responsiblities: {
            type: String,
            default: null,
        },
        training_certificates: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'training_certificates',
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        other_skills: {
            type: String,
            default: null,
        },
        domain_knowledge: {
            type: String,
            default: null,
        },
        step: {
            type: Number,
            default: 1,
        },
        open_for: {
            type: String,
            enum: enumList?.mrfOpenFor?.list,
            default: enumList?.mrfOpenFor?.default,
        },
        last_date_to_apply: {
            type: Date,
            default: null,
        },
        disbursal_time: {
            type: String,
            default: null,
        },
        payment_type: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'dropdown_masters',
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
        male_payment_value: {
            type: Number,
            default: 0,
        },
        diversity_payment_value: {
            type: Number,
            default: 0,
        }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

mrfSchema.plugin(toJSON);
mrfSchema.plugin(paginate);

/**
 * @typedef mrfModel
 */
// const mrfModel = mongoose.model("mrfs", mrfSchema);

// module.exports = mrfModel;

module.exports = (db) => {
  return db.model('mrfs', mrfSchema);
};
