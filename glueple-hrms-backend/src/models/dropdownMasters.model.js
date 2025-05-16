const mongoose = require('mongoose');
const {toJSON, paginate} = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const dropdownMastersSchema = mongoose.Schema(
    {
        category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'dropdown_master_categorys',
        required: true,
        },
        category_key: {
            type:String,
            trim: true,
            required: true,
        },
        category_value: {
            type:String,
            trim: true,
            required: true,
            lowercase: true,
        },
        category_short_name:{
            type:String,
            default: null,
        },
        input_type:{
            type:String,
            default:null,
        },
        rules:{
            type:Array,
            default:[],
        },
        is_active: {
            type: Boolean,
            default:true,
        },
        deleted_at:{
            type: Date,
            default: null,
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            set: (value) => defaultValueForObjectId(value),
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

dropdownMastersSchema.plugin(toJSON);
dropdownMastersSchema.plugin(paginate);

/**
 * @typedef dropdownMastersModel
 */
// const dropdownMastersModel = mongoose.model('dropdown_masters', dropdownMastersSchema);

// module.exports = dropdownMastersModel;


module.exports = (db) => {
  return db.model('dropdown_masters', dropdownMastersSchema);
};