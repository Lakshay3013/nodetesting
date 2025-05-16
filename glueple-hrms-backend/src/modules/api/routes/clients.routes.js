const express = require('express');
const validate = require('../../../middlewares/validate');
const clientValidation = require('../validation/client.validation')
const  clientController = require('../controller/clients.controller')
const isAuthenticated = require('../../../middlewares/auth');
const { uploadCandidateResume } = require('../../../middlewares/multer');
const checkPermission = require('../../../middlewares/webAuth');

const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.post('/add-client',validate(clientValidation.addClient) ,clientController.addClient);
router.get('/get-client', validate(clientValidation.getClient), clientController.getClient);
router.put('/update-client', validate(clientValidation.updateClient), clientController.updateClient);
router.delete('/delete-client', validate(clientValidation.deleteClient), clientController.deleteClient)



module.exports = router;