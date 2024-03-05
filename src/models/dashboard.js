const db = require('../db/dbconnection');

class Dashboard {
    static async calculateDashboardAmounts(tenantId, companyId, startDate = null, endDate = null) {
        try {
            let sql = "CALL dashboard_amounts(?, ?, ?, ?)";
            let params = [tenantId, companyId, startDate, endDate];

            const [result, _] = await db.execute(sql, params);
            return result;
        } catch (error) {
            console.error('Error in calculateDashboardAmounts:', error);
            throw error;
        };
    };

    static async getDashboardAccountData(tenantId, companyId, startDate = null, endDate = null) {
        try {
            let sql = "CALL dashboard_account(?, ?, ?, ?)";
            let params = [tenantId, companyId, startDate, endDate];
            const [result, _] = await db.execute(sql, params);
            return result;
        } catch (error) {
            console.error('Error in getDashboardAccountData:', error);
            throw error;
        };
    };

    static async getDashboardGroupData(tenantId, companyId, startDate = null, endDate = null) {
        try {
            let sql = "CALL dashboard_group(?, ?, ?, ?)";
            let params = [tenantId, companyId, startDate, endDate];
            const [result, _] = await db.execute(sql, params);
            return result;
        } catch (error) {
            console.error('Error in getDashboardGroupData:', error);
            throw error;
        };
    };
};

module.exports = Dashboard;
