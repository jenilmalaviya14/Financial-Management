const express = require('express')
const Accountcontroller = require('../controllers/account.controller');
const auth = require('../middlewares/auth');
const router = express.Router();


router.post(
    "/create-account",
    auth.verifyToken,
    Accountcontroller.CreateAccount
);

router.get(
    "/list-account",
    auth.verifyToken,
    Accountcontroller.ListAccount
);

router.get(
    "/active-account",
    auth.verifyToken,
    Accountcontroller.ActiveAccount
);

router.get(
    "/list-account/:id",
    auth.verifyToken,
    Accountcontroller.getAccountById
);

router.delete(
    "/delete-account/:id",
    auth.verifyToken,
    Accountcontroller.deleteAccount
);

router.put(
    "/update-account/:id",
    auth.verifyToken,
    Accountcontroller.updateAccount
);
module.exports = router;