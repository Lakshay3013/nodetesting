const emailTemplateSchema = require('../../../models/emailTemplate.model');
const emailTypeSchema = require('../../../models/emailType.model')
const emailTemplateActionSchema = require('../../../models/emailTemplateAction.model')
const emailTemplateActionTypeSchema = require('../../../models/emailTemplateActionType.model')
const httpStatus = require('http-status');
const ApiError = require('../../../helpers/ApiError');
const { getServiceResFormat ,getAggregatePagination, getDb} = require('../utils/appHelper');


const createEmailTemplate = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
    const emailTemplateModel = emailTemplateSchema(db);
    const existData = await getEmailTemplates({template_name:data?.template_name }, {});
    if (existData && existData?.status) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email Template already exists.');
    }
    const queryRes = await emailTemplateModel.create(data);
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const getEmailTemplates = async(filter,options)=>{
    const res = getServiceResFormat();
      let db = getDb()
  const emailTemplateModel = emailTemplateSchema(db);
    const totalRecords =  await emailTemplateModel.find(filter).count();
    const limits = getAggregatePagination(options, totalRecords);
    const records = await emailTemplateModel.find(filter,{},limits).allowDiskUse();
    const queryRes = {
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        totalPages: limits?.totalPages,
        data: records
    }
    if(queryRes && queryRes?.data?.length){
        res.data = queryRes;
    }else{
        res.status = false;
    }
    return res;

}

const UpdateEmailTemplate = async (filter, update) => {
      let db = getDb()
  const emailTemplateModel = emailTemplateSchema(db);
    const queryRes = await emailTemplateModel.findOneAndUpdate(filter, update, {new: true});
    if(queryRes?._id){
        queryRes.data = queryRes;
    }else{
        queryRes.status = false;
    }
    return queryRes;
}

const deleteEmailTemplate = async (filter) => {
      let db = getDb()
  const emailTemplateModel = emailTemplateSchema(db);
    const queryRes = await emailTemplateModel.findOneAndDelete(filter);
    if(queryRes?._id){
        queryRes.data = queryRes;
    }else{
        queryRes.status = false;
    }
    return queryRes;
}


const getEmailTemplateById = async(filter)=>{
    const res = getServiceResFormat();
      let db = getDb()
  const emailTemplateModel = emailTemplateSchema(db);
    const queryRes = await emailTemplateModel.findOne(filter);
    if(queryRes?._id){
        res.data = queryRes;
    }else{
        res.status = false;
    }
    
}

const createEmailType = async(data)=>{
    const res = getServiceResFormat();
      let db = getDb()
  const emailTypeModele = emailTypeSchema(db);
    const existData = await queryEmailType({name:data.name},{})
    if (existData && existData?.status) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email Type Name already exists.');
    }
    const queryRes = await emailTypeModele.create(data);
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;

}
const queryEmailType = async(filter,options)=>{
    const res = getServiceResFormat();
     let db = getDb()
  const emailTypeModele = emailTypeSchema(db);
    const start = options?.page ? (options?.page-1) * options?.limit : 0; 
    const limits = options ? { skip: start, limit: parseInt(options?.limit) } : {skip: 0, limit: parseInt(options?.limit)};
    const totalRecords =  await emailTypeModele.find(filter).count();
    const records = await emailTypeModele.find(filter,{},limits).allowDiskUse();
    const queryRes = {
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        data: records
    }
    if(queryRes && queryRes?.data?.length){
        res.data = queryRes;
    }else{
        res.status = false;
    }
    return res;

}

const createEmailTemplateAction = async (data) => {
    const res = getServiceResFormat();
     let db = getDb()
  const emailTemplateActionModel = emailTemplateActionSchema(db);
    const existData = await getEmailTemplatesAction({action_name:data?.action_name }, {});
    if (existData && existData?.status) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email Template already exists.');
    }
    const queryRes = await emailTemplateActionModel.create(data);
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};


const getEmailTemplatesAction = async(filter,options)=>{
    const res = getServiceResFormat();
      let db = getDb()
  const emailTemplateActionModel = emailTemplateActionSchema(db);
    const totalRecords =  await emailTemplateActionModel.find(filter).count();
    const limits = getAggregatePagination(options, totalRecords);
    const records = await emailTemplateActionModel.find(filter,{},limits).allowDiskUse();
    const queryRes = {
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        totalPages: limits?.totalPages,
        data: records
    }
    if(queryRes && queryRes?.data?.length){
        res.data = queryRes;
    }else{
        res.status = false;
    }
    return res;

}


const UpdateActionTemplate = async (filter, update) => {
      let db = getDb()
  const emailTemplateActionModel = emailTemplateActionSchema(db);
    const queryRes = await emailTemplateActionModel.findOneAndUpdate(filter, update, {new: true});
    if(queryRes?._id){
        queryRes.data = queryRes;
    }else{
        queryRes.status = false;
    }
    return queryRes;
}

const deleteActionTemplate = async (filter) => {
      let db = getDb()
  const emailTemplateActionModel = emailTemplateActionSchema(db);
    const queryRes = await emailTemplateActionModel.findOneAndDelete(filter);
    if(queryRes?._id){
        queryRes.data = queryRes;
    }else{
        queryRes.status = false;
    }
    return queryRes;
}

const AddActionType= async (data) => {
    const res = getServiceResFormat();
      let db = getDb()
  const emailTemplateActiontypeModel = emailTemplateActionTypeSchema(db);
    const existData = await getEmailActionType({action_name:data?.action_name }, {});
    if (existData && existData?.status) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Action Type already exists.');
    }
    const queryRes = await emailTemplateActiontypeModel.create(data);
    if (queryRes?._id) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
};

const getEmailActionType = async(filter,options)=>{
    const res = getServiceResFormat();
    let db = getDb()
    const emailTemplateActiontypeModel = emailTemplateActionTypeSchema(db);
    const totalRecords =  await emailTemplateActiontypeModel.find(filter).count();
    const limits = getAggregatePagination(options, totalRecords);
    const records = await emailTemplateActiontypeModel.find(filter,{},limits).allowDiskUse();
    const queryRes = {
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        totalPages: limits?.totalPages,
        data: records
    }
    if(queryRes && queryRes?.data?.length){
        res.data = queryRes;
    }else{
        res.status = false;
    }
    return res;

}



module.exports = {
    createEmailTemplate,
    getEmailTemplates,
    createEmailType,
    getEmailTemplateById,
    queryEmailType,
    UpdateEmailTemplate,
    deleteEmailTemplate,
    createEmailTemplateAction,
    UpdateActionTemplate,
    getEmailTemplatesAction,
    deleteActionTemplate,
    getEmailActionType,
    AddActionType
};