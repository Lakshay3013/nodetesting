const branchesSchema = require('../../../models/branches.model');
const { getServiceResFormat, getDb } = require('../utils/appHelper');

const queryAllBranches = async (condition) => {
    const res = getServiceResFormat();
    let db = getDb()
    const branchesModel = branchesSchema(db);
    const queryRes = await branchesModel.aggregate([
        { "$match": condition },
        {
            "$set":
            {
                label: "$branch_name",
                value: "$_id",
            }
        },
    ]).allowDiskUse();
    if (queryRes && queryRes?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

module.exports = {
    queryAllBranches,
};