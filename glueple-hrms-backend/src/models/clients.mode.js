const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const clientsSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
    },
    client_name: {
        type: String,
        trim: true,
        required: true,
    },
    base_url: {
        type: String,
        required: true,
    },
    port: {
        type: Number,
        required: true,
    },
    attendance_correction_days: {
        type: Number,
        trim: true,
        required: true,
    },
    is_attendance_correction_notification:{
        type:Boolean,
        default:false
    },
    attendance_correction_notification:{
        type:String,
        default:null
    },
    auto_logout_days: {
        type: Number,
        required: true,
    },
    attendance_image_logs_days: {
        type: Number,
        required: true,
    },
    attendance_logs_days:{
        type: Number,
        required: true,
    },
    is_active:{
        type:Boolean,
        default:false
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        set: (value) => defaultValueForObjectId(value),
    },
},
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

clientsSchema.plugin(toJSON);
clientsSchema.plugin(paginate);

/**
 * @typedef clientsModel
 */
// const clientsModel = mongoose.model('client', clientsSchema);

// module.exports = clientsModel;

module.exports = (db) => {
  return db.model('client', clientsSchema);
};
