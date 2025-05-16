const { adminDropDown } = require('../../../config/constants');
const catchAsync = require('../../../helpers/catchAsync');
const { clientService } = require('../../admin/services');
const path = require('path');
const {clientPermissionService} = require('../services')

const getDashboard = catchAsync(async (req, res) => {
  res.render('pages/dashboard', {
    success: res.locals.flashSuccess || undefined,
    error: res.locals.flashError || undefined,
  });
});

const getProfile = catchAsync(async (req, res) => {
  res.render('pages/profile', {
    success: res.locals.flashSuccess || undefined,
    error: res.locals.flashError || undefined,
  });
});

const getIcons = catchAsync(async (req, res) => {
  res.render('pages/icons', {
    success: res.locals.flashSuccess || undefined,
    error: res.locals.flashError || undefined,
  });
});

const getMaps = catchAsync(async (req, res) => {
  res.render('pages/maps', {
    success: res.locals.flashSuccess || undefined,
    error: res.locals.flashError || undefined,
  });
});

const getLogin = catchAsync(async (req, res) => {
  res.render('pages/login', {
    success: res.locals.flashSuccess || undefined,
    error: res.locals.flashError || undefined,
  });
});

const getRegister = catchAsync(async (req, res) => {
  res.render('pages/register', {
    success: res.locals.flashSuccess || undefined,
    error: res.locals.flashError || undefined,
  });
});

const getTables = catchAsync(async (req, res) => {
  res.render('pages/tables', {
    success: res.locals.flashSuccess || undefined,
    error: res.locals.flashError || undefined,
  });
});

const getError = catchAsync(async (req, res) => {
  res.render('pages/404', {
    success: res.locals.flashSuccess || undefined,
    error: res.locals.flashError || undefined,
  });
});

const getResetPass = catchAsync(async (req, res) => {
  res.render('pages/reset-password', {
    success: res.locals.flashSuccess || undefined,
    error: res.locals.flashError || undefined,
  });
});

const onboardClient = catchAsync(async (req, res) => {
  res.render('pages/onboard-client', {
    success: res.locals.flashSuccess || undefined,
    error: res.locals.flashError || undefined,
    adminDropDown:adminDropDown
  });
});

const getAllClient = catchAsync(async (req, res) => {
  const getAllClient = await clientService.getAllClient({})
  console.log("getAllClient",getAllClient)
  res.render('pages/all-client', {
    success: res.locals.flashSuccess || undefined,
    error: res.locals.flashError || undefined,
    getAllClient
  });
});

const editClient = catchAsync(async(req,res)=>{
  const {id} = req.params
  const getClient = await clientService.getClient({_id:id})
  res.render('pages/edit-onboard-client', {
    success: res.locals.flashSuccess || undefined,
    error: res.locals.flashError || undefined,
    clientData:getClient,
    adminDropDown:adminDropDown
  });
})

const viewClient = catchAsync(async(req, res)=>{
  const {id}= req.params
  const getClient = await clientService.getClient({_id:id})
  res.render('pages/view-client', {
    success: res.locals.flashSuccess || undefined,
    error: res.locals.flashError || undefined,
    clientData: getClient,
    adminDropDown:adminDropDown
  });
})

const communications = catchAsync(async(req, res)=>{
  res.render('pages/communication', {
    success: res.locals.flashSuccess || undefined,
    error: res.locals.flashError || undefined,
  });
})

const getClientAccess = catchAsync(async (req, res) => {
   const getPermission = await clientPermissionService.getClientPermission({
      permission_type: "menu",
      is_active: true
    })
    const getClientPermission = await clientPermissionService.getAccessControl({})
  res.render('pages/client-access', {
    success: res.locals.flashSuccess || undefined,
    error: res.locals.flashError || undefined,
    getPermission:getPermission,
    selectedPermissions:getClientPermission || []
  });
});




module.exports = {
  getDashboard,
  getProfile,
  getIcons,
  getMaps,
  getTables,
  getLogin,
  getError,
  getRegister,
  getResetPass,
  onboardClient,
  getAllClient,
  editClient,
  viewClient,
  communications,
  getClientAccess
};
