const express = require('express')
const Dashboardcontroller = require('../controllers/dashboard.controller');
const auth = require('../middlewares/auth');
const router = express.Router();

router.post (
    "/dashboard-data",
    auth.verifyToken,
    Dashboardcontroller.ListDashboard
);

router.post (
    "/dashboard-group-data",
    auth.verifyToken,
    Dashboardcontroller.ListDashboardGroupData
);

module.exports = router;