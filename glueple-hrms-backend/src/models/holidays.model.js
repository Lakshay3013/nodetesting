const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { enumList } = require('../config/enum');

const holidayModelSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    from_date: {
      type: String,
      required: true,
    },
    to_date: {
      type: String,
      required: true,
    },
    country: {
      type: Array,
      ref: 'countries',
      default: null,
    },
    state: {
      type: Array,
      ref: 'states',
      default: null,
    },
    city: {
      type: Array,
      ref: 'cities',
      default: null,
    },
    branch: {
      type: Array,
      ref: 'branches',
      default: null,
    },
    gender: {
      type: Array,
      default: enumList?.gender?.default,
    },
    holiday_data: {
      type: Array,
      default: [],
    },
    description: {
      type: String,
      default: '',
    },
    restricted: {
      type: Boolean,
      default: false,
    },
    notify_before_days: {
      type: Number,
      default: 0,
    },
    is_notify_to_employee: {
      type: Boolean,
      default: false,
    },
    is_reprocess_leave: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

holidayModelSchema.plugin(toJSON);
holidayModelSchema.plugin(paginate);

/**
 * @typedef holidayModel
 */
// const holidayModel = mongoose.model('holidays', holidayModelSchema);

// module.exports = holidayModel;


module.exports = (db) => {
  return db.model('holidays', holidayModelSchema);
};
