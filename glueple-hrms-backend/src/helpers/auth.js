const constants = require("../helpers/constant");
const jwt = require("jsonwebtoken");
//  jwt generating token when user login first time
exports.signinToken = (data) => {
    return jwt.sign({...data,expire_time: process.env.JWT_ACCESS_EXPIRATION_MINUTES}, process.env.JWT_SECRET, {
        expiresIn: `${process.env.JWT_ACCESS_EXPIRATION_MINUTES}m`,
    }
    );
};