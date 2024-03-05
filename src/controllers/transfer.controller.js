const Transfer = require("../models/transfer");
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

        let { transactionDate, paymentType_Id, fromAccount, toAccount, amount, description } = req.body;

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

        transfer = await transfer.save()

        res.status(200).json({
            success: true,
            message: "Transfer create successfully!",
            record: { transfer }
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
        const { limit, startDate, endDate, paymentTypeIds, accountTypeIds } = req.body;

        if (id) {
            const transfer = await Transfer.findById(tenantId, id);

            if (transfer.length === 0) {
                return res.status(404).json({ success: false, message: 'Transfer not found' });
            }
            return res.status(200).json({ success: true, message: 'Transfer found', data: transfer[0] });
        }

        let transferResult = await Transfer.findAll(tenantId, companyId, startDate, endDate, paymentTypeIds, accountTypeIds, limit);

        transferResult[0] = transferResultSearch(q, transferResult[0]);

        let responseData = {
            success: true,
            message: 'Transfer List Successfully!',
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
            message: "Transfer Record Successfully!",
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
    try {
        let Id = req.params.id;
        await Transfer.delete(tenantId, Id)
        res.status(200).json({
            success: true,
            message: "Transfer Delete Successfully!"
        });
    } catch (error) {
        console.log(error);
        next(error)
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

        let { transactionDate, paymentType_Id, fromAccount, toAccount, amount, description } = req.body;

        if (fromAccount === toAccount) {
            return res.status(400).json({ success: false, message: "From and to accounts cannot be the same." });
        };

        let transfer = new Transfer(tenantId, transactionDate, paymentType_Id, fromAccount, toAccount, amount, description, companyId)

        transfer.updatedBy = userId

        let Id = req.params.id;
        let [findtransfer, _] = await Transfer.findById(tenantId, Id);
        if (!findtransfer) {
            throw new Error("Transfer not found!")
        }
        await transfer.update(tenantId, Id)
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