const express = require('express')
const CompanyAccessController = require('../controllers/company_access.controller');
const auth = require('../middlewares/auth');
const router = express.Router();


router.post(
    "/create-companyaccess",
    auth.verifyToken,
    CompanyAccessController.CreateCompanyAccess
);

router.get(
    "/list-companyaccess",
    auth.verifyToken,
    CompanyAccessController.ListCreateCompanyAccess
);

router.get(
    "/list-companyaccess/:id",
    auth.verifyToken,
    CompanyAccessController.getCreateCompanyAccessById
);

router.delete(
    "/delete-companyaccess/:id",
    auth.verifyToken,
    CompanyAccessController.deleteCompanyAccess
);

router.put(
    "/update-companyaccess/:id",
    auth.verifyToken,
    CompanyAccessController.updateCompanyAccess
);
module.exports = router;