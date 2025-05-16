const httpStatus = require('http-status');
const adminService = require('../services/index.js');
const {userService,clientService,clientPermissionService} = require('../services/index.js');
const { ObjectId } = require('mongodb');
const { authenticatePass, verifyPassword } = require('../../../helpers');
const { signinTokenAdmin, signinToken } = require('../../../helpers/auth.js');
const { successResponse, errorResponse } = require('../../../helpers');
const { messages } = require('../../../config/constants.js');
const catchAsync = require('../../../helpers/catchAsync.js');
const config = require('../../../config/config.js');
const mongoose = require('mongoose');
const { Service } = require('aws-sdk');


const adminLogin = async (req, res) => {
    try {
        let { email, password } = req.body;
        email = email.toLowerCase();
        const filter = { email , is_active:true };
        const user = await userService.queryUsers(filter);
        if (!user) {
            return errorResponse(req, res, messages.alert.CRED_MSG, httpStatus.BAD_REQUEST);
        }
        let checkPassword = authenticatePass(user.password, password, user.salt);
        if (!checkPassword) {
            return errorResponse(req, res, messages.alert.CRED_MSG, httpStatus.BAD_REQUEST);
        }
        let token = signinTokenAdmin(email);
        return res.render('index');
        return successResponse(req, res, messages.alert.SUCCESS_LOGIN, {
            user: user, token: token, urlData: []
        });
    } catch (error) {
        console.log(error);
        return errorResponse(req, res, messages.alert.SERVER_LOGIN_ERR, error);
    }
};

const login = catchAsync(async (req, res) => {
    let { email, device_id, password } = req.body;
    console.log("email password", email, password);

    email = email.toLowerCase();
    const filter = { email, is_active: true };
    const user = await userService.getAdminProfile(filter);
    if (!user) {
        return res.render('pages/login', {
            success: res.locals.flashSuccess || undefined,
            error: messages.alert.CRED_MSG || 'Invalid credentials',
        });

    }

    if (!user.is_active) {
        return res.render('pages/login', {
            success: res.locals.flashSuccess || undefined,
            error: messages.alert.ACCOUNT_STATUS_ERR || 'Account is inactive',
        });
    }

    const userDetail = await userService.queryUsers(filter);
    if (userDetail.length == 0) {
        return res.render('pages/login', {
            success: res.locals.flashSuccess || undefined,
            error: messages.alert.CRED_MSG || 'Invalid credentials',
        });
    }

    const userData = userDetail[0];
    const checkPassword = await authenticatePass(password, userData.password, userData.salt);
    if (!checkPassword) {
        return res.render('pages/login', {
            success: res.locals.flashSuccess || undefined,
            error: messages.alert.CRED_MSG || 'Invalid credentials',
        });
    }

    const token = signinToken(email);
    req.session.authData = { user, token };

    req.session.save(function (err) {
        if (err) {
            console.error("Session save error:", err);
            return res.status(500).send("Session error");
        }
        return res.redirect('/administration/dashboard');
    });
});
  

const logout = async (req, res) => {
    try {
        const user = req.user;
        await userService.updateUserByFilter(new ObjectId(user._id), { token: "" });
        return successResponse(req, res, messages.alert.SUCCESS_LOGOUT, null);
    } catch (error) {
        console.log(error);
        return errorResponse(req, res, messages.alert.SERVER_MSG, error);
    }
}

const createAdmin = async (req, res) => {
    try {
        const { email,password,confirmPassword } = req.body;
        console.log("hello",req.body)
        let result = await userService.queryUsers({ email });
        if (result.length) {
            return errorResponse(req, res, messages.alert.EMAIL_ALREADY_EXISTS, httpStatus.BAD_REQUEST);
        }
        if(!(password == confirmPassword)){
            return errorResponse(req, res, messages.alert.CRED_NOT_MATCH, httpStatus.BAD_REQUEST);
        }
        // let doesExist = await userService.queryUsers({ is_admin: true });
        // if (doesExist.length) {
        //     return errorResponse(req, res, validationMessage.alert.ADMIN_ALREADY_EXISTS, httpStatus.BAD_REQUEST);
        // }
        let adminUser = await userService.createAdminUser(req.body);
            res.render('administration/login', {
                success: res.locals.flashSuccess || undefined,
                error: res.locals.flashError || undefined,
              });

        // return successResponse(req, res, messages.alert.ADMIN_CREATED, adminUser,httpStatus.OK);
    } catch (error) {
        console.log(error);
        return errorResponse(req, res, messages.alert.SERVER_MSG, error);
    }
}

