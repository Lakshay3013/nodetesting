const httpStatus = require('http-status');
const adminService = require('../services/index.js');
const {userService} = require('../services/index.js');
const { ObjectId } = require('mongodb');
const { authenticatePass } = require('../../../helpers');
const { signinTokenAdmin, signinToken } = require('../../../helpers/auth.js');
const { successResponse, errorResponse } = require('../../../helpers');
const { messages } = require('../../../config/constants.js');
const catchAsync = require('../../../helpers/catchAsync.js');
const config = require('../../../config/config.js');


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
    const filter = { email ,is_active:true};
    const user = await userService.getAdminProfile(filter);
  
    if (!user) {
      return res.render('pages/login', {
        success: res.locals.flashSuccess || undefined,
        error: messages.alert.CRED_MSG || 'Invalid credentials',
      });
    }
  
    if (!user.is_active) {
      return res.redirect('pages/login', {
        success: res.locals.flashSuccess || undefined,
        error: messages.alert.ACCOUNT_STATUS_ERR || 'Account is inactive',
      });
    }
  
    const userDetail = await userService.queryUsers(filter);
    if (userDetail.length == 0) {
      return res.redirect('pages/login', {
        success: res.locals.flashSuccess || undefined,
        error: messages.alert.CRED_MSG || 'Invalid credentials',
      });
    }
  
    const userData = userDetail[0];
    const checkPassword = await authenticatePass(userData.password, password, userData.salt);
    if (checkPassword) {
      return res.redirect('pages/login', {
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
      return res.redirect('administration/dashboard'); 
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
            res.render('pages/login', {
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

module.exports = {
    adminLogin,
    logout,
    createAdmin,
    getProfile,
    getLoginRoute,
    login
}


