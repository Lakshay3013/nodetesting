const createShiftModelSchema = require('../../../models/createShift.model');
const shiftCalendarSchema = require('../../../models/shiftCalendar.model');
const shiftAssignSchema = require('../../../models/shiftAssign.model');
const employeeSchema = require('../../../models/employee.model');
const weekOffAssignSchema = require('../../../models/weekOff.model')
const httpStatus = require('http-status');
const ApiError = require('../../../helpers/ApiError');
const { getServiceResFormat, getAggregatePagination, getDb } = require('../utils/appHelper');
const { convertDateByMoment } = require('../utils/dateTimeHelper')
const mongoose = require('mongoose');
const moment = require('moment');
const { messages } = require('../../../config/constants');


const createShift = async (data) => {
  const res = getServiceResFormat();
  let db = getDb()
  const existData = await getAllShift({ shift_code: data?.shift_code });
  if (existData && existData?.status) {
    throw new ApiError(httpStatus.BAD_REQUEST, messages.alert.SHIFT_CODE_ALREADY);
  }
  const queryRes = await createShiftModelSchema(db).create(data);
  if (queryRes?._id) {
    res.data = queryRes;
  } else {
    res.status = false;
  }
  return res;
};

const getShift = async (filter, options) => {
  const res = getServiceResFormat();
  let db = getDb()
  const totalRecords = await createShiftModelSchema(db).find(filter).count();
  const limits = getAggregatePagination(options, totalRecords);
  const records = await createShiftModelSchema(db).find(filter, {}, limits).allowDiskUse();
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
}

const getAllShift = async (filter) => {
  const res = getServiceResFormat();
  let db = getDb()
  const query = await createShiftModelSchema(db).find(filter);
  if (query.length) {
    res.data = query;
  } else {
    res.status = false;
  }
  return res;

}

const getShiftById = async (filter) => {
  const res = getServiceResFormat();
  let db = getDb()
  const getShift = await createShiftModelSchema(db).findOne(filter)
  if (getShift?._id) {
    res.data = getShift
  } else {
    res.status = false
  }
  return res;
}

const UpdateShift = async (filter, update) => {
  const res = getServiceResFormat();
  let db = getDb()
  const queryRes = await createShiftModelSchema(db).findOneAndUpdate(filter, update, { new: true });
  if (queryRes?._id) {
    res.data = queryRes;
  } else {
    res.status = false;
  }
  return res;
}

const deleteShift = async (filter) => {
  const res = getServiceResFormat();
  let db = getDb()
  const queryRes = await createShiftModelSchema(db).findOneAndDelete(filter);
  if (queryRes?._id) {
    res.data = queryRes;
  } else {
    res.status = false;
  }
  return res;
}

const isActiveOrInAction = async (filter, update) => {
  const res = getServiceResFormat();
  let db = getDb()
  const updates = await createShiftModelSchema(db).findByIdAndUpdate(filter, update, { new: true })
  if (update.is_active == false) {
    const deleteData = await shiftAssignSchema(db)(db).deleteMany({ shift_id: filter._id })
  }
  if (updates?._id) {
    res.data = updates;
  } else {
    res.status = false;
  }
  return res;
}

const createShiftConfiguration = async (data) => {
  const res = getServiceResFormat();
  let db = getDb()
  const queryRes = await createShiftModelSchema(db).findOneAndUpdate({ _id: data.shift_id }, data, { new: true });
  // const getShiftdata = await shiftConfigurationModel.find({shift_id:data.shift_id})
  // let queryRes = null
  // if(!getShiftdata?.length){
  //     queryRes = await shiftConfigurationModel.create(data);
  // }else{
  //     queryRes = await shiftConfigurationModel.findOneAndUpdate({shift_id:data.shift_id},data,{new: true});
  // }
  if (queryRes?._id) {
    res.data = queryRes;
  } else {
    res.status = false;
  }
  return res;

}

const getShiftConfigurationByShiftId = async (id) => {
  const res = getServiceResFormat();
  let db = getDb()
  id = id ? mongoose.Types.ObjectId(id) : '';
  const getShiftdata = await createShiftModelSchema(db).aggregate([
    {
      "$match": { _id: id }
    },
    {
      "$lookup": {
        from: "shift_configurations",
        localField: "_id",
        foreignField: "shift_id",
        as: "shift_data"
      }
    },
    {
      $unwind: { path: "$shift_data", preserveNullAndEmptyArrays: true }
    },
  ]).allowDiskUse()
  if (getShiftdata[0]?._id) {
    res.data = getShiftdata;
  } else {
    res.status = false;
  }
  return res;
}

