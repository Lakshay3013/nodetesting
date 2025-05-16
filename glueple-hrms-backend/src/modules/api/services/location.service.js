const locationSchema = require('../../../models/location.model');
const countriesSchema = require('../../../models/countries.model');
const statesSchema = require('../../../models/states.model');
const citiesSchema = require('../../../models/cities.model');
const { getServiceResFormat, getAggregatePagination, getDb } = require('../utils/appHelper');
const attendanceLocationSchema = require('../../../models/attenadnceLocation.model');
const attendanceEmployeeLocationSchema = require('../../../models/attendanceEmployeeLocation.model');
const mongoose = require('mongoose');

const createLocation = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await locationSchema(db).create(data);
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const queryLocation = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const totalRecords = await locationSchema(db).find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await locationSchema(db).aggregate([
        { "$match": filter },
        {
            "$lookup": {
                from: "countries",
                localField: "country",
                foreignField: "_id",
                as: "country_name",
            }
        },
        {
            "$lookup": {
                from: "states",
                localField: "state",
                foreignField: "_id",
                as: "state_name",
            }
        },
        {
            "$lookup": {
                from: "cities",
                localField: "city",
                foreignField: "_id",
                as: "city_name",
            }
        },
        {
            "$set":
            {
                country_name: { "$arrayElemAt": ["$country_name.name", 0] },
                state_name: { "$arrayElemAt": ["$state_name.name", 0] },
                city_name: { "$arrayElemAt": ["$city_name.name", 0] },
            }
        },
        options?.skips,
        options?.limits
    ])
        .allowDiskUse();
    const queryRes = {
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        totalPages: options?.totalPages,
        data: records
    }
    if (queryRes && queryRes?.data?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const updateLocation = async (filter, update) => {
    let db = getDb()
    const queryRes = await locationSchema(db).findOneAndUpdate(filter, update, { new: true });
    if (queryRes?._id) {
        queryRes.data = queryRes;
    } else {
        queryRes.status = false;
    }
    return queryRes;
}

const deleteLocation = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await locationSchema(db).findOneAndDelete(filter);
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const getLocationDataList = async (condition) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await locationSchema(db).aggregate([
        { "$match": condition },
        {
            "$set":
            {
                label: "$name",
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
}

const saveData = async (data) => {
    let db = getDb()
    let bulk = citiesSchema(db).collection.initializeUnorderedBulkOp();
    for (let i = 0; i < data?.length; i++) {
        bulk.insert(data[i]);
    }
    bulk.execute();
};

const getAllCountryList = async (condition) => {
    let db = getDb()
    const res = getServiceResFormat();
    const queryRes = await countriesSchema(db).aggregate([
        { "$match": condition },
        {
            "$set":
            {
                label: "$name",
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

const getAllStateFromCountryList = async (filter) => {
    let db = getDb()
    const res = getServiceResFormat();
    const queryRes = await statesSchema(db).aggregate([
        { "$match": filter },
        {
            "$set":
            {
                label: "$name",
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

const getCityListFromState = async (filter) => {
    let db = getDb()
    const res = getServiceResFormat();
    const queryRes = await citiesSchema(db).aggregate([
        { "$match": filter },
        {
            "$set":
            {
                label: "$name",
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

const addAttendanceLocation = async(data)=>{
    let db = getDb()
    const res = getServiceResFormat()
    const queryRes = await attendanceLocationSchema(db).create(data);
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;

}

const getAttendanceLocation = async(filter)=>{
    let db = getDb()
    const res = getServiceResFormat();
    const queryRes = await attendanceLocationSchema(db).aggregate([
        { "$match": filter },
        {
            "$set":
            {
                label: "$name",
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

}

const addEmployeeLocation = async(data)=>{
    let db = getDb()
    const res = getServiceResFormat()
    const queryRes = await attendanceEmployeeLocationSchema(db).create(data);
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;

}
const BulkUploadLocation = async(location, employee_details)=>{
    let db = getDb()
    let bulk = attendanceEmployeeLocationSchema(db).collection.initializeUnorderedBulkOp();
    for (let i = 0; i < employee_details?.length; i++) {
        const item = employee_details[i];
        bulk.find({ employee_id: item.employee_id}).upsert().updateOne({ $set: {...item,location_id:mongoose.Types.ObjectId(location)} });
    }
    bulk.execute(async (err, result) => {
        if (result) {
            res.data = result;
        } else {
            res.status = false;
        }
    });
    return res;

}

const getAllCity = async(filter)=>{
    let db = getDb()
    const res = getServiceResFormat();
    const queryRes = await citiesSchema(db).aggregate([
        { "$match": filter },
        {
            "$set":
            {
                label: "$name",
                value: "$_id",
            }
        },
    ]).allowDiskUse();
    if(queryRes && queryRes.length){
        res.data = queryRes
    }else{
        res.status = false
    }
    return res;
}

module.exports = {
    createLocation,
    queryLocation,
    updateLocation,
    deleteLocation,
    getLocationDataList,
    saveData,
    getAllCountryList,
    getAllStateFromCountryList,
    getCityListFromState,
    addAttendanceLocation,
    getAttendanceLocation,
    addEmployeeLocation,
    BulkUploadLocation,
    getAllCity
};