const getProfile = async (req, res) => {
    try {
        const user = req.user;
        let adminProfileDetails = await adminService.getAdminProfile(new ObjectId(user._id));
        if (!adminProfileDetails) {
            return errorResponse(req, res, messages.alert.USER_NOT_FOUND, httpStatus.BAD_REQUEST);
        }
        return successResponse(req, res, messages.alert.ADMIN_CREATED, adminProfileDetails);
    } catch (error) {
        console.log(error);
        return errorResponse(req, res, messages.alert.SERVER_MSG, error);
    }
}

const getLoginRoute = async (req, res) => {
    try {
        return res.render('login.ejs');
    } catch (error) {
        console.log(error);
        return errorResponse(req, res, messages.alert.SERVER_MSG, error);
    }
}

const clientAccessRoute = async (req, res) => {
    try {
        return res.render('administration/clientAccess');
    } catch (error) {
        console.log(error);
        return errorResponse(req, res, messages.alert.SERVER_MSG, error);
    }
}


//client Controller
const createClient = catchAsync(async(req,res)=>{
    try {
        const { email } = req.body
        let result = await clientService.getAllClient({ email });
        if (result.length) {
            return errorResponse(req, res, messages.alert.EMAIL_ALREADY_EXISTS, httpStatus.BAD_REQUEST);
        }
         Object.entries(req.files).forEach(([key,value])=> {
                console.log(key,value[0].filename)
                req.body[key] =value[0].filename
            })
        const addClient = await clientService.createClient(req.body);
        if(addClient){
            return res.redirect('/administration/dashboard'); 
        }
        // return res.redirect('/administration/dashboard');
    } catch (error) {
        console.log("error", error)
        return res.render('pages/onboardClient', {
            success: res.locals.flashSuccess || undefined,
            error: messages.alert.SERVER_MSG,
        });
    }
})

const updateClient = catchAsync(async(req,res)=>{
    try {
        const id = req.params
        Object.entries(req.files).forEach(([key,value])=> {
            console.log(key,value[0].filename)
            req.body[key] =value[0].filename
        })
        const update = await clientService.updateClient({_id:mongoose.Types.ObjectId(id?.id)},req.body)
        if(update){
            return res.redirect('/administration/dashboard');
        }
        return
    } catch (error) {
        return res.render('pages/all-client', {
            success: res.locals.flashSuccess || undefined,
            error: messages.alert.SERVER_MSG,
        });
        
    }
})

const createPermission = catchAsync(async(req,res)=>{
    try {
    const addPermission = await clientPermissionService.createPermission(req.body)
      return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, addPermission,httpStatus.OK);
    } catch (error) {
        return errorResponse(req, res, messages.alert.SERVER_MSG, error);
        
    }
})

const addAccessControl = catchAsync(async(req, res)=>{
    try {
        const {client_id,permission_ids} = req.body
     let getClientAccess = await clientPermissionService.getAccessControl({collection_id:client_id});
     let accessControl = null
     if(getClientAccess.length){
        accessControl = await clientPermissionService.updateAccessControl({collection_id:client_id},{permission_ids:permission_ids})
     }else{
        accessControl = await clientPermissionService.createAccessControl({collection_id:client_id,permission_ids:permission_ids})
     }
     return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, accessControl,httpStatus.OK);
    } catch (error) {
        return errorResponse(req, res, messages.alert.SERVER_MSG, error);
    }
})

module.exports = {
    adminLogin,
    logout,
    createAdmin,
    getProfile,
    getLoginRoute,
    login,
    createClient,
    updateClient,
    clientAccessRoute,
    createPermission,
    addAccessControl
}