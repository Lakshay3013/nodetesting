const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const {enumList} = require('../config/enum');
const { defaultValueForObjectId } = require('./utils/helper');

const payrollTaxSlabSchema = mongoose.Schema(
    {
        type: {
            type: String,
            default: null,
        },
        start:{
            type:Number,
            default:0
        },
        end:{
            type:Number,
            default:0
        },
        tex_percent:{
            type:Number,
            default:0
        },
        is_include_cess:{
            type:Boolean,
            default:false
        },
        cess_percent:{
            type:Number,
            default:null,
        },
        is_standard_deduction:{
            type:Boolean,
            default:false,
        },
        standard_deduction_value:{
            type:Number,
            default:0
        },
        tex_relaxation:{
            type:Number,
            default:0
        },
        constant_difference:{
            type:Number,
            default:0
        },
        is_rebate_allowed:{
            type:Boolean,
            default:false
        },
        rebate_rules:{
            type:Object,
            default:{}
        },
        is_active:{
            type:Boolean,
            default:false
        },
        created_by: {
                type: mongoose.Schema.Types.ObjectId,
                default: null,
                set: (value) => defaultValueForObjectId(value),
            }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

payrollTaxSlabSchema.plugin(toJSON);
payrollTaxSlabSchema.plugin(paginate);

/**
 * @typedef payrollTexSlabModel
 */
// const payrollTaxSlabModel = mongoose.model('payroll_tax_slab', payrollTaxSlabSchema);

// module.exports = payrollTaxSlabModel;

module.exports = (db) => {
  return db.model('payroll_tax_slab', payrollTaxSlabSchema);
};
