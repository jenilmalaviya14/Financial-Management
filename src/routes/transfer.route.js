const express = require('express')
const Transfercontroller = require('../controllers/transfer.controller');
const auth = require('../middlewares/auth');
const router = express.Router();


router.post(
    "/create-transfer",
    auth.verifyToken,
    Transfercontroller.CreateTransfer
);

router.post(
    "/list-transfer",
    auth.verifyToken,
    Transfercontroller.ListTransfer
);

router.get(
    "/list-transfer/:id",
    auth.verifyToken,
    Transfercontroller.getTransferById
);

router.delete(
    "/delete-transfer/:id",
    auth.verifyToken,
    Transfercontroller.deleteTransfer
);

router.put(
    "/update-transfer/:id",
    auth.verifyToken,
    Transfercontroller.updateTransfer
);
module.exports = router;