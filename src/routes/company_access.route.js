const express = require('express')
const CompanyAccessController = require('../controllers/company_access.controller');
const auth = require('../middlewares/auth');
const router = express.Router();


router.post(
    "/companyaccess/create-companyaccess",
    auth.verifyToken,
    CompanyAccessController.CreateCompanyAccess
);

router.get(
    "/companyaccess/list-companyaccess",
    auth.verifyToken,
    CompanyAccessController.ListCreateCompanyAccess
);

router.get(
    "/companyaccess/list-companyaccess/:id",
    auth.verifyToken,
    CompanyAccessController.getCreateCompanyAccessById
);

router.delete(
    "/companyaccess/delete-companyaccess/:id",
    auth.verifyToken,
    CompanyAccessController.deleteCompanyAccess
);

router.put(
    "/companyaccess/update-companyaccess/:id",
    auth.verifyToken,
    CompanyAccessController.updateCompanyAccess
);

module.exports = router;