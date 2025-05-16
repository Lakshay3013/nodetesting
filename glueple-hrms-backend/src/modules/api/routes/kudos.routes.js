const express = require('express');
const validate = require('../../../middlewares/validate');
const kudosValidation = require('../validation/kudos.validation');
const kudosController = require('../controller/kudos.controller');
const isAuthenticated = require('../../../middlewares/auth');
const checkPermission = require('../../../middlewares/webAuth');

const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.post('/add-kudos-category', validate(kudosValidation.addKudosCategory), kudosController.addKudosCategory);
router.get('/get-kudos-category', validate(kudosValidation.getKudosCategory), kudosController.getKudosCategory);
router.post('/create-kudos-request', validate(kudosValidation.createKudosRequest), kudosController.createKudosRequest);
router.get('/get-kudos-request', validate(kudosValidation.getKudosRequest), kudosController.getKudosRequest);
router.post('/add-kudos-point-history', kudosController.addKudosPointHistory);
router.get('/get-point-statement', validate(kudosValidation.getKudosRequest), kudosController.getPointStatement);
router.get('/get-user-type-approve-kudos',  kudosController.getUserKudosOnType);
router.post('/approve-reject-kudos',  kudosController.approveRejectKudos);

module.exports = router;