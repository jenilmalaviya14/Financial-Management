const express = require('express')
const Companycontroller = require('../controllers/company.controller');
const auth = require('../middlewares/auth');
const router = express.Router();

router.post(
    "/create-company",
    auth.verifyToken,
    Companycontroller.CreateCompany
);

router.get(
    "/list-company",
    auth.verifyToken,
    Companycontroller.ListCompany
);

router.get(
    "/active-company",
    auth.verifyToken,
    Companycontroller.ActiveCompany
);

router.get(
    "/list-company",
    auth.verifyToken,
    Companycontroller.ListCompany
);

router.get(
    "/list-company/:id",
    auth.verifyToken,
    Companycontroller.getCompanyById
);

router.delete(
    "/delete-company/:id",
    auth.verifyToken,
    Companycontroller.deleteCompany
);

router.put(
    "/update-company/:id",
    auth.verifyToken,
    Companycontroller.updateCompany
);
module.exports = router;