const Dashboard = require("../models/dashboard");
const { getDecodeToken } = require('../middlewares/decoded');

const ListDashboard = async (req, res, next) => {

    try {
        const tokenInfo = getDecodeToken(req);
        const { tenantId } = tokenInfo.decodedToken;
        const companyId = tokenInfo.decodedToken.companyId;
        const { startDate, endDate } = req.body;

        const dashboardData = await Dashboard.calculateDashboardAmounts(tenantId, companyId, startDate, endDate);

        const TotalPaidAmount = +(parseFloat(dashboardData[0][0].TotalPaidAmount)).toFixed(2);
        const TotalReceiveAmount = +(parseFloat(dashboardData[0][0].TotalReceiveAmount)).toFixed(2);
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

        dashboardAccountData[0] = dashboardAccountData[0].map(data => {
            return {
                ...data,
                PaidAmount: +(parseFloat(data.PaidAmount).toFixed(2)),
                ReceiveAmount: +(parseFloat(data.ReceiveAmount).toFixed(2)),
                TotalBalance: +(parseFloat(data.TotalBalance).toFixed(2))
            }
        })

        const DashboardData = dashboardGroupData[0].map(group => {

            const accounts = dashboardAccountData[0].filter(account => account.account_group_name_id === group.account_group_name_id);

            return {
                account_group_name_id: group.account_group_name_id,
                account_group_name: group.account_group_name,
                TotalPaidAmount: +(parseFloat(group.TotalPaidAmount)).toFixed(2),
                TotalReceiveAmount: +(parseFloat(group.TotalReceiveAmount)).toFixed(2),
                TotalBalance: +(parseFloat(group.TotalBalance)).toFixed(2),
                accounts: accounts
            };
        });

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
