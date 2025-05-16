const express = require('express');
const validate = require('../../../middlewares/validate');
const travelAndClaimController = require('../controller/travelAndClaim.controller')
const travelAndClaimValidation = require('../validation/travelAndClaim.validation')
const isAuthenticated = require('../../../middlewares/auth');
const checkPermission = require('../../../middlewares/webAuth');
const { uploadTravelClaimBill } = require('../../../middlewares/multer');


const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.post('/add-travel-type', travelAndClaimController.addTravelType);
router.get('/get-travel-type', travelAndClaimController.getTraveType);
router.put('/update-travel-type', travelAndClaimController.updateTravelType);
router.delete('/delete-travel-type', travelAndClaimController.deleteTravelType);
router.get('/get-all-travel-type', travelAndClaimController.getAllTravelType);


router.post('/create-travel-application', travelAndClaimController.createTravelApplication);
router.get('/get-travel-request', travelAndClaimController.getTravelRequest);
router.get('/get-travel-approval', travelAndClaimController.getTravelApproval);
router.put('/update-travel', travelAndClaimController.updateTravelApplication);
router.delete('/delete-travel', travelAndClaimController.deleteTravel);
router.post("/travel-request-approve-reject", travelAndClaimController.travelRequestApproveReject);

router.post('/create-travel-and-claim-rule', travelAndClaimController.createTravelAndClaimRule);
router.get('/get-travel-and-claim-rule', travelAndClaimController.getTravelAndClaimRule);
router.put('/update-travel-and-claim-rule', travelAndClaimController.updateTravelAndClaimRule);
router.delete('/delete-travel-and-claim-rule', travelAndClaimController.deleteTravelAndClaimRule);
router.get('/get-all-travel-and-claim-rule', travelAndClaimController.getAllTravelAndClaimRule);
router.put('/assign-rule', travelAndClaimController.assignRule);
router.get('/get-travel-type-by-id', travelAndClaimController.getTravelTypeById);

router.post('/create-claim-request', uploadTravelClaimBill.any(),travelAndClaimController.createClaimRequest);
router.put('/update-claim-request', travelAndClaimController.updateClaimRequest);
router.delete('/delete-claim-request', travelAndClaimController.deleteClaimRequest);
router.get('/get-claim-request', travelAndClaimController.getClaimRequest);
router.get('/get-claim-approval', travelAndClaimController.getClaimApproval);
router.post('/approve-reject-claim-request', travelAndClaimController.approveRejectClaimRequest);
router.get('/get-all-travel-approve', travelAndClaimController.getAllTravelApprovalData);
router.get('/get-assign-rule', travelAndClaimController.getAssignRule)


module.exports = router;