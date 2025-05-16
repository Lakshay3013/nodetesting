const mediaFilesSchema = require('../../../models/mediaFiles.model');
const httpStatus = require('http-status');
const ApiError = require('../../../helpers/ApiError');
const { getServiceResFormat, getAggregatePagination, getDb } = require('../utils/appHelper');

const mediaFiles = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const mediaFilesData = await mediaFilesSchema(db).insertMany(data);
    console.log(mediaFilesData,"mediaFilesData.............")
    if (mediaFilesData?.length) {
        res.data = mediaFilesData;
    } else {
        res.status = false;
    }
    return res;
};



module.exports = {
    mediaFiles,
};