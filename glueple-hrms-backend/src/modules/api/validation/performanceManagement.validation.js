const Joi = require('joi');
const { launchBus } = require('pm2');
const subDepartmentModel = require('../../../models/subdepartments.mode');

const createKra = {
    body: Joi.object().keys({
        kra_name:Joi.string().required().label("Kra name"),
        kra_rating_type:Joi.string().required().label("kra rating type"),
        rating_duration:Joi.string().required().label("rating duration"),
        bonus_duration:Joi.string().required().label("Bonus duration"),
        kra_weightage_status:Joi.boolean().optional().allow("").label("Kra weightage"),
        is_eligible_for_assign_status:Joi.boolean().optional().allow("").label("Eligible for Assign"),
        financial_id:Joi.string().required().label("Financial Id"),
        is_active:Joi.boolean().required().label("Active"),
        department_id:Joi.string().required().label("Department Id"),
        function_id:Joi.string().required().label("Function Id")
        
    }),
};

const getKraDetails = {
     query: Joi.object().keys({
            limit: Joi.number().optional().allow(0).label('Limit'),
            page: Joi.number().optional().allow(0).label('Page'),
        }),
}

const updateKraDetail = {
    body: Joi.object().keys({
        kra_name:Joi.string().required().label("Kra name"),
        kra_rating_type:Joi.string().required().label("kra rating type"),
        rating_duration:Joi.string().required().label("rating duration"),
        bonus_duration:Joi.string().required().label("Bonus duration"),
        kra_weightage_status:Joi.boolean().optional().allow("").label("Kra weightage"),
        is_eligible_for_assign_status:Joi.boolean().optional().allow("").label("Eligible for Assign"),
        financial_id:Joi.string().required().label("Financial Id"),
        is_active:Joi.boolean().required().label("Active"),
        _id:Joi.string().required().label("id")
        
    }),
}

const deleteKraDetail = {
    body: Joi.object().keys({
            _id: Joi.string().required().label("ID"),
        }),
}

const giveRating = {
    body:Joi.object().keys({
        employee_id:Joi.string().required().label("Employee Id"),
        financial_id:Joi.string().required().label("financial Id"),
        rating_month:Joi.string().required().label("Rating Month"),
        feedback:Joi.string().required().label("Feedback"),
        rating_remark:Joi.array().required().label("Rating Remark"),
    })
}

const createSelfRatingPermission = {
    body:Joi.object().keys({
        permission_type:Joi.string().required().label("Permission Type"),
        is_rating_allow:Joi.boolean().required().label("Rating allow"),
        employee_ids:Joi.array().optional().allow('').label("employee id")
    })
}

const getGivenRating = {
    query: Joi.object().keys({
        employee_id:Joi.string().required().label('employee Id'),
        financial_id:Joi.string().required().label('Financial Id'),
        kra_id:Joi.string().optional().allow('').label("kra id"),
        rating_month:Joi.string().required().label("rating month")
    }),
}

const getAverageRating = {
    query:Joi.object().keys({
        financial_id:Joi.string().required().label("financial id")

    })
}

module.exports = {
    createKra,
    getKraDetails,
    updateKraDetail,
    deleteKraDetail,
    giveRating,
    createSelfRatingPermission,
    getGivenRating,
    getAverageRating,

}