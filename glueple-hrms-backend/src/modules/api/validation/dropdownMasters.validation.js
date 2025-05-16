const Joi = require('joi');

const saveDropdownData = {
    body: Joi.object().keys({
        category_id: Joi.string().required().label('Category'),
        category_key: Joi.string().required().label('Category Key'),
        category_value: Joi.string().required().label('Category Value'),
        category_short_name: Joi.string().required().label('Short Name'),
        input_type: Joi.string().optional().allow('').label('Input Type'),
        rules:Joi.string().optional().allow('').label('Rules'),
        is_active: Joi.boolean().optional().allow(0).label('Is Active'),
  }),
};

const updateDropdownData = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('ID'),
        category_id: Joi.string().required().label('Category'),
        category_key: Joi.string().required().label('Category Key'),
        category_value: Joi.string().required().label('Category Value'),
        category_short_name: Joi.string().required().label('Short Name'),
        input_type: Joi.string().optional().allow('').label('Input Type'),
        rules:Joi.string().optional().allow('').label('Rules'),
        is_active: Joi.boolean().optional().allow(0).label('Is Active'),
  }),
};

const getFilteredDropdownMaster = {
    body: Joi.object().keys({
        category: Joi.array().required().label('Category'),
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
  }),
};

const getDropdownMaster = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
  }),
};

const deleteDropdownData = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('ID'),
  }),
};

const saveCategory = {
    body: Joi.object().keys({
        name: Joi.string().required().label('Name'),
        short_name: Joi.string().required().label('Short Name'),
        is_active: Joi.boolean().optional().allow(0).label('Is Active'),
  }),

}

const getMasterCategory = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
  }),

}

const updateMasterCategory = {
    body: Joi.object().keys({
        name: Joi.string().required().label('Name'),
        short_name: Joi.string().required().label('Short Name'),
        is_active: Joi.boolean().optional().allow(0).label('Is Active'),
        _id:Joi.string().required().label("Id")
  }),

}

const deleteMasterCategory = {
    body: Joi.object().keys({
        _id: Joi.string().required().label('ID'),
  }),
}

module.exports = {
    saveDropdownData,
    updateDropdownData,
    getDropdownMaster,
    deleteDropdownData,
    getFilteredDropdownMaster,
    saveCategory,
    getMasterCategory,
    updateMasterCategory,
    deleteMasterCategory
};