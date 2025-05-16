const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const { emailTemplateService } = require('../services');
const { successResponse, errorResponse } = require('../../../helpers');
const { messages } = require('../../../config/constants.js');
const { getSessionData } = require('../utils/appHelper.js');
const path = require('path')
const {removeFile} = require('../../../helpers/fileHandler');


const createTempate = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    req.body['created_by'] = user?.id;
    const emailTemplateData = await emailTemplateService.createEmailTemplate(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, emailTemplateData, httpStatus.OK);
});

const getEmailTemplate = catchAsync(async(req, res)=>{
    const {parmas } = req.query
    const emailTypeData = await emailTemplateService.getEmailTemplates({},parmas);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, emailTypeData,  httpStatus.OK);
})

const createEmailType = catchAsync(async(req, res)=>{
    const user = getSessionData(req)
    req.body['created_by'] = user?.id;
    const emailtypeData = await emailTemplateService.createEmailType(req.body)
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, emailtypeData, httpStatus.OK)
})

const getEmailtype = catchAsync(async(req, res)=>{
    const {parmas } = req.query
    const emailTypeData = await emailTemplateService.queryEmailType({},parmas);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, emailTypeData,  httpStatus.OK);
})

const updateEmailTemplate = catchAsync(async (req, res) => {
    const UpdateData = await emailTemplateService.UpdateEmailTemplate({_id: req.body._id}, {$set: req.body});
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, UpdateData,  httpStatus.OK);
  });
  
  const deleteEmailTemplate = catchAsync(async (req, res) => {
    const DeleteData = await emailTemplateService.deleteEmailTemplate({_id: req.body._id});
      return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, DeleteData,  httpStatus.OK);
  });


  const AddTemplate = catchAsync(async (req, res) => {
    let Baseurl = `${process.env.BASEURL}/templateImage/${req?.file?.filename}`
    const ImageData ={ 
        urls: {
        "default": Baseurl,
        "800": Baseurl,
        "1024": Baseurl,
        "1920": Baseurl}
    };
    res.send(ImageData)
    
    // return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, ImageData,  httpStatus.OK);
});

const removeTemplateImage = catchAsync(async(req, res)=>{
    const {url} = req.body
    let file_names = url?.split('/')
    console.log("sfsdf",url)
    if(file_names.length){
       removeFile({directory:"./public/templateImage/", file_name: file_names[4]})
    }
    return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, "Remove Image Successfully" ,httpStatus.OK);
})

const AddActionTempate = catchAsync(async (req, res) => {
    const user = getSessionData(req);
    req.body['created_by'] = user?.id;
    // console.log("sdfsdfsfsfsdfsdf", req.body)
    const emailTemplateData = await emailTemplateService.createEmailTemplateAction(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, emailTemplateData, httpStatus.OK);
});

const updateActionTemplate = catchAsync(async (req, res) => {
    const UpdateData = await emailTemplateService.UpdateActionTemplate({_id: req.body._id}, {$set: req.body});
    return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, UpdateData,  httpStatus.OK);
  });

  const getActionTemaplate = catchAsync(async(req, res)=>{
    const {parmas } = req.query
    const emailTypeData = await emailTemplateService.getEmailTemplatesAction({},parmas);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, emailTypeData,  httpStatus.OK);
})

const deleteActionTemplate = catchAsync(async (req, res) => {
    const DeleteData = await emailTemplateService.deleteActionTemplate({_id: req.body._id});
      return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, DeleteData,  httpStatus.OK);
  });

const getEmailActionType = catchAsync(async(req, res)=>{
    const {parmas } = req.query
    const emailTypeData = await emailTemplateService.getEmailActionType({},parmas);
    return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, emailTypeData,  httpStatus.OK);
})

const AddActionType = catchAsync(async(req, res)=>{
    const emailTemplateData = await emailTemplateService.AddActionType(req.body);
    return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, emailTemplateData, httpStatus.OK);
})

module.exports = {
    createTempate,
    createEmailType,
    getEmailtype,
    getEmailTemplate,
    updateEmailTemplate,
    deleteEmailTemplate,
    AddTemplate,
    removeTemplateImage,
    AddActionTempate,
    updateActionTemplate,
    getActionTemaplate,
    getEmailActionType,
    AddActionType,
    deleteActionTemplate,
  };