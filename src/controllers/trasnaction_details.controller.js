const TransactionDetails = require("../models/trasnaction_details");
const { getDecodeToken } = require('../middlewares/decoded');

const reportTransaction = (transaction) => {
    const { id, transaction_date, transactionId, transaction_type, payment_type_Id, payment_type_name, clientId, clientName, type, accountId, account_name, group_name_Id, account_group_name, account_type_Id, account_type_name, subCategoryId, sub_category_name, description, PaidAmount, ReceiveAmount } = transaction;

    return {
        id,
        transactionDate: transaction_date,
        trasactionId: transactionId,
        transactionType: transaction_type,
        paymentTypeId: payment_type_Id,
        paymentTypeName: payment_type_name,
        clientId: clientId,
        clientName: clientName,
        type,
        accountId: accountId,
        accountName: account_name,
        groupId: group_name_Id,
        groupName: account_group_name,
        accountTypeId: account_type_Id,
        accountTypeName: account_type_name,
        subCategoryName: sub_category_name,
        subCategoryId,
        description,
        paidAmount: +PaidAmount == 0 ? null : +PaidAmount,
        receiveAmount: +ReceiveAmount == 0 ? null : +ReceiveAmount
    };
};

const ListTransactionDetails = async (req, res, next) => {
    const tokenInfo = getDecodeToken(req);

    if (!tokenInfo.success) {
        return res.status(401).json({
            success: false,
            message: tokenInfo.message,
        });
    }

    try {
        const { q = '' } = req.query;
        const companyId = tokenInfo.decodedToken.companyId;
        const { tenantId } = tokenInfo.decodedToken;
        const { startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, subcategoryTypeIds, fromAmount, toAmount } = req.body;

        let report = await TransactionDetails.findAllTransactionDetails(tenantId, companyId, startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, subcategoryTypeIds, fromAmount, toAmount);

        const paymentMap = new Map();
        report[0].forEach(transaction => {
            const subCategoryId = transaction.subCategoryId;
            const subCategoryName = transaction.sub_category_name;
            const PaidAmount = +(parseFloat(transaction.PaidAmount)).toFixed(2);
            const ReceiveAmount = +(parseFloat(transaction.ReceiveAmount)).toFixed(2);

            if (paymentMap.has(subCategoryId)) {
                const existingData = paymentMap.get(subCategoryId);
                existingData.PaidAmount = +(existingData.PaidAmount + PaidAmount).toFixed(2);
                existingData.ReceiveAmount = +(existingData.ReceiveAmount + ReceiveAmount).toFixed(2);
                existingData.BalanceAmount = +(existingData.ReceiveAmount - existingData.PaidAmount).toFixed(2);
                existingData.paymentDetails.push(reportTransaction(transaction));
            } else {
                paymentMap.set(subCategoryId, {
                    subCategoryId,
                    subCategoryName,
                    PaidAmount,
                    ReceiveAmount,
                    BalanceAmount: +(ReceiveAmount - PaidAmount).toFixed(2),
                    paymentDetails: [reportTransaction(transaction)]
                });
            }
        });

        let responseData = {
            success: true,
            message: 'Transaction list has been fetched Successfully.',
            data: Array.from(paymentMap.values()).sort((a, b) => {
                const nameA = (a.subCategoryName || '').toUpperCase();
                const nameB = (b.subCategoryName || '').toUpperCase();

                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }

                return 0;
            })
        };

        res.status(200).json(responseData);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

module.exports = {
    ListTransactionDetails
}
