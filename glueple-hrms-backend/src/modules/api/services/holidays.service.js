const mongoose = require('mongoose');
const holidayModelSchema = require('../../../models/holidays.model');
const { getServiceResFormat, getDb } = require('../utils/appHelper');

const createHolidays = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await holidayModelSchema(db).create(data);
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const queryGetHoliday = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await holidayModelSchema(db).aggregate([
        { "$match": filter },

        {
            "$set":
            {
                country_name: { "$arrayElemAt": ["$country_name.name", 0] },
                state_name: { "$arrayElemAt": ["$state_name.name", 0] },
                city_name: { "$arrayElemAt": ["$city_name.name", 0] },
                branch_name: { "$arrayElemAt": ["$branch_name.branch_name", 0] },
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

const updateHoliday = async (filter, update) => {
    let db = getDb()
    const existData = await queryGetHoliday({ $or: [{ name: update?.name }] }, {});
    if (existData?.status) {
        const filteredName = existData?.data?.filter((item) => (item?.name == update?.name && item?._id != update?._id));
        if (filteredName && filteredName?.length > 0) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Holiday Name already exists.');
        }
    }
    const queryRes = await holidayModelSchema(db).findOneAndUpdate(filter, { $set: update }, { new: true });
    if (queryRes?._id) {
        queryRes.data = queryRes;
    } else {
        queryRes.status = false;
    }
    return queryRes;
};

const deleteHoliday = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    const queryRes = await holidayModelSchema(db).findOneAndDelete(filter);
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}

const queryHolidays = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
    filter = filter?.country ? { ...filter, country: mongoose.Types.ObjectId(filter?.country) } : filter;
    filter = filter?.state ? { ...filter, state: mongoose.Types.ObjectId(filter?.state) } : filter;
    filter = filter?.city ? { ...filter, city: mongoose.Types.ObjectId(filter?.city) } : filter;
    const queryRes = await holidayModelSchema(db).find(filter);
    if (queryRes && queryRes?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const bulkUploadHoliday = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    let bulk = holidayModelSchema(db).collection.initializeUnorderedBulkOp();
    for (let i = 0; i < data?.length; i++) {
        const item = data[i];
        bulk.find({ name: item.name, from_date:item.from_date}).upsert().updateOne({ $set: item });
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

module.exports = {
    createHolidays,
    queryGetHoliday,
    updateHoliday,
    deleteHoliday,
    queryHolidays,
    bulkUploadHoliday,
}