const express = require('express')
const Childmenucontroller = require('../controllers/childmenu.controller');
const auth = require('../middlewares/auth');
const router = express.Router();


router.post(
    "/childmenu/create-childmenu",
    auth.verifyToken,
    Childmenucontroller.CreateChildmenu
);

router.get(
    "/childmenu/list-childmenu",
    auth.verifyToken,
    Childmenucontroller.ListChildmenu
);

router.get(
    "/childmenu/active-childmenu",
    auth.verifyToken,
    Childmenucontroller.ActiveChildmenu
);

router.get(
    "/childmenu/list-childmenu/:id",
    auth.verifyToken,
    Childmenucontroller.getChildmenuById
);

router.delete(
    "/childmenu/delete-childmenu/:id",
    auth.verifyToken,
    Childmenucontroller.deleteChildmenu
);

router.put(
    "/childmenu/update-childmenu/:id",
    auth.verifyToken,
    Childmenucontroller.updateChildmenu
);
module.exports = router;