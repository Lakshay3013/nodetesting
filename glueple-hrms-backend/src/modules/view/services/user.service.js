const httpStatus = require('http-status');
const userModel = require('../model/user.model');
const { ObjectId } = require('mongodb')
const crypto = require("crypto");
const bcrypt = require('bcrypt');

const makeSalt = function (byteSize) {
    let defaultByteSize = 16;
    return crypto.randomBytes(defaultByteSize).toString("base64");
};


//Encrypt password
const encryptPasswords = (password, saltKey) => {
    let createdSalt = saltKey ? saltKey : makeSalt();

    if (!password || !createdSalt) {
        return { salt: null, password: null };

    }

    let defaultIterations = 10000;
    let defaultKeyLength = 60;
    let salt = new Buffer(createdSalt, "base64");
    let digest = "sha512";

    return {
        salt: createdSalt,
        password: crypto
            .pbkdf2Sync(password, salt, defaultIterations, defaultKeyLength, digest)
            .toString("base64"),
    };
};

const encryptPassword = async (password) => {
  const encryptedPassword = await bcrypt.hash(password, 10);
  return encryptedPassword;
};
/**
 * Create a admin
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createAdminUser = async (userBody) => {
    let { email, password, name} = userBody;
    let encryptedPassword  =await encryptPassword(password);
    let adminObject = {
        email,
        password: encryptedPassword,
        name,
    }
    let adminCreatedObj = await userModel.create(adminObject);
    return adminCreatedObj;
};

const getAdminProfile = async (filter) => {
    let result = await userModel.findOne(filter);
    return result;
}

const queryUsers = async(filter)=>{
    let result = await userModel.find(filter).allowDiskUse();
    return result;
}



module.exports = {
    createAdminUser,
    getAdminProfile,
    queryUsers
}
