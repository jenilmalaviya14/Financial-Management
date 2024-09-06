const express = require('express')
const Reportcontroller = require('../controllers/reports.controller');
const auth = require('../middlewares/auth');
const router = express.Router();

router.post(
    "/report/filter-paymentReport",
    auth.verifyToken,
    Reportcontroller.ListPaymentReport
);

router.post(
    "/report/filter-clientReport",
    auth.verifyToken,
    Reportcontroller.ListClientReport
);

router.post(
    "/report/filter-categoryReport",
    auth.verifyToken,
    Reportcontroller.ListCategoryReport
);

router.post(
    "/report/filter-accountReport",
    auth.verifyToken,
    Reportcontroller.ListAccountReport
);

router.post(
    "/report/filter-groupReport",
    auth.verifyToken,
    Reportcontroller.ListGroupReport
);

router.post(
    "/report/filter-companyReport",
    auth.verifyToken,
    Reportcontroller.ListCompanyReport
);

router.post(
    "/report/filter-accountTypeReport",
    auth.verifyToken,
    Reportcontroller.ListAccountTypeReport
);

router.post(
    "/report/filter-monthlyReport",
    auth.verifyToken,
    Reportcontroller.ListMonthlyReport
);

router.post(
    "/report/filter-quarterlyReport",
    auth.verifyToken,
    Reportcontroller.ListQuarterlyReport
);

router.post(
    "/report/filter-semiannualReport",
    auth.verifyToken,
    Reportcontroller.ListSemiannualReport
);

router.post(
    "/report/filter-annuallyReport",
    auth.verifyToken,
    Reportcontroller.ListAnnuallyReport
);

module.exports = router;