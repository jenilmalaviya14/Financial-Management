const express = require('express')
const CompanySetting = require('../controllers/company_setting.controller');
const auth = require('../middlewares/auth');
const router = express.Router();

router.get(
    "/companysetting/list-companysetting",
    auth.verifyToken,
    CompanySetting.ListCompanySetting
);

router.get(
    "/companysetting/list-companysetting/:id",
    auth.verifyToken,
    CompanySetting.getIdCompanySetting
)

router.put(
    "/companysetting/update-companysetting",
    auth.verifyToken,
    CompanySetting.updateCompanySetting
);

module.exports = router;