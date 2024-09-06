const express = require('express')
const Commoncontroller = require('../controllers/common.controller');
const auth = require('../middlewares/auth');
const router = express.Router();


router.post(
    "/common/create-common",
    auth.verifyToken,
    Commoncontroller.CreateCommon
);

router.post(
    "/common/list-common",
    auth.verifyToken,
    Commoncontroller.ListCommon
);

router.post(
    "/common/active-common",
    auth.verifyToken,
    Commoncontroller.Activecommon
);

router.get(
    "/common/list-common/:id",
    auth.verifyToken,
    Commoncontroller.getCommonById
);

router.delete(
    "/common/delete-common/:id",
    auth.verifyToken,
    Commoncontroller.deleteCommon
);

router.put(
    "/common/update-common/:id",
    auth.verifyToken,
    Commoncontroller.updateCommon
);
module.exports = router;