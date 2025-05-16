const httpStatus = require('http-status');
const adminService = require('../services/index.js');
const userService = require('../../employee/services/service');
const { ObjectId } = require('mongodb');
const { authenticatePass } = require('../../../helpers');
const { signinToken } = require('../../../helpers/auth.js');
const { successResponse, errorResponse } = require('../../../helpers');
const { validationMessage } = require('../../../config/constants.js');


const adminLogin = async (req, res) => {
    try {
        let { email, password } = req.body;
        email = email.toLowerCase();
        const filter = { email , is_admin:true };
        const user = await userService.getSingleUser(filter);
        if (!user) {
            return errorResponse(req, res, validationMessage.CRED_MSG, httpStatus.BAD_REQUEST);
        }
        let checkPassword = authenticatePass(user.password, password, user.salt);
        if (!checkPassword) {
            return errorResponse(req, res, validationMessage.CRED_MSG, httpStatus.BAD_REQUEST);
        }
        let token = signinToken(email);
        return res.render('index');
        return successResponse(req, res, validationMessage.SUCCESS_LOGIN, {
            user: user, token: token, urlData: []
        });
    } catch (error) {
        console.log(error);
        return errorResponse(req, res, validationMessage.SERVER_LOGIN_ERR, error);
    }
};

const logout = async (req, res) => {
    try {
        const user = req.user;
        await userService.updateUserByFilter(new ObjectId(user._id), { token: "" });
        return successResponse(req, res, validationMessage.SUCCESS_LOGOUT, null);
    } catch (error) {
        console.log(error);
        return errorResponse(req, res, validationMessage.SERVER_MSG, error);
    }
}

const createAdmin = async (req, res) => {
    try {
        const { email } = req.body;
        let result = await userService.queryUsers({ email });
        if (result.length) {
            return errorResponse(req, res, validationMessage.EMAIL_ALREADY_EXISTS, httpStatus.BAD_REQUEST);
        }
        let doesExist = await userService.queryUsers({ is_admin: true });
        if (doesExist.length) {
            return errorResponse(req, res, validationMessage.ADMIN_ALREADY_EXISTS, httpStatus.BAD_REQUEST);
        }
        let adminUser = await adminService.createAdminUser(req.body);
        return successResponse(req, res, validationMessage.ADMIN_CREATED, adminUser);
    } catch (error) {
        console.log(error);
        return errorResponse(req, res, validationMessage.SERVER_MSG, error);
    }
}

const getProfile = async (req, res) => {
    try {
        const user = req.user;
        let adminProfileDetails = await adminService.getAdminProfile(new ObjectId(user._id));
        if (!adminProfileDetails) {
            return errorResponse(req, res, validationMessage.USER_NOT_FOUND, httpStatus.BAD_REQUEST);
        }
        return successResponse(req, res, validationMessage.ADMIN_CREATED, adminProfileDetails);
    } catch (error) {
        console.log(error);
        return errorResponse(req, res, validationMessage.SERVER_MSG, error);
    }
}

const getLoginRoute = async (req, res) => {
    try {
        return res.render('login.ejs');
    } catch (error) {
        console.log(error);
        return errorResponse(req, res, validationMessage.SERVER_MSG, error);
    }
}

module.exports = {
    adminLogin,
    logout,
    createAdmin,
    getProfile,
    getLoginRoute
}


