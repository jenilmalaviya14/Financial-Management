const express = require('express')
const TransactionController = require('../controllers/transaction.controller');
const auth = require('../middlewares/auth');
const router = express.Router();


router.post(
    "/transaction/create-transaction",
    auth.verifyToken,
    TransactionController.CreateTransaction
);

router.post(
    "/transaction/list-transaction",
    auth.verifyToken,
    TransactionController.ListTransaction
);

router.get(
    "/transaction/list-transaction/:id",
    auth.verifyToken,
    TransactionController.getTransactionById
);

router.delete(
    "/transaction/delete-transaction/:id",
    auth.verifyToken,
    TransactionController.deleteTransaction
);

router.put(
    "/transaction/update-transaction/:id",
    auth.verifyToken,
    TransactionController.updateTransaction
);
module.exports = router;