const clientAccessControlModel = require('../model/clientAccessControl.model');
const clientPermissionModel = require('../model/clientPermission.model')

const createPermission = async(data)=>{
    const addPermission = await clientPermissionModel.create(data);
    return addPermission
}

const getClientPermission = async (filter) => {
    const getPermission = await clientPermissionModel.aggregate([
        {
            $match: filter
        },
        {
            $lookup: {
                from: "client_permissions",
                let: { menuId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$parent", "$$menuId"] },
                                    { $eq: ["$is_active", true] }
                                ]
                            }
                        }
                    }
                ],
                as: "submenu"
            }
        }
    ])
    return getPermission
}

const createAccessControl = async(data)=>{
    const addAccessControl = await clientAccessControlModel.create(data);
    return addAccessControl
}

const updateAccessControl = async(filter,update)=>{
    const updateData = await clientAccessControlModel.findOneAndUpdate(filter, { $set:  update }, { upsert: true, new: true });
    return updateData
}

const getAccessControl = async(filter)=>{
    const getAccessControl = await clientAccessControlModel.find(filter);
    return getAccessControl
}




module.exports={
    createPermission,
    getClientPermission,
    createAccessControl,
    updateAccessControl,
    getAccessControl
}