const addCalendar = async (data) => {
  const res = getServiceResFormat();
  let db = getDb()
  const addCalendarData = await shiftCalendarSchema(db).create(data)
  if (addCalendarData?._id) {
    res.data = addCalendarData;
  } else {
    res.status = false;
  }
  return res;
}

const getShiftCalendar = async (filter, options) => {
  const res = getServiceResFormat();
  let db = getDb()
  if (Object.keys(options).length !== 0) {
    const totalRecords = await shiftCalendarSchema(db).find(filter).count();
    const limits = getAggregatePagination(options, totalRecords);
    const records = await shiftCalendarSchema(db).find(filter, {}, limits).allowDiskUse();
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
  } else {
    const records = await shiftCalendarSchema(db).find(filter).allowDiskUse();
    if (records && records.length) {
      res.data = records
    } else {
      res.status = false
    }
  }
  return res;

}

const updateShiftCalendar = async (filter, update) => {
  let db = getDb()
  const queryRes = await shiftCalendarSchema(db).findOneAndUpdate(filter, update, { new: true });
  if (queryRes?._id) {
    queryRes.data = queryRes;
  } else {
    queryRes.status = false;
  }
  return queryRes;

}

const deleteShiftCalendar = async (filter) => {
  let db = getDb()
  const queryRes = await shiftCalendarSchema(db).findOneAndDelete(filter);
  if (queryRes?._id) {
    queryRes.data = queryRes;
  } else {
    queryRes.status = false;
  }
  return queryRes;
}
const shiftAssignTemporaryOrMonthly = async (data) => {
  const res = getServiceResFormat();
  let db = getDb()
  const { shift_id, employee_id, shiftDateRange, assignment_type, created_by } = data
  var bulk = shiftAssignSchema(db)(db).collection.initializeUnorderedBulkOp();
  const currentDate = moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ')
  for (let i = 0; i < employee_id.length; i++) {
    const employeeId = employee_id[i]
    for (let j = 0; j < shiftDateRange.length; j++) {
      let shiftDate = shiftDateRange[j].date
      let item = {
        employee_id: mongoose.Types.ObjectId(employeeId),
        shift_id: mongoose.Types.ObjectId(shift_id),
        start_date: shiftDate,
        end_date: shiftDate,
        assignment_type: assignment_type,
        created_by: mongoose.Types.ObjectId(created_by),
        created_at: currentDate
      }
      bulk.find({ employee_id: item.employee_id, start_date: item.start_date, assignment_type: item.assignment_type }).upsert().updateOne({ $set: item, $setOnInsert: { updated_at: currentDate } });
    }
  }
  bulk.execute(async (err, result) => {
    if (result) {
      res.data = result
    } else {
      res.status = false
    }
  });
}

const shiftAssign = async (data) => {
  const res = getServiceResFormat();
  let db = getDb()
  let { employee_id } = data
  let findAllShiftData = await shiftAssignSchema(db)(db).find({})
  let alreadyExist = [];
  for (let i = 0; i < employee_id.length; i++) {
    let employeeId = employee_id[i]
    let findExisting = findAllShiftData.filter(item => item.employee_id == employeeId)
    if (!findExisting.length) {
      data['employee_id'] = employeeId
      await shiftAssignSchema(db)(db).create(data);
    } else {
      alreadyExist.push(employeeId);
    }
  }
  if (alreadyExist.length > 0) {
    let result = await employeeSchema(db).aggregate([
      {
        $match: { _id: { $in: alreadyExist.map(id => mongoose.Types.ObjectId(id)) } }
      },
      {
        $lookup: {
          from: 'shift_assigns',
          localField: '_id',
          foreignField: 'employee_id',
          as: 'shiftDetails'
        }
      },
      { $unwind: "$shiftDetails" },
      {
        $lookup: {
          from: 'shift_details',
          localField: 'shiftDetails.shift_id',
          foreignField: '_id',
          as: 'shiftInfo'
        }
      },
      { $unwind: "$shiftInfo" },
      {
        $project: {
          emp_id: 1,
          name: 1,
          last_name: 1,
          email: 1,
          'shiftInfo.shift_name': 1
        }
      }
    ]);
    res.data = result
  } else {
    res.data = []
  }
  return res
}

