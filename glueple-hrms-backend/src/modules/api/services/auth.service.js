const employeeSchema = require('../../../models/employee.model');
const { getServiceResFormat,getDb } = require('../utils/appHelper');

const getEmployeeLoginData=async(filter)=>{
    const res = getServiceResFormat();
     let db = getDb()
    const employeeModel = employeeSchema(db);
    const queryRes = await employeeModel.aggregate([
        { $match: filter},
        // {
        //   $lookup: {
        //     from: "employees",
        //     localField: "reported_to",
        //     foreignField: "_id",
        //     as: "reportingManagerDetails"
        //   }
        // },
        // { $unwind: "$reportingManagerDetails" },
        // {
        //   $lookup: {
        //     from: "roles",
        //     localField: "role_id",
        //     foreignField: "_id",
        //     as: "roleDetails"
        //   }
        // },
        // { $unwind: "$roleDetails" },
        // { $addFields: { employee_reporting_manager: "$reportingManagerDetails.name" } },
        // { $addFields: { employee_designation: "$roleDetails.role_name" } }
      ]).allowDiskUse(true);
    if(queryRes?.length){
        res.data = queryRes;
    }else{
        res.status = false;
    }
    return res;
}

module.exports = {
    getEmployeeLoginData,
}