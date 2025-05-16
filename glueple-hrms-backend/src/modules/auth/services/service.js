

const employeeModel=require('../../../models/employee.model');

const getEmployeeLoginData=async(email)=>{
    let userDetail = await employeeModel.aggregate([
        { $match: { email } },
        {
          $lookup: {
            from: "employees",
            localField: "reported_to",
            foreignField: "_id",
            as: "reportingManagerDetails"
          }
        },
        { $unwind: "$reportingManagerDetails" },
        {
          $lookup: {
            from: "roles",
            localField: "role_id",
            foreignField: "_id",
            as: "roleDetails"
          }
        },
        { $unwind: "$roleDetails" },
        { $addFields: { employee_reporting_manager: "$reportingManagerDetails.name" } },
        { $addFields: { employee_designation: "$roleDetails.role_name" } }
      ]).allowDiskUse(true);
      return userDetail;
}


module.exports={
    getEmployeeLoginData
}

