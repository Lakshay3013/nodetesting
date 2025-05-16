const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { defaultValueForObjectId } = require('./utils/helper');

const financialYearSchema = mongoose.Schema({
    from: {
        type: String,
        unique: true,
        trim: true,
        required: true,
    },
    to: {
        type: String,
        trim: true,
        default: null,
    },
    is_active: {
        type: Boolean,
        default: true,
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

financialYearSchema.plugin(toJSON);
financialYearSchema.plugin(paginate);

/**
 * @typedef financialYearModel
*/
// const financialYearModel = mongoose.model('financial_years', financialYearSchema);

// module.exports = financialYearModel;



module.exports = (db) => {
  return db.model('financial_years', financialYearSchema);
};
