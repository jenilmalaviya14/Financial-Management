const Transaction = require("../models/transaction");
const { createTransactionSchema, updateTransactionSchema } = require('../validation/transaction.validation');
const { getDecodeToken } = require('../middlewares/decoded');
const { date } = require("joi");

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

        let { transaction_date, transaction_type, payment_type_Id, accountId, amount, description, clientId } = req.body;

        const companyId = token.decodedToken.companyId;
        const tenantId = token.decodedToken.tenantId;
        const userId = token.decodedToken.userId;

        let transaction = new Transaction(tenantId, transaction_date, transaction_type, payment_type_Id, accountId, amount, description, '', '', '', clientId);

        transaction.companyId = companyId;
        transaction.createdBy = userId;
        transaction.updatedBy = userId;

        transaction = await transaction.save()

        res.status(200).json({
            success: true,
            message: "Transaction create successfully!",
            record: { transaction }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        })
        console.log(error);
    }
};

const ListTransaction = async (req, res, next) => {
    const token = getDecodeToken(req);
    try {
        const { q = '' } = req.query;
        const { limit, startDate, endDate, type, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds } = req.body;
        const companyId = token.decodedToken.companyId;
        const { tenantId } = token.decodedToken;

        let transaction = await Transaction.findAll(tenantId, companyId, startDate, endDate, type, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, limit);

        transaction[0] = transactionSearch(q, transaction[0]);

        let responseData = {
            success: true,
            message: 'Transaction List Successfully!',
            data: transaction[0]
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
            message: "Transaction Record Successfully!",
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
    try {
        let Id = req.params.id;
        await Transaction.delete(tenantId, Id)
        res.status(200).json({
            success: true,
            message: "Transaction Delete Successfully!"
        });
    } catch (error) {
        console.log(error);
        next(error)
    }
};

const updateTransaction = async (req, res, next) => {
    const token = getDecodeToken(req);
    const companyId = token.decodedToken.companyId;
    const tenantId = token.decodedToken.tenantId;
    const userId = token.decodedToken.userId;
    try {

        const { error } = updateTransactionSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        };

        let { transaction_date, transaction_type, payment_type_Id, accountId, amount, description, clientId } = req.body;

        let transaction = new Transaction(tenantId, transaction_date, transaction_type, payment_type_Id, accountId, amount, description, '', '', companyId, clientId);

        transaction.createdBy = userId;
        transaction.updatedBy = userId;

        let Id = req.params.id;
        let [findtransaction, _] = await Transaction.findById(tenantId, Id);
        if (!findtransaction) {
            throw new Error("Transaction not found!")
        }
        await transaction.update(tenantId, Id)
        res.status(200).json({
            success: true,
            message: "Transaction Successfully Updated",
            record: { transaction }, returnOriginal: false, runValidators: true
        });
    } catch (error) {
        console.log(error);
        next(error)
    }
};

module.exports = {
    CreateTransaction,
    ListTransaction,
    getTransactionById,
    deleteTransaction,
    updateTransaction
}