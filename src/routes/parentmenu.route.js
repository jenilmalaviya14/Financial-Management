const express = require('express')
const Parentmenucontroller = require('../controllers/parentmenu.controller');
const auth = require('../middlewares/auth');
const router = express.Router();

router.post(
    "/create-parentmenu",
    auth.verifyToken,
    Parentmenucontroller.CreateParentmenu
);

router.get(
    "/list-parentmenu",
    auth.verifyToken,
    Parentmenucontroller.ListParentmenu
);

router.get(
    "/active-parentmenu",
    auth.verifyToken,
    Parentmenucontroller.ActiveParentmenu
);

router.get(
    "/list-parentmenu/:id",
    auth.verifyToken,
    Parentmenucontroller.getParentmenuById
);

router.delete(
    "/delete-parentmenu/:id",
    auth.verifyToken,
    Parentmenucontroller.deleteParentmenu
);

router.put(
    "/update-parentmenu/:id",
    auth.verifyToken,
    Parentmenucontroller.updateParentmenu
);
module.exports = router;