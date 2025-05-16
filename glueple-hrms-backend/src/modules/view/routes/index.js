const express = require('express');
const viewController = require('../../view/controller/view');
const userValidation = require('../validation/user.validation')
const clientValidation = require('../validation/client.validation');
const clientPermission = require("../validation/clientPermission.validation")
const controller = require('../controller/view.controller')
const validate = require('../../../middlewares/validate');
const { clientLogo } = require('../../../middlewares/multer');

const router = express.Router();

router.get('/error',viewController.getError);
router.get('/dashboard', viewController.getDashboard);
router.get('/profile', viewController.getProfile);
router.get('/icons', viewController.getIcons);
router.get('/maps', viewController.getMaps);
router.get('/tables', viewController.getTables);
router.get('/login',viewController.getLogin);
router.get('/register',viewController.getRegister)
router.get('/getResetPass',viewController.getResetPass)
router.get('/onboardClient',viewController.onboardClient)
router.get('/allClients',viewController.getAllClient)
router.get('/edit-client/:id',viewController.editClient)
router.get('/view-client/:id',viewController.viewClient)
router.get('/communications/',viewController.communications)
router.get('/client-access',viewController.getClientAccess)




//api routes
router.post('/login', validate(userValidation.login), controller.login);
router.post('/register', validate(userValidation.createAdmin), controller.createAdmin);
router.post('/create-client', clientLogo.fields( [{name: 'logo',maxCount:1},{name: 'water_mater',maxCount:1},{name: 'favicon',maxCount:1}]), controller.createClient);
router.post('/update-client/:id', clientLogo.fields( [{name: 'logo',maxCount:1},{name: 'water_mater',maxCount:1},{name: 'favicon',maxCount:1}]),controller.updateClient);
router.post('/create-permission',validate(clientPermission.createClientPermission), controller.createPermission);
router.post('/add-access-control', validate(clientPermission.addAccessControl), controller.addAccessControl)



module.exports = router;