const express = require('express')
const TenantController = require('../controllers/tenant.controller');
const auth = require('../middlewares/auth');
const router = express.Router();

router.post(
    "/create-tenant",
    auth.verifyToken,
    TenantController.CreateTenant
);

router.get(
    "/list-tenant",
    auth.verifyToken,
    TenantController.ListTenant
);

router.get(
    "/active-tenant",
    auth.verifyToken,
    TenantController.ActiveTenant
);

router.get(
    "/list-tenant/:id",
    auth.verifyToken,
    TenantController.getTenantById
);

router.delete(
    "/delete-tenant/:id",
    auth.verifyToken,
    TenantController.deleteTenant
);

router.put(
    "/update-tenant/:id",
    auth.verifyToken,
    TenantController.updateTenant
);
module.exports = router;