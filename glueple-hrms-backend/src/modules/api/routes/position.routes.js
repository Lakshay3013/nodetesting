const express = require('express');
const validate = require('../../../middlewares/validate');
const positionValidation = require('../validation/position.validation');
const positionController = require('../controller/position.controller');
const isAuthenticated = require('../../../middlewares/auth');
const checkPermission = require('../../../middlewares/webAuth');

const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.post('/create-position', validate(positionValidation.createPosition), positionController.createPosition);
router.get('/get-position-by-department-designation', validate(positionValidation.getPosition), positionController.getPosition);
router.get('/get-all-positions', validate(positionValidation.getAllPosition), positionController.getAllPosition);
router.put('/update-position', validate(positionValidation.updatePosition), positionController.updatePosition);
router.delete('/delete-position', validate(positionValidation.deletePosition), positionController.deletePosition);

module.exports = router;