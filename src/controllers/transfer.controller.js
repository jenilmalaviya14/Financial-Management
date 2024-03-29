const Transfer = require("../models/transfer");
const TransactionDetails = require("../models/trasnaction_details")
const { createTransferSchema, updateTransferSchema } = require('../validation/transfer.validation');
const { getDecodeToken } = require('../middlewares/decoded');

let transferResultSearch = (q, transferResult) => {
    if (q) {
        const queryLowered = q.toLowerCase();
        return transferResult.filter(transfer =>
            (transfer.payment_type_name && typeof transfer.payment_type_name === 'string' && transfer.payment_type_name.toLowerCase().includes(queryLowered)) ||
            (transfer.fromAccountName && typeof transfer.fromAccountName === 'string' && transfer.fromAccountName.toLowerCase().includes(queryLowered)) ||
            (transfer.toAccountName && typeof transfer.toAccountName === 'string' && transfer.toAccountName.toLowerCase().includes(queryLowered))
        );
    }
    else {
        return transferResult
    }
};

const CreateTransfer = async (req, res) => {
    const token = getDecodeToken(req)
    try {
        const { error } = createTransferSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        };

        let { transactionDate, paymentType_Id, fromAccount, toAccount, amount, description, details } = req.body;

        if (fromAccount === toAccount) {
            return res.status(400).json({ success: false, message: "From and to accounts cannot be the same." });
        }

        const companyId = token.decodedToken.companyId;
        const tenantId = token.decodedToken.tenantId;
        const userId = token.decodedToken.userId;

        let transfer = new Transfer(tenantId, transactionDate, paymentType_Id, fromAccount, toAccount, amount, description);

        transfer.createdBy = userId;
        transfer.updatedBy = userId;

        transfer.companyId = companyId;

        let saveTransfer = await transfer.save()

        if (details && details.length > 0) {
            const transactionDetails = details.map(detail => new TransactionDetails(tenantId, saveTransfer[0].insertId, 'Transfer', detail.subCategoryId, detail.amount, detail.description, companyId, userId, userId));

            await TransactionDetails.save(transactionDetails);
        }

        res.status(200).json({
            success: true,
            message: "Transfer Created Successfully",
            record: { saveTransfer }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        })
        console.log(error);
    }
};

const ListTransfer = async (req, res, next) => {
    const tokenInfo = getDecodeToken(req);

    try {
        const { q = '', id } = req.query;
        const companyId = tokenInfo.decodedToken.companyId;
        const { tenantId } = tokenInfo.decodedToken;
        const { limit, startDate, endDate, paymentTypeIds, accountTypeIds, fromAmount, toAmount } = req.body;

        if (id) {
            const transfer = await Transfer.findById(tenantId, id);

            if (transfer.length === 0) {
                return res.status(404).json({ success: false, message: 'The specified Transfer was not found.' });
            }
            return res.status(200).json({ success: true, message: 'Transfer found', data: transfer[0] });
        }

        let transferResult = await Transfer.findAll(tenantId, companyId, startDate, endDate, paymentTypeIds, accountTypeIds, limit, fromAmount, toAmount);

        transferResult[0] = transferResultSearch(q, transferResult[0]);

        let responseData = {
            success: true,
            message: 'Transfer list has been fetched Successfully.',
            data: transferResult[0]
        };

        if (q) {
            const queryLowered = q.toLowerCase();
            const filteredData = transferResult[0].filter(
                transfer =>
                    (transfer.payment_type_name && typeof transfer.payment_type_name === 'string' && transfer.payment_type_name.toLowerCase().includes(queryLowered)) ||
                    (transfer.fromAccountName && typeof transfer.fromAccountName === 'string' && transfer.fromAccountName.toLowerCase().includes(queryLowered)) ||
                    (transfer.toAccountName && typeof transfer.toAccountName === 'string' && transfer.toAccountName.toLowerCase().includes(queryLowered))
            );

            if (filteredData.length > 0) {
                responseData = {
                    ...responseData,
                    data: filteredData,
                    total: filteredData.length
                };
            } else {
                responseData = {
                    ...responseData,
                    message: 'No matching transfer found',
                    data: [],
                    total: 0
                };
            }
        }

        res.status(200).json(responseData);

    } catch (error) {
        console.error('Error in ListTransfer:', error);
        next(error);
    }
};

const getTransferById = async (req, res, next) => {
    const token = getDecodeToken(req);
    const tenantId = token.decodedToken.tenantId;
    try {
        let Id = req.params.id;
        let [transfer, _] = await Transfer.findById(tenantId, Id);

        res.status(200).json({
            success: true,
            message: "Transfer Record Successfully",
            data: { transfer }
        });
    } catch (error) {
        console.log(error);
        next(error)
    }
};

const deleteTransfer = async (req, res, next) => {
    const token = getDecodeToken(req);
    const tenantId = token.decodedToken.tenantId;
    const companyId = token.decodedToken.companyId;
    try {
        let Id = req.params.id;
        await Transfer.delete(tenantId, Id)

        const transactionDetails = await TransactionDetails.findAllByTransactionId(tenantId, companyId, Id);

        if (transactionDetails.length > 0 && Array.isArray(transactionDetails[0])) {
            const detailIds = transactionDetails[0].map(detail => detail.id);

            if (detailIds.length > 0) {
                await TransactionDetails.delete(tenantId, companyId, detailIds);
            }
        }

        res.status(200).json({
            success: true,
            message: "Transfer Deleted Successfully"
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};

const updateTransfer = async (req, res, next) => {
    const token = getDecodeToken(req);
    const tenantId = token.decodedToken.tenantId;
    const companyId = token.decodedToken.companyId;
    const userId = token.decodedToken.userId;
    try {

        const { error } = updateTransferSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        };

        let { transactionDate, paymentType_Id, fromAccount, toAccount, amount, description, details } = req.body;

        if (fromAccount === toAccount) {
            return res.status(400).json({ success: false, message: "From and to accounts cannot be the same." });
        };

        let transfer = new Transfer(tenantId, transactionDate, paymentType_Id, fromAccount, toAccount, amount, description, companyId)

        transfer.updatedBy = userId

        let transferId = req.params.id;
        let [findtransfer, _] = await Transfer.findById(tenantId, transferId);
        if (!findtransfer) {
            throw new Error("The specified Transfer was not found.!")
        }
        await transfer.update(tenantId, transferId);

        const existingDetailsIds = details.map(detail => detail.id).filter(id => id);
        const existingDetails = await TransactionDetails.findAllByTransactionId(tenantId, companyId, transferId);

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
                        const updatedDetail = new TransactionDetails(tenantId, transferId, 'Transfer', detail.subCategoryId, detail.amount, detail.description, companyId, userId, userId);
                        await updatedDetail.update(tenantId, companyId, detail.id);
                    } else {
                        throw new Error(`Transaction detail with ID ${detail.id} not found!`);
                    }
                } else {
                    const newDetail = new TransactionDetails(tenantId, transferId, 'Transfer', detail.subCategoryId, detail.amount, detail.description, companyId, userId, userId);
                    await TransactionDetails.save([newDetail]);
                }
            }
        }

        res.status(200).json({
            success: true,
            message: "Transfer Successfully Updated",
            record: { transfer }, returnOriginal: false, runValidators: true
        });
    } catch (error) {
        console.log(error);
        next(error)
    }
};


module.exports = {
    CreateTransfer,
    ListTransfer,
    getTransferById,
    deleteTransfer,
    updateTransfer
}