const getEmployeeByShiftId = async (data) => {
  const res = getServiceResFormat();
  let db = getDb()
  const { shift_id } = data
  let result = await shiftAssignSchema(db)(db).aggregate([
    {
      $match: { shift_id: mongoose.Types.ObjectId(shift_id) }
    },
    {
      $lookup: {
        from: 'employees',
        localField: 'employee_id',
        foreignField: '_id',
        as: 'employeeDetails'
      }
    },
    { $unwind: "$employeeDetails" },
    {
      $lookup: {
        from: 'shift_details',
        localField: 'shift_id',
        foreignField: '_id',
        as: 'shiftInfo'
      }
    },
    { $unwind: "$shiftInfo" },
    {
      $lookup: {
        from: 'weekoff_assigns',
        localField: 'employeeDetails._id',
        foreignField: 'employee_id',
        as: 'weekoffInfo'
      }
    },
    { $unwind: { path: "$weekoffInfo", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        emp_id: '$employeeDetails.emp_id',
        employee_id: '$employeeDetails._id',
        name: '$employeeDetails.name',
        last_name: '$employeeDetails.last_name',
        email: '$employeeDetails.email',
        shift_name: '$shiftInfo.shift_name',
        weekoff: '$weekoffInfo.number_of_week'
      }
    }
  ]).allowDiskUse(true);
  if (result && result?.length) {
    res.data = result;
  } else {
    res.status = false;
  }
  return res;
}

const addWeekOff = async (data, user) => {
  const res = getServiceResFormat();
  let db = getDb()
  var bulk = weekOffAssignSchema(db).collection.initializeUnorderedBulkOp();
  for (let i = 0; i < data.length; i++) {
    let item = {
      employee_id: mongoose.Types.ObjectId(data[i].employee_id),
      number_of_week: data[i].week_off,
      day_of_week: data[i]?.week_off?.map(index => moment().isoWeekday(index).format('dddd')),
      created_by: mongoose.Types.ObjectId(user)
    }
    bulk.find({ employee_id: item.employee_id }).upsert().updateOne({ $set: item });
  }
  bulk.execute(async (err, result) => {
    if (result) {
      res.data = result
    } else {
      res.status = false
    }
  });
  return res
}

const getEmployeeDetailss = async (id) => {
  const res = getServiceResFormat();
  let db = getDb()
  const matchCondition = id ? { _id: mongoose.Types.ObjectId(id) } : {}
  const getShift = await createShiftModelSchema(db).aggregate([
    { $match: matchCondition },
    {
      $lookup: {
        from: 'shift_assigns',
        localField: '_id',
        foreignField: 'shift_id',
        as: 'shiftDetails'
      }
    },
    { $unwind: { path: "$shiftDetails", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'employees',
        localField: 'shiftDetails.employee_id',
        foreignField: '_id',
        as: 'employeeDetails'
      }
    },
    { $unwind: { path: "$employeeDetails", preserveNullAndEmptyArrays: true } },
    { $match: { "employeeDetails.account_status": 'active' } },
    {
      $project: {
        emp_id: "$employeeDetails.emp_id",
        first_name: "$employeeDetails.name",
        last_name: "$employeeDetails.last_name",
        email: "$employeeDetails.email",
        shift_name: "$shift_name",
        shift_start_time: "$shift_start_time",
        shift_end_time: "$shift_end_time",
        break_start_time: "$break_start_time",
        break_end_time: "$break_end_time",
        color: "$color",
        employee_id: "$employeeDetails._id"
      }
    },
    { $sort: { "employeeDetails.first_name": 1 } }
  ]);

  return getShift || [];
}

const getEmployeeDetails = async (id, start_date, end_date) => {
  let db = getDb()
  const matchCondition = id ? { _id: mongoose.Types.ObjectId(id) } : {};
  const shift_start_date = {
    $gte: convertDateByMoment(start_date, "YYYY-MM-DD"),
    $lte: convertDateByMoment(end_date, "YYYY-MM-DD"),
  }
  const getShift = await createShiftModelSchema(db).aggregate([
    { $match: matchCondition },
    {
      $lookup: {
        from: 'shift_assigns',
        localField: '_id',
        foreignField: 'shift_id',
        as: 'shiftDetails',
      },
    },
    // { $match:  {'shiftDetails.start_date':shift_start_date}},
    { $unwind: { path: "$shiftDetails", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'employees',
        localField: 'shiftDetails.employee_id',
        foreignField: '_id',
        as: 'employeeDetails',
      },
    },
    { $unwind: { path: "$employeeDetails", preserveNullAndEmptyArrays: true } },
    { $match: { "employeeDetails.account_status": 'active' } },
    {
      $project: {
        emp_id: "$employeeDetails.emp_id",
        first_name: "$employeeDetails.name",
        last_name: "$employeeDetails.last_name",
        email: "$employeeDetails.email",
        shift_name: "$shift_name",
        shift_start_time: "$shift_start_time",
        shift_end_time: "$shift_end_time",
        break_start_time: "$break_start_time",
        break_end_time: "$break_end_time",
        color: "$color",
        employee_id: "$employeeDetails._id",
      },
    },

    // Group by employee_id to remove duplicates
    {
      $group: {
        _id: "$employee_id",
        emp_id: { $first: "$emp_id" },
        first_name: { $first: "$first_name" },
        last_name: { $first: "$last_name" },
        email: { $first: "$email" },
        shift_name: { $first: "$shift_name" },
        shift_start_time: { $first: "$shift_start_time" },
        shift_end_time: { $first: "$shift_end_time" },
        break_start_time: { $first: "$break_start_time" },
        break_end_time: { $first: "$break_end_time" },
        color: { $first: "$color" },

      },
    },

    { $sort: { first_name: 1 } },
  ]);

  return getShift || [];
};



