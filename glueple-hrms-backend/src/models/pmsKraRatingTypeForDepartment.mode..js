const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const kraRatingTypeForDepartmentSchema = mongoose.Schema({
    department_id:{
        type:mongoose.Schema.Types.ObjectId,
        default:null
    },
    function_id:{
        type:mongoose.Schema.Types.ObjectId,
        default:null
    },
    rating_type:{
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

kraRatingTypeForDepartmentSchema.plugin(toJSON);
kraRatingTypeForDepartmentSchema.plugin(paginate);

/**
 * @typedef kraRatingTypeForDepartmentModel
 */
// const kraRatingTypeForDepartmentModel = mongoose.model('pms_kra_rating_type_for_department', kraRatingTypeForDepartmentSchema);

// module.exports = kraRatingTypeForDepartmentModel;


module.exports = (db) => {
  return db.model('pms_kra_rating_type_for_department', kraRatingTypeForDepartmentSchema);
};