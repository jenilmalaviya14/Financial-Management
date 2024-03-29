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
            message: 'Payment Report list has been fetched Successfully.',
            data: Array.from(paymentMap.values()).sort((a, b) => {
                const nameA = (a.PaymentName || '').toUpperCase();
                const nameB = (b.PaymentName || '').toUpperCase();

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
            message: 'Client Report list has been fetched Successfully.',
            data: Array.from(clientMap.values()).sort((a, b) => {
                const nameA = (a.clientName || '').toUpperCase();
                const nameB = (b.clientName || '').toUpperCase();

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
            message: 'Category Report list has been fetched Successfully.',
            data: Array.from(clientMap.values()).sort((a, b) => {
                const nameA = (a.clientName || '').toUpperCase();
                const nameB = (b.clientName || '').toUpperCase();

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
            message: 'Account Report list has been fetched Successfully.',
            data: Array.from(accountMap.values()).sort((a, b) => {
                const nameA = (a.accountName || '').toUpperCase();
                const nameB = (b.accountName || '').toUpperCase();

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
            message: 'Group Report list has been fetched Successfully.',
            data: Array.from(groupMap.values()).sort((a, b) => {
                const nameA = (a.GroupName || '').toUpperCase();
                const nameB = (b.GroupName || '').toUpperCase();

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
        const { startDate, endDate, clientTypeIds, paymentTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount } = req.body;

        let report = await Report.findAllCompany(tenantId, companyId, startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount);

        report[0] = reportSearch(q, report[0])

        let responseData = {
            success: true,
            message: 'Company Report list has been fetched Successfully.',
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

        let report = await Report.findAllAccountType(tenantId, companyId, startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount);

        report[0] = reportSearch(q, report[0]);

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
            message: 'Account Type Report list has been fetched Successfully.',
            data: Array.from(accountTypeMap.values()).sort((a, b) => {
                const nameA = (a.accountTypeName || '').toUpperCase();
                const nameB = (b.accountTypeName || '').toUpperCase();

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

const getStartDate = (startDate, monthsToAdd) => {
    var inputDate = new Date(startDate);
    inputDate.setMonth(inputDate.getMonth() + monthsToAdd);
    return inputDate.toISOString().split('T')[0];
}

const getEndDate = (startDate, monthsToAdd) => {
    var inputDate = new Date(startDate);
    inputDate.setMonth(inputDate.getMonth() + monthsToAdd);
    inputDate.setDate(0);
    return inputDate.toISOString().split('T')[0];
}

const getFiscalAndFrequencyYearMonth = (dateString, fiscalStartMonth, selectedFrequency) => {
    let startYear;
    let fiscalMonthYear;
    let fiscalId;
    let fiscalStartDate;
    let fiscalEndDate;
    let frequencyValue = 12;

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    // Set Frequency Value
    if (selectedFrequency == 'quarterly') {
        frequencyValue = 3;
    } else if (selectedFrequency == 'semiannual') {
        frequencyValue = 6;
    }
    // Get Fiscal Year
    if (month < fiscalStartMonth) {
        startYear = year - 1;
    } else {
        startYear = year;
    }
    // Get fiscalStartDate Base on Start Year
    fiscalStartDate = `${startYear}-${String(fiscalStartMonth).padStart(2, '0')}-01`;

    if (frequencyValue === 12) {
        fiscalEndDate = getEndDate(fiscalStartDate, frequencyValue);
        fiscalId = `${startYear}-${String(startYear + 1).slice(2)}`;
        return {
            fiscalId,
            fiscalName: fiscalId,
            fiscalStartDate: new Date(fiscalStartDate),
            fiscalEndDate: new Date(fiscalEndDate)
        };
    }

    if (month < fiscalStartMonth) {
        fiscalMonthYear = 12 - fiscalStartMonth + month + 1;
    } else {
        fiscalMonthYear = month - fiscalStartMonth + 1;
    }

    const finalFrequencyValue = Math.ceil(fiscalMonthYear / frequencyValue);
    const getMonthsBasedOnFrequency = (finalFrequencyValue - 1) * frequencyValue;
    fiscalStartDate = getStartDate(fiscalStartDate, getMonthsBasedOnFrequency);
    fiscalEndDate = getEndDate(fiscalStartDate, frequencyValue);

    if (frequencyValue == 3) {
        fiscalId = `${startYear}-Q${finalFrequencyValue}`;
    } else if (frequencyValue == 6) {
        fiscalId = `${startYear}-H${finalFrequencyValue}`;
    }
    return {
        fiscalId,
        fiscalName: fiscalId.split('-').reverse().join(' '),
        fiscalStartDate: new Date(fiscalStartDate),
        fiscalEndDate: new Date(fiscalEndDate)
    };
}

const getDateMonth = (dateString) => {
    const current = new Date(dateString);
    const year = current.getFullYear();
    const month = current.getMonth() + 1;
    const fiscalStartDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const fiscalEndDate = getEndDate(fiscalStartDate, 1);

    return {
        fiscalId: fiscalStartDate,
        fiscalName: new Date(fiscalStartDate),
        fiscalStartDate: new Date(fiscalStartDate),
        fiscalEndDate: new Date(fiscalEndDate)
    };

}

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
        const { startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount } = req.body;

        let companysetting = await CompanySetting.findAll(tenantId, companyId)
        let fiscalStartMonth = 4
        if (companysetting[0].length > 0) {
            fiscalStartMonth = companysetting[0][0].fiscal_start_month
        }

        let report = await Report.findAllMonthly(tenantId, companyId, startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount);

        const accountTypeMap = new Map();
        report[0].forEach(transaction => {
            const PaidAmount = +(parseFloat(transaction.PaidAmount)).toFixed(2);
            const ReceiveAmount = +(parseFloat(transaction.ReceiveAmount)).toFixed(2);
            const fiscalData = getDateMonth(transaction.transaction_date)
            const fiscalId = fiscalData.fiscalId
            if (accountTypeMap.has(fiscalId)) {
                const existingData = accountTypeMap.get(fiscalId);
                existingData.PaidAmount = +(existingData.PaidAmount + PaidAmount).toFixed(2);
                existingData.ReceiveAmount = +(existingData.ReceiveAmount + ReceiveAmount).toFixed(2);
                existingData.BalanceAmount = +(existingData.ReceiveAmount - existingData.PaidAmount).toFixed(2);
                existingData.paymentDetails.push(reportTransaction(transaction));
            } else {
                accountTypeMap.set(fiscalId, {
                    fiscalId,
                    fiscalName: fiscalData.fiscalName,
                    fiscalStartDate: fiscalData.fiscalStartDate,
                    fiscalEndDate: fiscalData.fiscalEndDate,
                    PaidAmount,
                    ReceiveAmount,
                    BalanceAmount: +(ReceiveAmount - PaidAmount).toFixed(2),
                    paymentDetails: [reportTransaction(transaction)]
                });
            }
        });

        let responseData = {
            success: true,
            message: 'Monthly Report list has been fetched Successfully.',
            data: Array.from(accountTypeMap.values()).sort((a, b) => {
                const nameA = (a.fiscalId || '').toUpperCase();
                const nameB = (b.fiscalId || '').toUpperCase();

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
            const fiscalData = getFiscalAndFrequencyYearMonth(transaction.transaction_date, fiscalStartMonth, 'quarterly');
            const fiscalId = fiscalData.fiscalId;
            if (accountTypeMap.has(fiscalId)) {
                const existingData = accountTypeMap.get(fiscalId);
                existingData.PaidAmount = +(existingData.PaidAmount + PaidAmount).toFixed(2);
                existingData.ReceiveAmount = +(existingData.ReceiveAmount + ReceiveAmount).toFixed(2);
                existingData.BalanceAmount = +(existingData.ReceiveAmount - existingData.PaidAmount).toFixed(2);
                existingData.paymentDetails.push(reportTransaction(transaction));
            } else {
                accountTypeMap.set(fiscalId, {
                    fiscalId,
                    fiscalName: fiscalData.fiscalName,
                    fiscalStartDate: fiscalData.fiscalStartDate,
                    fiscalEndDate: fiscalData.fiscalEndDate,
                    PaidAmount,
                    ReceiveAmount,
                    BalanceAmount: +(ReceiveAmount - PaidAmount).toFixed(2),
                    paymentDetails: [reportTransaction(transaction)]
                });
            }
        });

        let responseData = {
            success: true,
            message: 'Quarterly Report list has been fetched Successfully.',
            data: Array.from(accountTypeMap.values()).sort((a, b) => {
                const nameA = (a.fiscalId || '').toUpperCase();
                const nameB = (b.fiscalId || '').toUpperCase();

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
            const fiscalData = getFiscalAndFrequencyYearMonth(transaction.transaction_date, fiscalStartMonth, 'semiannual');
            const fiscalId = fiscalData.fiscalId;
            if (accountTypeMap.has(fiscalId)) {
                const existingData = accountTypeMap.get(fiscalId);
                existingData.PaidAmount = +(existingData.PaidAmount + PaidAmount).toFixed(2);
                existingData.ReceiveAmount = +(existingData.ReceiveAmount + ReceiveAmount).toFixed(2);
                existingData.BalanceAmount = +(existingData.ReceiveAmount - existingData.PaidAmount).toFixed(2);
                existingData.paymentDetails.push(reportTransaction(transaction));
            } else {
                accountTypeMap.set(fiscalId, {
                    fiscalId,
                    fiscalName: fiscalData.fiscalName,
                    fiscalStartDate: fiscalData.fiscalStartDate,
                    fiscalEndDate: fiscalData.fiscalEndDate,
                    PaidAmount,
                    ReceiveAmount,
                    BalanceAmount: +(ReceiveAmount - PaidAmount).toFixed(2),
                    paymentDetails: [reportTransaction(transaction)]
                });
            }
        });

        let responseData = {
            success: true,
            message: 'Semiannual Report list has been fetched Successfully.',
            data: Array.from(accountTypeMap.values()).sort((a, b) => {
                const nameA = (a.fiscalId || '').toUpperCase();
                const nameB = (b.fiscalId || '').toUpperCase();

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
            const fiscalData = getFiscalAndFrequencyYearMonth(transaction.transaction_date, fiscalStartMonth, 'annually');
            const fiscalId = fiscalData.fiscalId;
            if (accountTypeMap.has(fiscalId)) {
                const existingData = accountTypeMap.get(fiscalId);
                existingData.PaidAmount = +(existingData.PaidAmount + PaidAmount).toFixed(2);
                existingData.ReceiveAmount = +(existingData.ReceiveAmount + ReceiveAmount).toFixed(2);
                existingData.BalanceAmount = +(existingData.ReceiveAmount - existingData.PaidAmount).toFixed(2);
                existingData.paymentDetails.push(reportTransaction(transaction));
            } else {
                accountTypeMap.set(fiscalId, {
                    fiscalId,
                    fiscalName: fiscalData.fiscalName,
                    fiscalStartDate: fiscalData.fiscalStartDate,
                    fiscalEndDate: fiscalData.fiscalEndDate,
                    PaidAmount,
                    ReceiveAmount,
                    BalanceAmount: +(ReceiveAmount - PaidAmount).toFixed(2),
                    paymentDetails: [reportTransaction(transaction)]
                });
            }
        });

        let responseData = {
            success: true,
            message: 'Annually Report list has been fetched Successfully.',
            data: Array.from(accountTypeMap.values()).sort((a, b) => {
                const nameA = (a.fiscalId || '').toUpperCase();
                const nameB = (b.fiscalId || '').toUpperCase();

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