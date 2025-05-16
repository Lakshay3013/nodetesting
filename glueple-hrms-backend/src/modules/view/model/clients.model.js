const mongoose = require('mongoose');
const { toJSON, paginate } = require('../../../models/plugins');
const { defaultValueForObjectId } = require('../../../models/utils/helper');
const { type } = require('jquery');


const clientSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    employee_strength: {
        type: String,
        required: true,
    },
    email :{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        default:true
    },
    industry_type:{
        type:String,
        default:null
    },
    country:{
        type:String,
        default:null
    },
    state:{
        type:String,
        default:null
    },
    city:{
        type:String,
        default:null
    },
    address:{
        type:String,
        default:null
    },
    time_zone:{
        type:String,
        default:null
    },
    is_active:{
        type:Boolean,
        default:false
    },
    org_code:{
        type:String,
        default:null
    },
    emp_code:{
        type:String,
        default:null
    },
    emp_code_start:{
        type:Number,
        default:null
    },
    emp_code_format:{
        type:String,
        default:null
    },
    emp_code_preview:{
        type:String,
        default:null
    },
    logo:{
        type:String,
        default:null
    },
    favicon:{
        type:String,
        default:null
    },
    water_mark:{
        type:String,
        default:null
    },
    primary_color:{
        type:String,
        default:null
    },
    contact_person_name:{
        type:String,
        default:null
    },
    contact_person_email:{
        type:String,
        default:null
    },
    contact_person_mobile:{
        type:Number,
        default:null
    },
    db_name:{
        type:String,
        default:null
    },
    db_host_name:{
        type:String,
        default:null
    },
    db_user_name:{
        type:String,
        default:null
    },
    db_password:{
        type:String,
        default:null
    },
    accessKeyId:{
        type:String,
        default:null
    },
    secretAccessKey:{
        type:String,
        default:null
    },
    region:{
        type:String,
        default:null
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

clientSchema.plugin(toJSON);
clientSchema.plugin(paginate);

/**
 * @typedef clientModel
 */
const clientModel = mongoose.model('Organization', clientSchema);

module.exports = clientModel;
