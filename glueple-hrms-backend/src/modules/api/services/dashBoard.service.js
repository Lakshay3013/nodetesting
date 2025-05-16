
const attendanceRawEntriesModel = require('../../../models/attendanceRawEntries.model');
const correctionApplicationSchema = require('../../../models/correctionApplication.model');
const leaveApplicationSchema = require('../../../models/leaveApplication.model');
const postSchema = require('../../../models/post.model');
const { getServiceResFormat, getDb } = require('../utils/appHelper');
const mongoose = require('mongoose')

const getAttendanceCorrectionRequest = async (filter, options) => {
    const res = getServiceResFormat();
    const { request_for, parameter, status, user,date } = filter
    const approvalCondition = status == '' ? { "approvers_details.type": parameter } : { "approvers_details.action_type": status, "approvers_details.type": parameter }
    const Condition = request_for == "applied" ? { emp_id: mongoose.Types.ObjectId(user.id) } : { emp_id: mongoose.Types.ObjectId(user.id), date: {
        $gte: date.startOfMonth,
        $lt: date.endOfMonth
      }}
       let db = getDb()
    const correctionApplicationModel = correctionApplicationSchema(db);
      console.log("sdfdsfsfsdf", Condition)
    const records = await correctionApplicationModel.aggregate([
        { "$match": Condition },
        {
            "$lookup": {
                from: 'approvers',
                localField: "_id",
                foreignField: "collection_id",
                as: "approvers_details"
            }
        },
        { $match: approvalCondition },
        {
            "$lookup": {
                from: 'employees',
                localField: 'emp_id',
                foreignField: "_id",
                as: "employee_details"
            }
        },
        { $unwind: { path: "$employee_details", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                emp_id: "$employee_details.emp_id",
                first_name: "$employee_details.name",
                last_name: "$employee_details.last_name",
                email: "$employee_details.email",
                employee_id: '$employee_details._id',
                correction_check_out_time: "$correction_check_out_time",
                correction_check_in_time: "$correction_check_in_time",
                check_out_reason: '$check_out_reason',
                check_in_reason: '$check_in_reason',
                type: "$type",
                date: "$date",
                reason: "$reason",
                approvel_id: { "$arrayElemAt": ["$approvers_details._id", 0] },
                leave_id: '$_id',
                leave_short_name: "$leave_data.leave_short_name",
                is_cancel: "$is_cancel",
                approvers_status: { "$arrayElemAt": ["$approvers_details.action_type", 0] }
            }
        },
    ]).allowDiskUse()
    if (records && records?.length) {
        res.data = records.length;
    } else {
        res.status = false;
    }
    return res;
}

const getEmpAppliedLeave = async(data)=>{
    const res = getServiceResFormat();
    let db = getDb()
    const leaveApplicationModel = leaveApplicationSchema(db);
    const {request_for, parameter, status, limit, page,user} = data
    const cancelStatus = status =="cancelled" ? true : false
    const leaveStatus = status == "cancelled" ? "pending" : status
    const approvalCondition = {"approvers_dateils.action_type":leaveStatus,"approvers_dateils.type":parameter,}
    const leaveCondition = request_for == "applied" ? {emp_id:mongoose.Types.ObjectId(user.id), "is_cancel":cancelStatus} : ""
    const getLeaveData = await leaveApplicationModel.aggregate([
        { "$match": leaveCondition },
        {"$lookup":{
            from:'approvers',
            localField:"_id",
            foreignField:"collection_id",
            as:"approvers_dateils"
        }},
        // { $unwind: { path: "$approvers_dateils", preserveNullAndEmptyArrays: true }},
        { $match: approvalCondition},
        {"$lookup":{
            from:'leave_types',
            localField:"leave_type",
            foreignField:"_id",
            as:"leave_data"
        }},
        { $unwind: { path: "$leave_data", preserveNullAndEmptyArrays: true }},
        {"$lookup":{
            from:'employees',
            localField:'emp_id',
            foreignField:"_id",
            as:"employee_dateils"
        }},
        { $unwind: { path: "$employee_dateils", preserveNullAndEmptyArrays: true }},
        { $project: {
            emp_id: "$employee_dateils.emp_id",
            first_name: "$employee_dateils.name",
            last_name: "$employee_dateils.last_name",
            email: "$employee_dateils.email", 
            employee_id:'$employee_dateils._id',  
            leave_date: "$leave_start_date",
            leave_type: "$leave_type",
            leave_status:'$leave_status',      
            reason:"$reason",
            type:{"$arrayElemAt":["$approvers_dateils.type",0]},
            approvel_id:{"$arrayElemAt":["$approvers_dateils._id",0]},
            leave_id:'$_id',
            leave_short_name:"$leave_data.short_name",
            is_cancel:"$is_cancel",
            approvers_status:{"$arrayElemAt":["$approvers_dateils.action_type",0]}
          }},
    ])
    if (getLeaveData.length) {
        res.data = getLeaveData.length;
    } else {
        res.status = false;
    }
    return res;
} 

const getLeaveApplication = async(filter)=>{
    const res = getServiceResFormat();
    let db = getDb()
    const leaveApplicationModel = leaveApplicationSchema(db);
    const record = await leaveApplicationModel.aggregate([
        {"$match":filter},
        {"$lookup":{
            from:'leave_types',
            localField:'leave_type',
            foreignField:"_id",
            as:"leave_type_details"
        }},
        {
            "$set":{
                leave_type_name:{"$arrayElemAt":["$leave_type_details.name",0]},
            }
        },
        {
            "$project":{
                leave_type_details:0
            }
        }
    ]);
    if(record && record.length){
        res.data = record;
    }else{
        res.status = false;
    }
    return res;
}

const getAnnouncement = async(filter)=>{
    const res = getServiceResFormat();
    let db = getDb()
    const postModel = postSchema(db);
    const record = await postModel.find(filter)
    if(record && record.length){
        res.data = record
    }else{
        res.status = false
    }
    return res
}






module.exports = {
    getAttendanceCorrectionRequest,
    getEmpAppliedLeave,
    getLeaveApplication,
    getAnnouncement
}