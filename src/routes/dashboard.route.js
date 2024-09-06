const express = require('express')
const Dashboardcontroller = require('../controllers/dashboard.controller');
const auth = require('../middlewares/auth');
const router = express.Router();

router.post (
    "/dashboard/dashboard-data",
    auth.verifyToken,
    Dashboardcontroller.ListDashboard
);

router.post (
    "/dashboard/dashboard-group-data",
    auth.verifyToken,
    Dashboardcontroller.ListDashboardGroupData
);

module.exports = router;