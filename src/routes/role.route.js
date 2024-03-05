const express = require('express')
const Rolecontroller = require('../controllers/role.controller');
const auth = require('../middlewares/auth');
const router = express.Router();

router.post(
    "/create-role",
    auth.verifyToken,
    Rolecontroller.CreateRole
);

router.get(
    "/list-role",
    auth.verifyToken,
    Rolecontroller.ListRole
);

router.get(
    "/active-role",
    auth.verifyToken,
    Rolecontroller.ActiveRole
);


router.get(
    "/list-role/:id",
    auth.verifyToken,
    Rolecontroller.getRoleById
);

router.delete(
    "/delete-role/:id",
    auth.verifyToken,
    Rolecontroller.deleteRole
);

router.put(
    "/update-role/:id",
    auth.verifyToken,
    Rolecontroller.updateRole
);
module.exports = router;