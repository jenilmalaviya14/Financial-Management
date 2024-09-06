const express = require('express')
const Menucontroller = require('../controllers/menu.controller');
const auth = require('../middlewares/auth');
const router = express.Router();

router.post(
    "/menu/create-menu",
    auth.verifyToken,
    Menucontroller.CreateMenu
);

router.get(
    "/menu/list-menu",
    auth.verifyToken,
    Menucontroller.ListMenu
);

router.get(
    "/menu/list-menurole/:id",
    auth.verifyToken,
    Menucontroller.ListMenuWithRoleId
);

router.get(
    "/menu/list-menu/:id",
    auth.verifyToken,
    Menucontroller.getMenuById
);

router.delete(
    "/menu/delete-menu/:id",
    auth.verifyToken,
    Menucontroller.deleteMenu
);

router.delete(
    "/menu/reset-menu/:id",
    auth.verifyToken,
    Menucontroller.resetMenu
);

router.put(
    "/menu/update-menu/:id",
    auth.verifyToken,
    Menucontroller.updateMenu
);
module.exports = router;