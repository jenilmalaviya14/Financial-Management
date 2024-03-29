const express = require('express')
const TransactionController = require('../controllers/transaction.controller');
const auth = require('../middlewares/auth');
const router = express.Router();


router.post(
    "/create-transaction",
    auth.verifyToken,
    TransactionController.CreateTransaction
);

router.post(
    "/list-transaction",
    auth.verifyToken,
    TransactionController.ListTransaction
);

router.get(
    "/list-transaction/:id",
    auth.verifyToken,
    TransactionController.getTransactionById
);

router.delete(
    "/delete-transaction/:id",
    auth.verifyToken,
    TransactionController.deleteTransaction
);

router.put(
    "/update-transaction/:id",
    auth.verifyToken,
    TransactionController.updateTransaction
);
module.exports = router;