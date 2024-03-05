const Report = require("../models/reports");
const CompanySetting = require("../models/company_setting")
const { getDecodeToken } = require('../middlewares/decoded');

const reportTransaction = (transaction) => {
    const { id, transaction_date, transactionId, transaction_type, payment_type_Id, payment_type_name, clientId, clientName, type, accountId, account_name, group_name_Id, account_group_name, account_type_Id, account_type_name, description, PaidAmount, ReceiveAmount } = transaction;

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
        description,
        paidAmount: +PaidAmount == 0 ? null : +PaidAmount,
        receiveAmount: +ReceiveAmount == 0 ? null : +ReceiveAmount
    };
};

let reportSearch = (q, report) => {
    if (q) {
        const queryLowered = q.toLowerCase();
        return report.filter(report =>
            (report.payment_type_name && report.payment_type_name.toLowerCase().includes(queryLowered)) ||
            (report.account_name && report.account_name.toLowerCase().includes(queryLowered)) ||
            (report.PaidAmount && report.PaidAmount.toString().toLowerCase().includes(queryLowered)) ||
            (report.ReceiveAmount && report.ReceiveAmount.toString().toLowerCase().includes(queryLowered)) ||
            (report.description && report.description.toLowerCase().includes(queryLowered)) ||
            (report.clientName && report.clientName.toLowerCase().includes(queryLowered))
        );
    }
    else {
        return report
    }
};

