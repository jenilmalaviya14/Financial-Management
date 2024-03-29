const express = require('express')
const Childmenucontroller = require('../controllers/childmenu.controller');
const auth = require('../middlewares/auth');
const router = express.Router();


router.post(
    "/create-childmenu",
    auth.verifyToken,
    Childmenucontroller.CreateChildmenu
);

router.get(
    "/list-childmenu",
    auth.verifyToken,
    Childmenucontroller.ListChildmenu
);

router.get(
    "/active-childmenu",
    auth.verifyToken,
    Childmenucontroller.ActiveChildmenu
);

router.get(
    "/list-childmenu/:id",
    auth.verifyToken,
    Childmenucontroller.getChildmenuById
);

router.delete(
    "/delete-childmenu/:id",
    auth.verifyToken,
    Childmenucontroller.deleteChildmenu
);

router.put(
    "/update-childmenu/:id",
    auth.verifyToken,
    Childmenucontroller.updateChildmenu
);
module.exports = router;