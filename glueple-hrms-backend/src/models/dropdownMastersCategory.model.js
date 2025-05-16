const mongoose = require('mongoose');
const {toJSON, paginate} = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const dropdownMastersCategorySchema = mongoose.Schema(
    {
        name: {
          type:String,
          trim: true,
          required: true,
        },
        short_name: {
            type:String,
            trim: true,
            required: true,
        },
        is_active: {
            type: Boolean,
            default:true,
        },
        deleted_at:{
            type: Date,
            default: null,
        },
        category_short_name:{
            type:String,
            trim: true,
            required: true,
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

dropdownMastersCategorySchema.plugin(toJSON);
dropdownMastersCategorySchema.plugin(paginate);

/**
 * @typedef dropdownMasterCategoryModel
 */
// const dropdownMasterCategoryModel = mongoose.model('dropdown_master_category', dropdownMastersCategorySchema);

// module.exports = dropdownMasterCategoryModel;


module.exports = (db) => {
  return db.model('dropdown_master_category', dropdownMastersCategorySchema);
};