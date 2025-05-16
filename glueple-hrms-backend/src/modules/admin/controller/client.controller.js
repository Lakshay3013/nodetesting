const httpStatus = require('http-status');
const { clientService } = require('../services/index.js');
const { ObjectId } = require('mongodb');
const { authenticatePass } = require('../../../helpers');
const { signinTokenAdmin, signinToken } = require('../../../helpers/auth.js');
const { successResponse, errorResponse } = require('../../../helpers');
const { messages } = require('../../../config/constants.js');
const catchAsync = require('../../../helpers/catchAsync.js');
const config = require('../../../config/config.js');


const createClient = catchAsync(async(req,res)=>{
    try {
        const { email } = req.body
        // console.log(req.body)
        let result = await clientService.getAllClient({ email });
        if (result.length) {
            return errorResponse(req, res, messages.alert.EMAIL_ALREADY_EXISTS, httpStatus.BAD_REQUEST);
        }
        const addClient = await clientService.createClient(req.body);
        if(addClient){
            return res.redirect('administration/dashboard'); 
        }
    } catch (error) {
        return errorResponse(req, res, messages.alert.SERVER_MSG, httpStatus.BAD_REQUEST);
    }
})


module.exports = {
    createClient
}