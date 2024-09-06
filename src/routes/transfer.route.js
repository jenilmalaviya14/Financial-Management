const express = require('express')
const Transfercontroller = require('../controllers/transfer.controller');
const auth = require('../middlewares/auth');
const router = express.Router();


router.post(
    "/transfer/create-transfer",
    auth.verifyToken,
    Transfercontroller.CreateTransfer
);

router.post(
    "/transfer/list-transfer",
    auth.verifyToken,
    Transfercontroller.ListTransfer
);

router.get(
    "/transfer/list-transfer/:id",
    auth.verifyToken,
    Transfercontroller.getTransferById
);

router.delete(
    "/transfer/delete-transfer/:id",
    auth.verifyToken,
    Transfercontroller.deleteTransfer
);

router.put(
    "/transfer/update-transfer/:id",
    auth.verifyToken,
    Transfercontroller.updateTransfer
);
module.exports = router;