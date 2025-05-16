const permissionSchema = require('../../../models/permissions.model');
const accessControlSchema = require('../../../models/accessControl.model');
const { getServiceResFormat, getFindPagination, getDb } = require('../utils/appHelper');
const mongoose = require('mongoose');

const createPermission = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()

    const queryRes = await permissionSchema(db).create(data);
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const addAccessRoute = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await accessControlSchema(db).findOneAndUpdate(filter, { $set: update }, { upsert: true, new: true });
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const queryPermission = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const totalRecords = await permissionSchema(db).find().count();
    const limits = getFindPagination(options, totalRecords);
    const records = await permissionSchema(db).find(filter, {}, limits?.limits).allowDiskUse();
    const queryRes = {
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        totalPages: limits?.totalPages,
        data: records
    }
    if (queryRes && queryRes?.data?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const getRoutesPermission = async (user) => {
    const res = getServiceResFormat();
    let db = getDb()
    user['id'] = user.id ? mongoose.Types.ObjectId(user?.id) : '';
    user['role_id'] = user.role_id ? mongoose.Types.ObjectId(user?.role_id) : '';
    const queryRes1 = await accessControlSchema(db).find({ $or: [{ collection_id: `${user?.id}` }, { collection_id: `${user?.role_id}` }] });
    if (queryRes1 && queryRes1?.[0]?.permission_ids) {
        const objectIds = queryRes1[0]?.permission_ids && queryRes1[0]?.permission_ids?.length && queryRes1[0]?.permission_ids?.map(id => mongoose.Types.ObjectId(id));
        const queryRes = await permissionSchema(db).find({ _id: { $in: objectIds }, permission_type: "route" });
        if (queryRes?.length) {
            res.data = queryRes;
        } else {
            res.status = false;
        }
    }
    return res;
}

const getMenuSubmenuPermission = async (user) => {
    const res = getServiceResFormat();
    let db = getDb()
    user['id'] = user.id ? mongoose.Types.ObjectId(user?.id) : '';
    user['role_id'] = user.role_id ? mongoose.Types.ObjectId(user?.role_id) : ''
    const queryRes1 = await accessControlSchema(db).find({ $or: [{ collection_id: `${user?.id}` }, { collection_id: `${user?.role_id}` }] });
    if (queryRes1) {
        const objectIds = queryRes1[0]?.permission_ids && queryRes1[0]?.permission_ids?.length && queryRes1[0]?.permission_ids?.map(id => mongoose.Types.ObjectId(id));
        if (objectIds?.length) {
            const queryRes = await permissionSchema(db).aggregate([
                {
                    "$match":
                    {
                        _id: { '$in': objectIds },
                        permission_type: 'menu'
                    }
                },
                {
                    "$lookup":
                    {
                        from: 'permissions',
                        localField: '_id',
                        foreignField: 'parent',
                        as: 'submenu',
                        pipeline: [{
                            "$match":
                            {
                                _id: { '$in': objectIds }
                            }
                        }]
                    }
                },
                {
                    "$lookup":
                    {
                        from: 'permissions',
                        localField: '_id',
                        foreignField: 'parent',
                        as: 'submenu_count',
                    }
                },
                {
                    "$set":
                    {
                        submenu_count: { "$size": "$submenu_count" },
                        label: "$title",
                        value: "$_id",
                    }
                },
            ]);
            if (queryRes?.length) {
                res.data = queryRes;
            } else {
                res.status = false;
            }
        } else {
            res.status = false;
        }
    }
    return res;
}

const getUserPermission = async (user) => {
    const res = getServiceResFormat();
    let db = getDb()
    const routesPermissionData = await getRoutesPermission(user) || [];
    const menuSubmenuPermissionData = await getMenuSubmenuPermission(user) || [];
    const queryRes = [
        ...(Array.isArray(menuSubmenuPermissionData?.data) ? menuSubmenuPermissionData.data : []),
        ...(Array.isArray(routesPermissionData?.data) ? routesPermissionData.data : [])
    ];
    if (routesPermissionData?.status || menuSubmenuPermissionData?.status) {
        if (queryRes?.length) {
            res.data = queryRes;
        } else {
            res.status = false;
        }
    }
    return res;
}

const getUserAPIRights = async (user) => {
    const res = getServiceResFormat();
    let db = getDb()
    user['id'] = user._id ? mongoose.Types.ObjectId(user?._id) : '';
    user['role_id'] = user.role_id ? mongoose.Types.ObjectId(user?.role_id) : '';
    const queryRes1 = await accessControlSchema(db).find({ $or: [{ collection_id: `${user?.id}` }, { collection_id: `${user?.role_id}` }] });
    if (queryRes1 && queryRes1?.[0]?.permission_ids && queryRes1[0]?.permission_ids?.length) {
        const objectIds = queryRes1[0]?.permission_ids?.map(id => mongoose.Types.ObjectId(id));
        const queryRes = await permissionSchema(db).aggregate([
            {
                "$match": {
                    _id: { '$in': objectIds }
                }
            },
            {
                $group: {
                    _id: null,
                    concatenatedRouteKeys: { $push: "$route_key_api" }
                }
            },
            {
                $project: {
                    _id: 0,
                    concatenatedRouteKeys: 1
                }
            }
        ]);
        if (queryRes && queryRes?.length) {
            res.data = queryRes?.[0]?.concatenatedRouteKeys;
        } else {
            res.status = false;
        }
    }
    return res;
}

const getCategoryWisePermission = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await permissionSchema(db).aggregate([
        { "$match": filter },
        {
            $group: {
                _id: "$category",
                items: {
                    $push: {
                        _id: "$_id",
                        sort_order: "$sort_order",
                        icon: "$icon",
                        permission_type: "$permission_type",
                        route_key_frontend: "$route_key_frontend",
                        route_key: "$route_key",
                        title: "$title",
                        parent: "$parent",
                        sub_title: "$sub_title"
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                distinct_category: "$_id",
                items: 1
            }
        },
    ]).allowDiskUse();
    if (queryRes && queryRes?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const getAccessRouteData = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await accessControlSchema(db).findOne(filter);
    if (queryRes && queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const getMenuPermission = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await permissionSchema(db).aggregate([
        { $match: filter },
        {
            $set: {
                label: "$title",
                value: "$_id"
            }
        }
    ]);
    if (queryRes && queryRes?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

module.exports = {
    createPermission,
    addAccessRoute,
    queryPermission,
    getRoutesPermission,
    getMenuSubmenuPermission,
    getUserPermission,
    getUserAPIRights,
    getCategoryWisePermission,
    getAccessRouteData,
    getMenuPermission
};