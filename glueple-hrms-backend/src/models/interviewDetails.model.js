const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { enumList } = require('../config/enum');
const { defaultValueForObjectId } = require('./utils/helper');

const interviewDetailsSchema = mongoose.Schema({
  mrf_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'mrfs',
  },
  candidate_id: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: 'candidates',
    set: (value) => defaultValueForObjectId(value),
  },
  interview_stage: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: 'dropdown_masters',
    set: (value) => defaultValueForObjectId(value),
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'departments',
  },
  designation: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'designations',
  },
  interviewer: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'employees',
  },
  interview_type: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: 'dropdown_masters',
    set: (value) => defaultValueForObjectId(value),
  },
  interview_type_value: {
    type: String,
    default: null,
  },
  feedback_form: {
    type: Object,
    default: {},
  },
  interview_status: {
    type: String,
    enum: enumList?.interviewStatus?.list,
    default: enumList?.interviewStatus?.default,
  },
  interview_assigned: {
    type: Boolean,
    default: false,
  },
  interview_assigned_at: {
    type: Date,
    default: null,
  },
},
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

interviewDetailsSchema.plugin(toJSON);
interviewDetailsSchema.plugin(paginate);

/**
 * @typedef interviewDetailsModel
 */
// const interviewDetailsModel = mongoose.model('interview_details', interviewDetailsSchema);

// module.exports = interviewDetailsModel;


module.exports = (db) => {
  return db.model('interview_details', interviewDetailsSchema);
};
