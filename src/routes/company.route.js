const express = require('express')
const Companycontroller = require('../controllers/company.controller');
const auth = require('../middlewares/auth');
const router = express.Router();

router.post(
    "/company/create-company",
    auth.verifyToken,
    Companycontroller.CreateCompany
);

router.get(
    "/company/list-company",
    auth.verifyToken,
    Companycontroller.ListCompany
);

router.get(
    "/company/active-company",
    auth.verifyToken,
    Companycontroller.ActiveCompany
);

router.get(
    "/company/list-company",
    auth.verifyToken,
    Companycontroller.ListCompany
);

router.get(
    "/company/list-company/:id",
    auth.verifyToken,
    Companycontroller.getCompanyById
);

router.delete(
    "/company/delete-company/:id",
    auth.verifyToken,
    Companycontroller.deleteCompany
);

router.put(
    "/company/update-company/:id",
    auth.verifyToken,
    Companycontroller.updateCompany
);
module.exports = router;