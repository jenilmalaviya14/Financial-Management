const express = require('express')
const Accountcontroller = require('../controllers/account.controller');
const auth = require('../middlewares/auth');
const router = express.Router();


router.post(
    "/account/create-account",
    auth.verifyToken,
    Accountcontroller.CreateAccount
);

router.get(
    "/account/list-account",
    auth.verifyToken,
    Accountcontroller.ListAccount
);

router.get(
    "/account/active-account",
    auth.verifyToken,
    Accountcontroller.ActiveAccount
);

router.get(
    "/account/list-account/:id",
    auth.verifyToken,
    Accountcontroller.getAccountById
);

router.delete(
    "/account/delete-account/:id",
    auth.verifyToken,
    Accountcontroller.deleteAccount
);

router.put(
    "/account/update-account/:id",
    auth.verifyToken,
    Accountcontroller.updateAccount
);
module.exports = router;