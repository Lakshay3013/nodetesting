const express = require('express');
const validate = require('../../../middlewares/validate');
const policyValidation = require('../validation/policies.validation');
const policyController = require('../controller/policies.controller');
const isAuthenticated = require('../../../middlewares/auth');
const { uploadPolicies } = require('../../../middlewares/multer');
const checkPermission = require('../../../middlewares/webAuth');

const router = express.Router();

router.use(isAuthenticated);
router.use(checkPermission);

router.post('/create-policy-category', validate(policyValidation.createPolicyCategory), policyController.createPolicyCategory);
router.get('/get-policy-category', validate(policyValidation.getPolicyCategory), policyController.getPolicyCatgory);
router.put("/update-policy-category", validate(policyValidation.updatePolicyCategory), policyController.updatePolicyCategory);
router.post('/create-policy', uploadPolicies.single('file'), validate(policyValidation.createPolicy), policyController.createPolicy);
router.put('/update-policy', uploadPolicies.single('file'), validate(policyValidation.updatePolicy), policyController.updatePolicy);
router.get('/get-policies', validate(policyValidation.getPolicy), policyController.getPolicy);
router.get('/get-policies-in-category', validate(policyValidation.getPolicyInCategory), policyController.getPolicyInCategory);
router.get('/get-policy-by-category-id', validate(policyValidation.getPolicyByCategoryId), policyController.getPolicyByCategoryId);
router.delete('/delete-policy-category', validate(policyValidation.deletePolicyCategory), policyController.deletePolicyCategory);
router.delete('/delete-policy', validate(policyValidation.deletePolicy), policyController.deletePolicy);
router.post("/accept-policy-by-user", validate(policyValidation.acceptPolicyByUser), policyController.acceptPolicyByUser);
router.get("/get-policy-category-list", policyController.getPolicyCategoryList);
router.get("/get-policy-list", policyController.getPolicyList);

module.exports = router;