const express = require('express')
const Menucontroller = require('../controllers/menu.controller');
const auth = require('../middlewares/auth');
const router = express.Router();

router.post(
    "/create-menu",
    auth.verifyToken,
    Menucontroller.CreateMenu
);

router.get(
    "/list-menu",
    auth.verifyToken,
    Menucontroller.ListMenu
);

router.get(
    "/list-menurole/:id",
    auth.verifyToken,
    Menucontroller.ListMenuWithRoleId
);

router.get(
    "/list-menu/:id",
    auth.verifyToken,
    Menucontroller.getMenuById
);

router.delete(
    "/delete-menu/:id",
    auth.verifyToken,
    Menucontroller.deleteMenu
);

router.delete(
    "/reset-menu/:id",
    auth.verifyToken,
    Menucontroller.resetMenu
);

router.put(
    "/update-menu/:id",
    auth.verifyToken,
    Menucontroller.updateMenu
);
module.exports = router;