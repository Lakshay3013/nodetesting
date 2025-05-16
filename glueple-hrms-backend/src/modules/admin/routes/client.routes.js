const express = require('express');
const validate = require('../../../middlewares/validate');
const userValidation = require('../../view/validation/user.validation');
const userController = require('../controller/user.controller');
const clientController = require('../controller/client.controller')
const {isAdminAuthenticated} = require('../../../middlewares/auth');
const { clientLogo } = require('../../../middlewares/multer');

const router = express.Router();

router.post('/create-client',clientLogo.single("logo"), clientController.createClient);


module.exports = router;