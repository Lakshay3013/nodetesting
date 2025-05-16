const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { leaveEncashmentConstant } = require('../config/constants')

exports.generateRandomPassword = (length) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
  const password = Array(length)
    .fill(0)
    .map(() => charset.charAt(crypto.randomInt(0, charset.length)))
    .join('');
  return password;
}

exports.successResponse = (req, res, message, data = {}, code = 200) => res.send({
  code,
  data: data?.data == null ? null : (data?.data || data),
  // data,
  message,
  success: true,
});

exports.errorResponse = (
  req,
  res,
  errorMessage = 'Something went wrong',
  code = 500,
  error = {},
) => res.status(code).json({
  code,
  errorMessage,
  error:{},
  data: null,
  success: false,
});

exports.validateEmail = (email) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

exports.validateFields = (object, fields) => {
  const errors = [];
  fields.forEach((f) => {
    if (!(object && object[f])) {
      errors.push(f);
    }
  });
  return errors.length ? `${errors.join(', ')} are required fields.` : '';
};

exports.uniqueId = (length = 13) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

//Encrypt password
exports.encryptPassword = async (password) => {
  const encryptedPassword = await bcrypt.hash(password, 10);
  return encryptedPassword;
};

exports.authenticatePass = async (password, encrPass) => {
  const validPassword = await bcrypt.compare(password, encrPass);
  // console.log(validPassword,password, encrPass)
  return validPassword;
};

exports.verifyPassword = (password, storedHash, salt)=> {
  const key = crypto.pbkdf2Sync(password, Buffer.from(salt, 'base64'), 10000, 32, 'sha256');
  const encodedKey = key.toString('base64');
  console.log("dsfsdf",encodedKey,storedHash)
  return encodedKey === storedHash;
}

exports.generateRandomNumber = (length = 4) => {
  let otp = "";
  const possible = "123456789";
  for (let i = 0; i < length; i++) {
    const sup = Math.floor(Math.random() * possible.length);
    otp += i > 0 && sup == i ? "0" : possible.charAt(sup);
  }
  return otp;
};

exports.validateMobile = (mobile) => {
  const digitCount = mobile_email.split('').reduce((acc, char) => {
    if (/[0-9]/.test(char)) acc++
    return acc
  }, 0);
  return digitCount == 10 ? true : false;
};

exports.validateLeaveEncashmentFormula = (formula) => {
  const escapedConstants = leaveEncashmentConstant.map(c =>
    c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  const constantsPattern = escapedConstants.join('|');
  const baseRegex = new RegExp(
    `^\\s*([\\(\\{\\[]?\\s*([\\)\\}\\]?\\s*(${constantsPattern}|[0-9]+)\\s*[\\)\\}\\]]?\\s*([\\+\\-\\*\\/\\%]\\s*[\\(\\{\\[]?\\s*(${constantsPattern}|[0-9]+)\\s*[\\)\\}\\]]?\\s*)*)*$`
  );
  return baseRegex.test(formula);
};

exports.validateFormula = (formula) => {
  const escapedConstants = leaveEncashmentConstant.map(c =>
    c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  const constantsPattern = escapedConstants.join('|');
  const baseRegex = new RegExp(
    `^\\s*([\\(\\{\\[]?\\s*([\\)\\}\\]?\\s*(${constantsPattern}|[0-9]+)\\s*[\\)\\}\\]]?\\s*([\\+\\-\\*\\/\\%]\\s*[\\(\\{\\[]?\\s*(${constantsPattern}|[0-9]+)\\s*[\\)\\}\\]]?\\s*)*)*$`
  );
  return baseRegex.test(formula);
};
