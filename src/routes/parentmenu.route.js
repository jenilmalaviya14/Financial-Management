const express = require('express')
const Parentmenucontroller = require('../controllers/parentmenu.controller');
const auth = require('../middlewares/auth');
const router = express.Router();

router.post(
    "/parentmenu/create-parentmenu",
    auth.verifyToken,
    Parentmenucontroller.CreateParentmenu
);

router.get(
    "/parentmenu/list-parentmenu",
    auth.verifyToken,
    Parentmenucontroller.ListParentmenu
);

router.get(
    "/parentmenu/active-parentmenu",
    auth.verifyToken,
    Parentmenucontroller.ActiveParentmenu
);

router.get(
    "/parentmenu/list-parentmenu/:id",
    auth.verifyToken,
    Parentmenucontroller.getParentmenuById
);

router.delete(
    "/parentmenu/delete-parentmenu/:id",
    auth.verifyToken,
    Parentmenucontroller.deleteParentmenu
);

router.put(
    "/parentmenu/update-parentmenu/:id",
    auth.verifyToken,
    Parentmenucontroller.updateParentmenu
);
module.exports = router;