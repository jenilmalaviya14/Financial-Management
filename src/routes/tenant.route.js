const express = require('express')
const TenantController = require('../controllers/tenant.controller');
const auth = require('../middlewares/auth');
const router = express.Router();

router.post(
    "/tenant/create-tenant",
    auth.verifyToken,
    TenantController.CreateTenant
);

router.get(
    "/tenant/list-tenant",
    auth.verifyToken,
    TenantController.ListTenant
);

router.get(
    "/tenant/login-tenant/:id",
    auth.verifyToken,
    TenantController.logintenant
);

router.get(
    "/tenant/active-tenant",
    auth.verifyToken,
    TenantController.ActiveTenant
);

router.get(
    "/tenant/list-tenant/:id",
    auth.verifyToken,
    TenantController.getTenantById
);

router.delete(
    "/tenant/delete-tenant/:id",
    auth.verifyToken,
    TenantController.deleteTenant
);

router.put(
    "/tenant/update-tenant/:id",
    auth.verifyToken,
    TenantController.updateTenant
);
module.exports = router;