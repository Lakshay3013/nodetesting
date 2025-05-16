const Joi = require('joi');

const createPermission = {
    body: Joi.object().keys({
        route_key: Joi.string().required().label('Route Key'),
        routes: Joi.string().optional().allow('').label('Routes'),
        permission_type: Joi.string().required().label('Permission Type'),
        title: Joi.string().required().label('Title'),
        parent: Joi.string().optional().allow('').label('Parent Id'),
        sort_order: Joi.number().optional().allow(0).label('Sort Order'),
        icon: Joi.string().optional().allow('').label('Icon'),
        sub_title: Joi.string().optional().allow('').label('Sub Title'),
        category: Joi.string().optional().allow('').label('Category'),
    }),
};

const addAccessRoute = {
    body: Joi.object().keys({
        permission_for: Joi.string().required().label('Permission For'),
        collection_id: Joi.string().required().label('Collection Id'),
        permission_ids: Joi.array().required().label('Permission Ids'),
    }),
};

const getAllRoutes = {
    query: Joi.object().keys({
        limit: Joi.number().optional().allow(0).label('Limit'),
        page: Joi.number().optional().allow(0).label('Page'),
    }),
};

const updatePermission = {
    body: Joi.object().keys({
        role_id: Joi.string().required().label('Role ID'),
        user_id: Joi.string().optional().allow('').label('User ID'),
        permission_ids: Joi.array().required().label('Permission Ids'),
    }),
};

const getRoleOrUserWisePermission = {
    query: Joi.object().keys({
        role_id: Joi.string().required().label('Role ID'),
        user_id: Joi.string().optional().allow('').label('User ID'),
    }),
};


module.exports = {
    createPermission,
    getAllRoutes,
    addAccessRoute,
    updatePermission,
    getRoleOrUserWisePermission,
};