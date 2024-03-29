const Account = require("../models/account");
const { createAccountSchema, updateAccountSchema } = require('../validation/account.validation');
const { getDecodeToken } = require('../middlewares/decoded');

let accountResultSearch = (q, accountResult) => {
    if (q) {
        const queryLowered = q.toLowerCase();
        return accountResult.filter(account =>
            (account.account_name && account.account_name.toLowerCase().includes(queryLowered)) ||
            (account.group_name && account.group_name.toLowerCase().includes(queryLowered)) ||
            (typeof account.join_date === 'string' && account.join_date.toLowerCase().includes(queryLowered)) ||
            (account.account_type_name && account.account_type_name.toLowerCase().includes(queryLowered)) ||
            (typeof account.status === 'string' && account.status.toLowerCase() === "active" && "active".includes(queryLowered))
        );
    }
    else {
        return accountResult;
    }
};

const CreateAccount = async (req, res) => {
    const token = getDecodeToken(req);

    try {
        const { error } = createAccountSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }

        const { account_name, group_name_Id, join_date, exit_date, account_type_Id, status } = req.body;

        const companyId = token.decodedToken.companyId;
        const tenantId = token.decodedToken.tenantId;
        const userId = token.decodedToken.userId;

        let account = new Account(tenantId, account_name, group_name_Id, join_date, exit_date, account_type_Id, status);

        account.companyId = companyId;
        account.createdBy = userId;
        account.updatedBy = userId;

        account = await account.save();

        res.status(200).json({
            success: true,
            message: "Account Created Successfully",
            record: { account }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
        console.log(error);
    }
};

const ListAccount = async (req, res, next) => {
    const token = getDecodeToken(req);
    const companyId = token.decodedToken.companyId;
    const tenantId = token.decodedToken.tenantId;
    try {
        const { q = '', id } = req.query;

        if (id) {
            const account = await Account.findById(id);

            if (account[0].length === 0) {
                return res.status(404).json({ success: false, message: 'The specified Account was not found.' });
            }

            return res.status(200).json({ success: true, message: 'Account found', data: account[0][0] });
        }

        const accountResult = await Account.findAll(tenantId, companyId);

        accountResult[0] = accountResultSearch(q, accountResult[0]);

        let responseData = {
            success: true,
            message: 'Account list has been fetched Successfully.',
            data: accountResult[0]
        };

        res.status(200).json(responseData);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

const ActiveAccount = async (req, res, next) => {
    const token = getDecodeToken(req);
    const companyId = token.decodedToken.companyId;
    const tenantId = token.decodedToken.tenantId;
    try {
        const { q = '', id } = req.query;

        if (id) {
            const account = await Account.findById(id);

            if (account[0].length === 0) {
                return res.status(404).json({ success: false, message: 'The specified Account was not found.' });
            }

            return res.status(200).json({ success: true, message: 'Account found', data: account[0][0] });
        }

        const accountResult = await Account.findActiveAll(tenantId, companyId);

        accountResult[0] = accountResultSearch(q, accountResult[0]);

        let responseData = {
            success: true,
            message: 'Account list has been fetched Successfully.',
            data: accountResult[0]
        };

        res.status(200).json(responseData);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

const getAccountById = async (req, res, next) => {
    try {
        let Id = req.params.id;
        const token = getDecodeToken(req);
        const tenantId = token.decodedToken.tenantId;
        const companyId = token.decodedToken.companyId;

        let [account, _] = await Account.findById(Id, tenantId, companyId);


        res.status(200).json({
            success: true,
            message: "Account Record Successfully",
            data: account[0]
        });
    } catch (error) {
        console.log(error);
        next(error)
    }
};

const deleteAccount = async (req, res, next) => {
    try {
        const token = getDecodeToken(req);
        const accountId = req.params.id;
        const tenantId = token.decodedToken.tenantId;

        const accountValidation = await Account.deleteValidation(accountId)
        if (!accountValidation) {
            res.status(200).json({
                success: false,
                message: "This Account contains Data, You can't Delete it."
            });
        }

        await Account.delete(accountId, tenantId);

        res.status(200).json({
            success: true,
            message: "Account Deleted Successfully"
        });
    } catch (error) {
        console.log(error);
        next(error)
    }
};

const updateAccount = async (req, res, next) => {
    try {
        const token = getDecodeToken(req);

        const { error } = updateAccountSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        };

        let { account_name, group_name_Id, join_date, exit_date, account_type_Id, status, createdBy } = req.body;

        const tenantId = token.decodedToken.tenantId;
        const companyId = token.decodedToken.companyId;
        const userId = token.decodedToken.userId;

        let account = new Account(tenantId, account_name, group_name_Id, join_date, exit_date, account_type_Id, status);

        account.updatedBy = userId;

        let Id = req.params.id;

        let [findaccount, _] = await Account.findById(Id, tenantId, companyId);
        if (!findaccount) {
            throw new Error("The specified Account was not found.!")
        }

        await account.update(Id, tenantId)

        res.status(200).json({
            success: true,
            message: "Account Successfully Updated",
            record: { account }, returnOriginal: false, runValidators: true
        });
    } catch (error) {
        console.log(error);
        next(error)
    }
}

module.exports = {
    CreateAccount,
    ListAccount,
    ActiveAccount,
    getAccountById,
    deleteAccount,
    updateAccount
}