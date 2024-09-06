const Dashboard = require("../models/dashboard");
const { getDecodeToken } = require('../middlewares/decoded');

const calculateTotalsAndPercentages = (dataMap) => {
    const totals = {
        totalReceive: 0,
        totalPayment: 0,
        balance: 0
    };
    Array.from(dataMap.values()).forEach(item => {
        totals.totalReceive += item.TotalReceiveAmount || 0;
        totals.totalPayment += item.TotalPaidAmount || 0;
        totals.balance += item.TotalBalance || 0;
    });

    Array.from(dataMap.values()).forEach(item => {
        item.totalReceivePercentage = totals.totalReceive === 0 ? 0 : ((item.TotalReceiveAmount || 0) / totals.totalReceive) * 100;
        item.totalPaymentPercentage = totals.totalPayment === 0 ? 0 : ((item.TotalPaidAmount || 0) / totals.totalPayment) * 100;
        item.balancePercentage = totals.balance === 0 ? 0 : ((item.TotalBalance || 0) / totals.balance) * 100;
    });
};

const ListDashboard = async (req, res, next) => {

    try {
        const tokenInfo = getDecodeToken(req);
        const { tenantId } = tokenInfo.decodedToken;
        const companyId = tokenInfo.decodedToken.companyId;
        const { startDate, endDate } = req.body;

        const dashboardData = await Dashboard.calculateDashboardAmounts(tenantId, companyId, startDate, endDate);

        const TotalPaidAmount = +(parseFloat(dashboardData.TotalPaidAmount)).toFixed(2);
        const TotalReceiveAmount = +(parseFloat(dashboardData.TotalReceiveAmount)).toFixed(2);
        let data = {
            TotalPaidAmount,
            TotalReceiveAmount,
            TotalBalance: +(TotalReceiveAmount - TotalPaidAmount).toFixed(2)
        }

        let responseData = {
            success: true,
            message: 'Dashboard Data Successfully',
            data: data,
        };

        res.status(200).json(responseData);
    } catch (error) {
        console.error('Error in ListDashboard:', error);
        next(error);
    }
};

const ListDashboardGroupData = async (req, res, next) => {
    try {
        const tokenInfo = getDecodeToken(req);
        const { tenantId } = tokenInfo.decodedToken;
        const companyId = tokenInfo.decodedToken.companyId;
        const { startDate, endDate } = req.body;

        let dashboardAccountData;
        let dashboardGroupData;

        if (companyId) {
            dashboardAccountData = await Dashboard.getDashboardAccountData(tenantId, companyId, startDate, endDate);
            dashboardGroupData = await Dashboard.getDashboardGroupData(tenantId, companyId, startDate, endDate);
        };

        dashboardAccountData = dashboardAccountData.map(data => {
            return {
                ...data,
                PaidAmount: +(parseFloat(data.PaidAmount).toFixed(2)),
                ReceiveAmount: +(parseFloat(data.ReceiveAmount).toFixed(2)),
                TotalBalance: +(parseFloat(data.TotalBalance).toFixed(2))
            }
        })

        const DashboardData = dashboardGroupData.map(group => {
            const accounts = dashboardAccountData.filter(account => account.account_group_name_id === group.account_group_name_id);

            return {
                account_group_name_id: group.account_group_name_id,
                account_group_name: group.account_group_name,
                TotalPaidAmount: +(parseFloat(group.TotalPaidAmount)).toFixed(2),
                TotalReceiveAmount: +(parseFloat(group.TotalReceiveAmount)).toFixed(2),
                TotalBalance: +(parseFloat(group.TotalBalance)).toFixed(2),
                totalReceivePercentage: 0,
                totalPaymentPercentage: 0,
                balancePercentage: 0,
                accounts: accounts
            };
        });

        calculateTotalsAndPercentages(DashboardData);

        let responseData = {
            success: true,
            message: 'Dashboard Data Successfully Retrieved!',
            data: DashboardData,
        };
        res.status(200).json(responseData);
    } catch (error) {
        console.error('Error in ListDashboardData:', error);
        next(error);
    }
};


module.exports = {
    ListDashboard,
    ListDashboardGroupData
};
