const jwt = require("jsonwebtoken");
const httpStatus = require('http-status');
const { employeeService } = require('../modules/api/services');
const { errorResponse } = require('../helpers/index');
const { messages } = require('../config/constants');
const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.header("authtoken");
    if (token) {
      const jwtSecret = jwt.verify(token, process.env.JWT_SECRET);
      if (!jwtSecret) {
        return errorResponse(req, res, messages.validation.TOKEN_EXPIRE, httpStatus.UNAUTHORIZED);
      }
      const user = await employeeService.getSingleUser({ email: jwtSecret.email },{});
      if (!user) {
        return errorResponse(req, res, messages.validation.INVALID_TOKEN, httpStatus.UNAUTHORIZED);
      }
      // req.user = user;
      next();

    } else {
      //UNAUTHORIZED REQUEST
      return errorResponse(req, res, messages.validation.TOKEN_NOT_AVAILABLE, httpStatus.UNAUTHORIZED);
    }
  } catch (error) {
    console.log(error);
    //BAD REQUEST
    return errorResponse(req, res, messages.validation.INVALID_TOKEN, httpStatus.UNAUTHORIZED);
  }
}
//       })
//   );
// };

module.exports = isAuthenticated;
