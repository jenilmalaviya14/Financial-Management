const express = require('express')
const TransactionDetailsController = require('../controllers/trasnaction_details.controller');
const auth = require('../middlewares/auth');
const router = express.Router();

router.post(
    "/filter-subcategoryReport",
    auth.verifyToken,
    TransactionDetailsController.ListTransactionDetails
);

module.exports = router;