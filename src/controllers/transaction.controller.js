const Transaction = require("../models/transaction");
const TransactionDetails = require("../models/trasnaction_details")
const { createTransactionSchema, updateTransactionSchema } = require('../validation/transaction.validation');
const { getDecodeToken } = require('../middlewares/decoded');

let transactionSearch = (q, transaction) => {
    if (q) {
        const queryLowered = q.toLowerCase();
        return transaction.filter(transaction =>
            (typeof transaction.payment_type_name === 'string' && transaction.payment_type_name.toLowerCase().includes(queryLowered)) ||
            (typeof transaction.description === 'string' && transaction.description.toLowerCase().includes(queryLowered)) ||
            (typeof transaction.client_name === 'string' && transaction.client_name.toLowerCase().includes(queryLowered)) ||
            (typeof transaction.account_name === 'string' && transaction.account_name.toLowerCase().includes(queryLowered)) ||
            (typeof transaction.amount === 'string' && transaction.amount.toLowerCase().includes(queryLowered)) ||
            (typeof transaction === 'string' && transaction.toLowerCase().includes(queryLowered))
        );
    }
    else {
        return transaction
    }
};

const CreateTransaction = async (req, res) => {
    const token = getDecodeToken(req);
    try {

        const { error } = createTransactionSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        };

        let { transaction_date, transaction_type, payment_type_Id, accountId, amount, description, clientId, details } = req.body;

        const companyId = token.decodedToken.companyId;
        const tenantId = token.decodedToken.tenantId;
        const userId = token.decodedToken.userId;

        let transaction = new Transaction(tenantId, transaction_date, transaction_type, payment_type_Id, accountId, amount, description, '', '', '', clientId);

        transaction.companyId = companyId;
        transaction.createdBy = userId;
        transaction.updatedBy = userId;

        const saveTransaction = await transaction.save();

        if (details && details.length > 0) {
            const transactionDetails = details.map(detail => new TransactionDetails(tenantId, saveTransaction[0].insertId, transaction_type, detail.subCategoryId, detail.amount, detail.description, companyId, userId, userId));

            await TransactionDetails.save(transactionDetails);
        }

        res.status(200).json({
            success: true,
            message: "Transaction Created Successfully",
            record: { saveTransaction }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
        console.log(error);
    }
};

const ListTransaction = async (req, res, next) => {
    const token = getDecodeToken(req);
    try {
        const { q = '' } = req.query;
        const { limit, startDate, endDate, type, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount } = req.body;
        const companyId = token.decodedToken.companyId;
        const { tenantId } = token.decodedToken;

        let transactions = await Transaction.findAll(tenantId, companyId, startDate, endDate, type, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, limit, fromAmount, toAmount);

        transactions[0] = transactionSearch(q, transactions[0]);

        let responseData = {
            success: true,
            message: 'Transaction list has been fetched Successfully.',
            data: transactions[0]
        };

        res.status(200).json(responseData);

    } catch (error) {
        console.log(error);
        next(error);
    }
};

const getTransactionById = async (req, res, next) => {
    const token = getDecodeToken(req);
    const tenantId = token.decodedToken.tenantId;
    try {
        let Id = req.params.id;
        let [transaction, _] = await Transaction.findById(tenantId, Id);

        res.status(200).json({
            success: true,
            message: "Transaction Record Successfully",
            data: transaction[0]
        });
    } catch (error) {
        console.log(error);
        next(error)
    }
};

const deleteTransaction = async (req, res, next) => {
    const token = getDecodeToken(req);
    const tenantId = token.decodedToken.tenantId;
    const companyId = token.decodedToken.companyId;
    try {
        let Id = req.params.id;
        await Transaction.delete(tenantId, Id);

        const transactionDetails = await TransactionDetails.findAllByTransactionId(tenantId, companyId, Id);

        if (transactionDetails.length > 0 && Array.isArray(transactionDetails[0])) {
            const detailIds = transactionDetails[0].map(detail => detail.id);

            if (detailIds.length > 0) {
                await TransactionDetails.delete(tenantId, companyId, detailIds);
            }
        }

        res.status(200).json({
            success: true,
            message: "Transaction Deleted Successfully"
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};

const updateTransaction = async (req, res, next) => {
    const token = getDecodeToken(req);
    const companyId = token.decodedToken.companyId;
    const tenantId = token.decodedToken.tenantId;
    const userId = token.decodedToken.userId || 0;

    try {
        const { error } = updateTransactionSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }

        const { transaction_date, transaction_type, payment_type_Id, accountId, amount, description, clientId, details } = req.body;

        const transactionId = req.params.id;
        const findTransaction = await Transaction.findById(tenantId, companyId, transactionId);
        if (!findTransaction) {
            throw new Error("The specified Transaction was not found.");
        }

        const transaction = new Transaction(tenantId, transaction_date, transaction_type, payment_type_Id, accountId, amount, description, '', '', companyId, clientId);
        transaction.createdBy = userId;
        transaction.updatedBy = userId;

        await transaction.update(tenantId, transactionId);

        const existingDetailsIds = details.map(detail => detail.id).filter(id => id);
        const existingDetails = await TransactionDetails.findAllByTransactionId(tenantId, companyId, transactionId);

        for (const detail of existingDetails[0]) {
            if (!existingDetailsIds.includes(detail.id)) {
                await TransactionDetails.delete(tenantId, companyId, detail.id);
            }
        }

        if (details && details.length > 0) {
            for (const detail of details) {
                if (detail.id) {
                    const existingDetail = await TransactionDetails.findById(tenantId, companyId, detail.id);
                    if (existingDetail) {
                        const updatedDetail = new TransactionDetails(tenantId, transactionId, transaction_type, detail.subCategoryId, detail.amount, detail.description, companyId, userId, userId);
                        await updatedDetail.update(tenantId, companyId, detail.id);
                    } else {
                        throw new Error(`Transaction detail with ID ${detail.id} not found!`);
                    }
                } else {
                    const newDetail = new TransactionDetails(tenantId, transactionId, transaction_type, detail.subCategoryId, detail.amount, detail.description, companyId, userId, userId);
                    await TransactionDetails.save([newDetail]);
                }
            }
        }

        res.status(200).json({
            success: true,
            message: "Transaction Successfully Updated",
            record: { transaction },
            returnOriginal: false,
            runValidators: true
        });
    } catch (error) {
        if (error.message.includes("Transaction detail with ID")) {
            return res.status(404).json({ success: false, message: error.message });
        }
        console.log(error);
        next(error);
    }
};

module.exports = {
    CreateTransaction,
    ListTransaction,
    getTransactionById,
    deleteTransaction,
    updateTransaction
}