const getAllShiftDetails = async (data) => {
  let db = getDb()
  const getShift = await createShiftModelSchema(db).aggregate([
    {
      $lookup: {
        from: 'shift_assigns',
        localField: '_id',
        foreignField: 'shift_id',
        as: 'assignsShiftDetails'
      }
    },
    { $unwind: { path: "$assignsShiftDetails", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'shift_calendars',
        localField: 'calendar_id',
        foreignField: '_id',
        as: 'calendarDetails'
      }
    },
    { $unwind: { path: "$calendarDetails", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'weekoff_assigns',
        localField: 'assignsShiftDetails.employee_id',
        foreignField: 'employee_id',
        as: 'weekOffDetails'
      }
    },
    { $unwind: { path: "$weekOffDetails", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        shift_name: "$shift_name",
        shift_start_time: "$shift_start_time",
        shift_end_time: "$shift_end_time",
        break_start_time: "$break_start_time",
        break_end_time: "$break_end_time",
        color: "$color",
        shift_code: "$shift_code",
        employee_id: "$assignsShiftDetails.employee_id",
        assignment_type: "$assignsShiftDetails.assignment_type",
        shift_start_date: "$assignsShiftDetails.start_date",
        shift_end_date: "$assignsShiftDetails.end_date",
        weekOffDetails: "$weekOffDetails",
        calendar_data: "$calendarDetails"

      }
    },
  ]);
  return getShift || []
}

const deleteEmployeeInShift = async (data) => {
  const res = getServiceResFormat();
  let db = getDb()
  const checkEmployeeId = await shiftAssignSchema(db)(db).find({ employee_id: mongoose.Types.ObjectId(data.employee_id) })
  if (!checkEmployeeId.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'employee Not found');
  }
  const deleteData = await shiftAssignSchema(db)(db).deleteOne({ employee_id: mongoose.Types.ObjectId(data.employee_id) })
  const deleteWeekoff = await weekOffAssignSchema(db).deleteOne({ employee_id: mongoose.Types.ObjectId(data.employee_id) })
  if (deleteData) {
    res.data = deleteData
  } else {
    res.status = false
  }
  return res
}

const getDefaultShiftData = async () => {
  const res = getServiceResFormat();
  let db = getDb()
  const getShiftData = await createShiftModelSchema(db).aggregate([
    {
      "$match": { is_active: true, is_default: true }
    },
    {
      "$lookup": {
        from: "shift_calendars",
        localField: "calendar_id",
        foreignField: "_id",
        as: "shift_week_offs"
      }
    },
    { "$unwind": "$shift_week_offs" }
  ]).allowDiskUse();
  if (getShiftData && getShiftData?.length) {
    res.data = getShiftData[0];
  } else {
    res.status = false;
  }
  return res;
}

const employeeDetailsInShift = async () => {
  const res = getServiceResFormat();

}

module.exports = {
  createShift,
  getShift,
  UpdateShift,
  deleteShift,
  isActiveOrInAction,
  createShiftConfiguration,
  getShiftConfigurationByShiftId,
  addCalendar,
  getShiftCalendar,
  updateShiftCalendar,
  deleteShiftCalendar,
  getShiftById,
  shiftAssign,
  getEmployeeByShiftId,
  addWeekOff,
  getEmployeeDetails,
  getAllShiftDetails,
  deleteEmployeeInShift,
  shiftAssignTemporaryOrMonthly,
  getDefaultShiftData,
  getAllShift,
};