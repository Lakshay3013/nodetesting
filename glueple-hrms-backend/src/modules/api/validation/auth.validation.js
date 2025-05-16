const Joi = require('joi');

const login = {
    body: Joi.object().keys({
        email: Joi.string().required().label('Email'),
    }),
};

// const logout = {
//     query: Joi.object().keys({
//         token: Joi.string().required().label('Token'),
//     }),
// };

const resetPassword = {
    body: Joi.object().keys({
        current_password: Joi.string().required().label('Current Password'), 
        new_password: Joi.string().required().label('New Password'), 
        confirm_password: Joi.string().required().label('Confirm Password'),
    }),
};

const forgotPassword = {
    body: Joi.object().keys({
        new_password: Joi.string().required().label('New Password'), 
        confirm_password: Joi.string().required().label('Confirm Password'),
        email_mobile: Joi.string().required().label("Email or Mobile"),
    }),
};

const sendOtp = {
    body: Joi.object().keys({
        email_mobile: Joi.string().required().label("Email or Mobile"),
    }),
};

const verifyOtp = {
    query: Joi.object().keys({
        email_mobile: Joi.string().required().label("Email or Mobile"),
        otp: Joi.string().required().label('OTP'),
        otp_id: Joi.string().required().label('OTP ID'),
    }),
}

const forgotPasswordForAdmin = {
    body: Joi.object().keys({
        new_password: Joi.string().required().label('New Password'), 
        confirm_password: Joi.string().required().label('Confirm Password'),
        _id: Joi.string().required().label("Emp Id"),
    }),
}

module.exports = {
    login,
    // logout,
    resetPassword,
    forgotPassword,
    sendOtp,
    verifyOtp,
    forgotPasswordForAdmin,
};