const ListPaymentReport = async (req, res, next) => {
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
        const { startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount } = req.body;

        if (companyId && req.body.companyId && companyId !== req.body.companyId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: CompanyId in token does not match the requested companyId',
            });
        };

        let report = await Report.findAllPayment(tenantId, companyId, startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount);

        report[0] = reportSearch(q, report[0]);

        const paymentMap = new Map();
        report[0].forEach(transaction => {
            const PaymentId = transaction.payment_type_Id;
            const PaymentName = transaction.payment_type_name;
            const PaidAmount = +(parseFloat(transaction.PaidAmount)).toFixed(2);
            const ReceiveAmount = +(parseFloat(transaction.ReceiveAmount)).toFixed(2);

            if (paymentMap.has(PaymentId)) {
                const existingData = paymentMap.get(PaymentId);
                existingData.PaidAmount = +(existingData.PaidAmount + PaidAmount).toFixed(2);
                existingData.ReceiveAmount = +(existingData.ReceiveAmount + ReceiveAmount).toFixed(2);
                existingData.BalanceAmount = +(existingData.ReceiveAmount - existingData.PaidAmount).toFixed(2);
                existingData.paymentDetails.push(reportTransaction(transaction));
            } else {
                paymentMap.set(PaymentId, {
                    PaymentId,
                    PaymentName,
                    PaidAmount,
                    ReceiveAmount,
                    BalanceAmount: +(ReceiveAmount - PaidAmount).toFixed(2),
                    paymentDetails: [reportTransaction(transaction)]
                });
            }
        });

        let responseData = {
            success: true,
            message: 'Payment Report List Successfully!',
            data: Array.from(paymentMap.values()).sort((a, b) => {
                const nameA = a.PaymentName.toUpperCase();
                const nameB = b.PaymentName.toUpperCase();

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

const ListClientReport = async (req, res, next) => {
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
        const { startDate, endDate, clientTypeIds, paymentTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount } = req.body;
        if (companyId && req.body.companyId && companyId !== req.body.companyId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: CompanyId in token does not match the requested companyId',
            });
        };

        let report = await Report.findAllClient(tenantId, companyId, startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount);

        report[0] = reportSearch(q, report[0])

        const clientMap = new Map();
        report[0].filter(x => x.clientId != null).forEach(transaction => {
            const clientId = transaction.clientId;
            const clientName = transaction.clientName;
            const PaidAmount = +(parseFloat(transaction.PaidAmount)).toFixed(2);
            const ReceiveAmount = +(parseFloat(transaction.ReceiveAmount)).toFixed(2);

            if (clientMap.has(clientId)) {
                const existingData = clientMap.get(clientId);
                existingData.PaidAmount = +(existingData.PaidAmount + PaidAmount).toFixed(2);
                existingData.ReceiveAmount = +(existingData.ReceiveAmount + ReceiveAmount).toFixed(2);
                existingData.BalanceAmount = +(existingData.ReceiveAmount - existingData.PaidAmount).toFixed(2);
                existingData.paymentDetails.push(reportTransaction(transaction));
            } else {
                clientMap.set(clientId, {
                    clientId,
                    clientName,
                    PaidAmount,
                    ReceiveAmount,
                    BalanceAmount: +(ReceiveAmount - PaidAmount).toFixed(2),
                    paymentDetails: [reportTransaction(transaction)]
                });
            }
        });

        let responseData = {
            success: true,
            message: 'Client Report List Successfully!',
            data: Array.from(clientMap.values()).sort((a, b) => {
                const nameA = a.clientName.toUpperCase();
                const nameB = b.clientName.toUpperCase();

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

const ListCategoryReport = async (req, res, next) => {
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
        const { startDate, endDate, categoryTypeIds, paymentTypeIds, clientTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount } = req.body;
        if (companyId && req.body.companyId && companyId !== req.body.companyId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: CompanyId in token does not match the requested companyId',
            });
        };

        let report = await Report.findAllCategory(tenantId, companyId, startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount);

        report[0] = reportSearch(q, report[0]);

        const clientMap = new Map();
        report[0].filter(x => x.clientId != null).forEach(transaction => {
            const clientId = transaction.clientId;
            const clientName = transaction.clientName;
            const PaidAmount = +(parseFloat(transaction.PaidAmount)).toFixed(2);
            const ReceiveAmount = +(parseFloat(transaction.ReceiveAmount)).toFixed(2);

            if (clientMap.has(clientId)) {
                const existingData = clientMap.get(clientId);
                existingData.PaidAmount = +(existingData.PaidAmount + PaidAmount).toFixed(2);
                existingData.ReceiveAmount = +(existingData.ReceiveAmount + ReceiveAmount).toFixed(2);
                existingData.BalanceAmount = +(existingData.ReceiveAmount - existingData.PaidAmount).toFixed(2);
                existingData.paymentDetails.push(reportTransaction(transaction));
            } else {
                clientMap.set(clientId, {
                    clientId,
                    clientName,
                    PaidAmount,
                    ReceiveAmount,
                    BalanceAmount: +(ReceiveAmount - PaidAmount).toFixed(2),
                    paymentDetails: [reportTransaction(transaction)]
                });
            }
        });

        let responseData = {
            success: true,
            message: 'Category Report List Successfully!',
            data: Array.from(clientMap.values()).sort((a, b) => {
                const nameA = a.clientName.toUpperCase();
                const nameB = b.clientName.toUpperCase();

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

const ListAccountReport = async (req, res, next) => {
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
        const { startDate, endDate, accountIds, paymentTypeIds, clientTypeIds, categoryTypeIds, groupTypeIds, accountTypeIds, fromAmount, toAmount } = req.body;

        if (companyId && req.body.companyId && companyId !== req.body.companyId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: CompanyId in token does not match the requested companyId',
            });
        };

        let report = await Report.findAllAccount(tenantId, companyId, startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount);

        report[0] = reportSearch(q, report[0])

        const accountMap = new Map();
        report[0].forEach(transaction => {
            const accountId = transaction.accountId;
            const accountName = transaction.account_name;
            const PaidAmount = +(parseFloat(transaction.PaidAmount)).toFixed(2);
            const ReceiveAmount = +(parseFloat(transaction.ReceiveAmount)).toFixed(2);

            if (accountMap.has(accountId)) {
                const existingData = accountMap.get(accountId);
                existingData.PaidAmount = +(existingData.PaidAmount + PaidAmount).toFixed(2);
                existingData.ReceiveAmount = +(existingData.ReceiveAmount + ReceiveAmount).toFixed(2);
                existingData.BalanceAmount = +(existingData.ReceiveAmount - existingData.PaidAmount).toFixed(2);
                existingData.accounts.push(reportTransaction(transaction));
            } else {
                accountMap.set(accountId, {
                    accountId,
                    accountName,
                    PaidAmount,
                    ReceiveAmount,
                    BalanceAmount: +(ReceiveAmount - PaidAmount).toFixed(2),
                    accounts: [reportTransaction(transaction)]
                });
            }
        });

        const responseData = {
            success: true,
            message: 'Account Report List Successfully!',
            data: Array.from(accountMap.values()).sort((a, b) => {
                const nameA = a.accountName.toUpperCase();
                const nameB = b.accountName.toUpperCase();

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

const ListGroupReport = async (req, res, next) => {
    const tokenInfo = getDecodeToken(req);

    try {
        const { q = '' } = req.query;
        const companyId = tokenInfo.decodedToken.companyId;

        const { tenantId } = tokenInfo.decodedToken;
        const { startDate, endDate, groupTypeIds, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, accountTypeIds, fromAmount, toAmount } = req.body;

        if (companyId && req.body.companyId && companyId !== req.body.companyId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: CompanyId in token does not match the requested companyId',
            });
        }

        let report = await Report.findAllGroup(tenantId, companyId, startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount);

        report[0] = reportSearch(q, report[0])

        const groupMap = new Map();
        report[0].forEach(transaction => {
            const GroupId = transaction.group_name_Id;
            const GroupName = transaction.account_group_name;
            const PaidAmount = +(parseFloat(transaction.PaidAmount)).toFixed(2);
            const ReceiveAmount = +(parseFloat(transaction.ReceiveAmount)).toFixed(2);

            if (groupMap.has(GroupId)) {
                const existingData = groupMap.get(GroupId);
                existingData.PaidAmount = +(existingData.PaidAmount + PaidAmount).toFixed(2);
                existingData.ReceiveAmount = +(existingData.ReceiveAmount + ReceiveAmount).toFixed(2);
                existingData.BalanceAmount = +(existingData.ReceiveAmount - existingData.PaidAmount).toFixed(2);
                existingData.groupDetails.push(reportTransaction(transaction));
            } else {
                groupMap.set(GroupId, {
                    GroupId,
                    GroupName,
                    PaidAmount,
                    ReceiveAmount,
                    BalanceAmount: +(ReceiveAmount - PaidAmount).toFixed(2),
                    groupDetails: [reportTransaction(transaction)]
                });
            }
        });

        let responseData = {
            success: true,
            message: 'Group Report List Successfully!',
            data: Array.from(groupMap.values()).sort((a, b) => {
                const nameA = a.GroupName.toUpperCase();
                const nameB = b.GroupName.toUpperCase();

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

const ListCompanyReport = async (req, res, next) => {
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
        const { startDate, endDate, clientTypeIds, paymentTypeIds, categoryTypeIds, accountIds, groupTypeIds, fromAmount, toAmount } = req.body;
        if (companyId && req.body.companyId && companyId !== req.body.companyId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: CompanyId in token does not match the requested companyId',
            });
        }

        let report = await Report.findAllCompany(tenantId, companyId, startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, fromAmount, toAmount);

        report[0] = reportSearch(q, report[0])

        let responseData = {
            success: true,
            message: 'Company Report List Successfully!',
            data: report[0]
        };

        res.status(200).json(responseData);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

const ListAccountTypeReport = async (req, res, next) => {
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
        const { startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount } = req.body;

        if (companyId && req.body.companyId && companyId !== req.body.companyId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: CompanyId in token does not match the requested companyId',
            });
        }

        let report = await Report.findAllAccountType(tenantId, companyId, startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount);

        report[0] = reportSearch(q, report[0])

        const accountTypeMap = new Map();
        report[0].forEach(transaction => {
            const accountTypeId = transaction.account_type_Id;
            const accountTypeName = transaction.account_type_name;
            const PaidAmount = +(parseFloat(transaction.PaidAmount)).toFixed(2);
            const ReceiveAmount = +(parseFloat(transaction.ReceiveAmount)).toFixed(2);

            if (accountTypeMap.has(accountTypeId)) {
                const existingData = accountTypeMap.get(accountTypeId);
                existingData.PaidAmount = +(existingData.PaidAmount + PaidAmount).toFixed(2);
                existingData.ReceiveAmount = +(existingData.ReceiveAmount + ReceiveAmount).toFixed(2);
                existingData.BalanceAmount = +(existingData.ReceiveAmount - existingData.PaidAmount).toFixed(2);
                existingData.paymentDetails.push(reportTransaction(transaction));
            } else {
                accountTypeMap.set(accountTypeId, {
                    accountTypeId,
                    accountTypeName,
                    PaidAmount,
                    ReceiveAmount,
                    BalanceAmount: +(ReceiveAmount - PaidAmount).toFixed(2),
                    paymentDetails: [reportTransaction(transaction)]
                });
            }
        });

        let responseData = {
            success: true,
            message: 'Account Type Report List Successfully!',
            data: Array.from(accountTypeMap.values()).sort((a, b) => {
                const nameA = a.accountTypeName.toUpperCase();
                const nameB = b.accountTypeName.toUpperCase();

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

const getFiscalAndFrequencyYearMonth = (dateString, fiscalStartMonth, selectedFrequency) => {
    let startYear;
    let fiscalMonthYear;
    let FrequencyValue = 12;

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    if (selectedFrequency == 'quarterly') {
        FrequencyValue = 3;
    } else if (selectedFrequency == 'semiannual') {
        FrequencyValue = 6;
    }

    if (month < fiscalStartMonth) {
        startYear = year - 1;
    } else {
        startYear = year;
    }

    if (FrequencyValue === 12) {
        return `${startYear}-${String(startYear + 1).slice(2)}`;
    }

    if (month < fiscalStartMonth) {
        fiscalMonthYear = 12 - fiscalStartMonth + month + 1;
    } else {
        fiscalMonthYear = month - fiscalStartMonth + 1;
    }

    let finalQueter = Math.ceil(fiscalMonthYear / FrequencyValue);
    if (FrequencyValue == 3) {
        return `${startYear}-Q${finalQueter}`
    }
    if (FrequencyValue == 6) {
        return `${startYear}-H${finalQueter}`
    }

    return `${startYear}`;
};

const getDateMonth = (dateString) => {
    let now = new Date(dateString);
    if (now.getMonth() == 11) {
        var current = new Date(now.getFullYear() + 1, 0, 1);
    } else {
        var current = new Date(now.getFullYear(), now.getMonth(), 1);
    };
    let year = current.getFullYear();
    let month = current.getMonth() + 1;
    let formattedMonth = month < 10 ? '0' + month : month;
    return year + '-' + formattedMonth + '-' + '01';
}

const ListAnnuallyReport = async (req, res, next) => {
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
        const { startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount } = req.body;

        if (companyId && req.body.companyId && companyId !== req.body.companyId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: CompanyId in token does not match the requested companyId',
            });
        }

        let companysetting = await CompanySetting.findAll(tenantId, companyId)
        let fiscalStartMonth = 4
        if (companysetting[0].length > 0) {
            fiscalStartMonth = companysetting[0][0].fiscal_start_month
        }

        let report = await Report.findAllAnnually(tenantId, companyId, startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount);

        report[0] = reportSearch(q, report[0])

        const accountTypeMap = new Map();
        report[0].forEach(transaction => {
            const PaidAmount = +(parseFloat(transaction.PaidAmount)).toFixed(2);
            const ReceiveAmount = +(parseFloat(transaction.ReceiveAmount)).toFixed(2);
            const fiscalId = getFiscalAndFrequencyYearMonth(transaction.transaction_date, fiscalStartMonth, 'annually')
            const fiscalName = fiscalId
            if (accountTypeMap.has(fiscalId)) {
                const existingData = accountTypeMap.get(fiscalId);
                existingData.PaidAmount = +(existingData.PaidAmount + PaidAmount).toFixed(2);
                existingData.ReceiveAmount = +(existingData.ReceiveAmount + ReceiveAmount).toFixed(2);
                existingData.BalanceAmount = +(existingData.ReceiveAmount - existingData.PaidAmount).toFixed(2);
                existingData.paymentDetails.push(reportTransaction(transaction));
            } else {
                accountTypeMap.set(fiscalId, {
                    fiscalId,
                    fiscalName,
                    PaidAmount,
                    ReceiveAmount,
                    BalanceAmount: +(ReceiveAmount - PaidAmount).toFixed(2),
                    paymentDetails: [reportTransaction(transaction)]
                });
            }
        });

        let responseData = {
            success: true,
            message: 'Annually Report List Successfully!',
            data: Array.from(accountTypeMap.values()).sort((a, b) => {
                const nameA = a.fiscalId.toUpperCase();
                const nameB = b.fiscalId.toUpperCase();

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

const ListQuarterlyReport = async (req, res, next) => {
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
        const { startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount } = req.body;

        if (companyId && req.body.companyId && companyId !== req.body.companyId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: CompanyId in token does not match the requested companyId',
            });
        }

        let companysetting = await CompanySetting.findAll(tenantId, companyId)
        let fiscalStartMonth = 4
        if (companysetting[0].length > 0) {
            fiscalStartMonth = companysetting[0][0].fiscal_start_month
        }

        let report = await Report.findAllQuarterly(tenantId, companyId, startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount);

        report[0] = reportSearch(q, report[0])

        const accountTypeMap = new Map();
        report[0].forEach(transaction => {
            const PaidAmount = +(parseFloat(transaction.PaidAmount)).toFixed(2);
            const ReceiveAmount = +(parseFloat(transaction.ReceiveAmount)).toFixed(2);
            const fiscalId = getFiscalAndFrequencyYearMonth(transaction.transaction_date, fiscalStartMonth, 'quarterly')
            const fiscalName = fiscalId.split('-').reverse().join(' ')
            if (accountTypeMap.has(fiscalId)) {
                const existingData = accountTypeMap.get(fiscalId);
                existingData.PaidAmount = +(existingData.PaidAmount + PaidAmount).toFixed(2);
                existingData.ReceiveAmount = +(existingData.ReceiveAmount + ReceiveAmount).toFixed(2);
                existingData.BalanceAmount = +(existingData.ReceiveAmount - existingData.PaidAmount).toFixed(2);
                existingData.paymentDetails.push(reportTransaction(transaction));
            } else {
                accountTypeMap.set(fiscalId, {
                    fiscalId,
                    fiscalName,
                    PaidAmount,
                    ReceiveAmount,
                    BalanceAmount: +(ReceiveAmount - PaidAmount).toFixed(2),
                    paymentDetails: [reportTransaction(transaction)]
                });
            }
        });

        let responseData = {
            success: true,
            message: 'Quarterly Report List Successfully!',
            data: Array.from(accountTypeMap.values()).sort((a, b) => {
                const nameA = a.fiscalId.toUpperCase();
                const nameB = b.fiscalId.toUpperCase();

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

const ListSemiannualReport = async (req, res, next) => {
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
        const { startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount } = req.body;

        if (companyId && req.body.companyId && companyId !== req.body.companyId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: CompanyId in token does not match the requested companyId',
            });
        }

        let companysetting = await CompanySetting.findAll(tenantId, companyId)
        let fiscalStartMonth = 4
        if (companysetting[0].length > 0) {
            fiscalStartMonth = companysetting[0][0].fiscal_start_month
        }

        let report = await Report.findAllSemiannual(tenantId, companyId, startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount);

        report[0] = reportSearch(q, report[0])

        const accountTypeMap = new Map();
        report[0].forEach(transaction => {
            const PaidAmount = +(parseFloat(transaction.PaidAmount)).toFixed(2);
            const ReceiveAmount = +(parseFloat(transaction.ReceiveAmount)).toFixed(2);
            const fiscalId = getFiscalAndFrequencyYearMonth(transaction.transaction_date, fiscalStartMonth, 'semiannual')
            const fiscalName = fiscalId.split('-').reverse().join(' ')
            if (accountTypeMap.has(fiscalId)) {
                const existingData = accountTypeMap.get(fiscalId);
                existingData.PaidAmount = +(existingData.PaidAmount + PaidAmount).toFixed(2);
                existingData.ReceiveAmount = +(existingData.ReceiveAmount + ReceiveAmount).toFixed(2);
                existingData.BalanceAmount = +(existingData.ReceiveAmount - existingData.PaidAmount).toFixed(2);
                existingData.paymentDetails.push(reportTransaction(transaction));
            } else {
                accountTypeMap.set(fiscalId, {
                    fiscalId,
                    fiscalName,
                    PaidAmount,
                    ReceiveAmount,
                    BalanceAmount: +(ReceiveAmount - PaidAmount).toFixed(2),
                    paymentDetails: [reportTransaction(transaction)]
                });
            }
        });

        let responseData = {
            success: true,
            message: 'Semiannual Report List Successfully!',
            data: Array.from(accountTypeMap.values()).sort((a, b) => {
                const nameA = a.fiscalId.toUpperCase();
                const nameB = b.fiscalId.toUpperCase();

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

const ListMonthlyReport = async (req, res, next) => {
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
        const { startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds } = req.body;

        if (companyId && req.body.companyId && companyId !== req.body.companyId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: CompanyId in token does not match the requested companyId',
            });
        }

        let companysetting = await CompanySetting.findAll(tenantId, companyId)
        let fiscalStartMonth = 4
        if (companysetting[0].length > 0) {
            fiscalStartMonth = companysetting[0][0].fiscal_start_month
        }

        let report = await Report.findAllMonthly(tenantId, companyId, startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds);

        const accountTypeMap = new Map();
        report[0].forEach(transaction => {
            const PaidAmount = +(parseFloat(transaction.PaidAmount)).toFixed(2);
            const ReceiveAmount = +(parseFloat(transaction.ReceiveAmount)).toFixed(2);
            const fiscalId = getDateMonth(transaction.transaction_date)
            const fiscalName = new Date(fiscalId)
            if (accountTypeMap.has(fiscalId)) {
                const existingData = accountTypeMap.get(fiscalId);
                existingData.PaidAmount = +(existingData.PaidAmount + PaidAmount).toFixed(2);
                existingData.ReceiveAmount = +(existingData.ReceiveAmount + ReceiveAmount).toFixed(2);
                existingData.BalanceAmount = +(existingData.ReceiveAmount - existingData.PaidAmount).toFixed(2);
                existingData.paymentDetails.push(reportTransaction(transaction));
            } else {
                accountTypeMap.set(fiscalId, {
                    fiscalId,
                    fiscalName,
                    PaidAmount,
                    ReceiveAmount,
                    BalanceAmount: +(ReceiveAmount - PaidAmount).toFixed(2),
                    paymentDetails: [reportTransaction(transaction)]
                });
            }
        });

        let responseData = {
            success: true,
            message: 'Monthly Report List Successfully!',
            data: Array.from(accountTypeMap.values()).sort((a, b) => {
                const nameA = a.fiscalId.toUpperCase();
                const nameB = b.fiscalId.toUpperCase();

                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }

                return 0;
            })
        };

        if (q) {
            const queryLowered = q.toLowerCase();
            const filteredData = responseData.data.filter(accountType =>
                (accountType.payment_type_name && accountType.payment_type_name.toLowerCase().includes(queryLowered)) ||
                (accountType.account_name && accountType.account_name.toLowerCase().includes(queryLowered)) ||
                (accountType.PaidAmount && accountType.PaidAmount.toString().toLowerCase().includes(queryLowered)) ||
                (accountType.ReceiveAmount && accountType.ReceiveAmount.toString().toLowerCase().includes(queryLowered)) ||
                (accountType.description && accountType.description.toLowerCase().includes(queryLowered)) ||
                (accountType.clientName && accountType.clientName.toLowerCase().includes(queryLowered))
            );

            if (filteredData.length > 0) {
                responseData = {
                    ...responseData,
                    data: filteredData,
                    total: filteredData.length,
                };
            } else {
                responseData = {
                    ...responseData,
                    message: 'No matching Account Type Report found',
                    data: [],
                    total: 0,
                };
            }
        }

        res.status(200).json(responseData);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

module.exports = {
    ListPaymentReport,
    ListClientReport,
    ListCategoryReport,
    ListAccountReport,
    ListGroupReport,
    ListCompanyReport,
    ListAccountTypeReport,
    ListAnnuallyReport,
    ListQuarterlyReport,
    ListSemiannualReport,
    ListMonthlyReport
};