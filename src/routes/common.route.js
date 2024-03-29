const express = require('express')
const Commoncontroller = require('../controllers/common.controller');
const auth = require('../middlewares/auth');
const router = express.Router();


router.post(
    "/create-common",
    auth.verifyToken,
    Commoncontroller.CreateCommon
);

router.post(
    "/list-common",
    auth.verifyToken,
    Commoncontroller.ListCommon
);

router.post(
    "/active-common",
    auth.verifyToken,
    Commoncontroller.Activecommon
);

router.get(
    "/list-common/:id",
    auth.verifyToken,
    Commoncontroller.getCommonById
);

router.delete(
    "/delete-common/:id",
    auth.verifyToken,
    Commoncontroller.deleteCommon
);

router.put(
    "/update-common/:id",
    auth.verifyToken,
    Commoncontroller.updateCommon
);
module.exports = router;