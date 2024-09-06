const express = require('express')
const Rolecontroller = require('../controllers/role.controller');
const auth = require('../middlewares/auth');
const router = express.Router();

router.post(
    "/role/create-role",
    auth.verifyToken,
    Rolecontroller.CreateRole
);

router.get(
    "/role/list-role",
    auth.verifyToken,
    Rolecontroller.ListRole
);

router.get(
    "/role/active-role",
    auth.verifyToken,
    Rolecontroller.ActiveRole
);

router.get(
    "/role/list-role/:id",
    auth.verifyToken,
    Rolecontroller.getRoleById
);

router.delete(
    "/role/delete-role/:id",
    auth.verifyToken,
    Rolecontroller.deleteRole
);

router.put(
    "/role/update-role/:id",
    auth.verifyToken,
    Rolecontroller.updateRole
);
module.exports = router;