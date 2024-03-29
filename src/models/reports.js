const db = require('../db/dbconnection');

class reports {

    static async findAllReports(tenantId, companyId, startDate = null, endDate = null, paymentTypeIds = null, clientTypeIds = null, categoryTypeIds = null, accountIds = null, groupTypeIds = null, accountTypeIds = null, fromAmount = null, toAmount = null, reportTypes = null) {
        try {

            let sql;
            let params;

            const paymentTypeIdsString = Array.isArray(paymentTypeIds) && paymentTypeIds.length > 0 ? paymentTypeIds.join(',') : null;
            const clientTypeIdsString = Array.isArray(clientTypeIds) && clientTypeIds.length > 0 ? clientTypeIds.join(',') : null;
            const categoryTypeIdsString = Array.isArray(categoryTypeIds) && categoryTypeIds.length > 0 ? categoryTypeIds.join(',') : null;
            const accountIdsString = Array.isArray(accountIds) && accountIds.length > 0 ? accountIds.join(',') : null;
            const groupTypeIdsString = Array.isArray(groupTypeIds) && groupTypeIds.length > 0 ? groupTypeIds.join(',') : null;
            const accountTypeIdsString = Array.isArray(accountTypeIds) && accountTypeIds.length > 0 ? accountTypeIds.join(',') : null;
            sql = `CALL report_statement(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            params = [tenantId, companyId, startDate, endDate, paymentTypeIdsString, clientTypeIdsString, categoryTypeIdsString, accountIdsString, groupTypeIdsString, accountTypeIdsString, fromAmount, toAmount, reportTypes];

            const [result, _] = await db.execute(sql, params, { nullUndefined: true });
            return result;
        } catch (error) {
            console.error('Error in findAll Reports:', error);
            throw error;
        };
    }

    static async findAllPayment(tenantId, companyId, startDate = null, endDate = null, paymentTypeIds = null, clientTypeIds = null, categoryTypeIds = null, accountIds = null, groupTypeIds = null, accountTypeIds = null, fromAmount = null, toAmount = null) {

        const reportsData = await this.findAllReports(tenantId, companyId, startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount, null);

        return reportsData;
    } catch(error) {
        console.error('Error in findAllPayment:', error);
        throw error;
    };

    static async findAllClient(tenantId, companyId, startDate = null, endDate = null, paymentTypeIds = null, clientTypeIds = null, categoryTypeIds = null, accountIds = null, groupTypeIds = null, accountTypeIds = null, fromAmount = null, toAmount = null) {

        const reportsData = await this.findAllReports(tenantId, companyId, startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount, 'Client');
        return reportsData;
    } catch(error) {
        console.error('Error in findAllClient', error);
        throw error;
    };

    static async findAllCategory(tenantId, companyId, startDate = null, endDate = null, paymentTypeIds = null, clientTypeIds = null, categoryTypeIds = null, accountIds = null, groupTypeIds = null, accountTypeIds = null, fromAmount = null, toAmount = null) {

        const reportsData = await this.findAllReports(tenantId, companyId, startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount, 'Category');

        return reportsData;
    } catch(error) {
        console.error('Error in findAllCategory', error);
        throw error;
    };

    static async findAllAccount(tenantId, companyId, startDate = null, endDate = null, paymentTypeIds = null, clientTypeIds = null, categoryTypeIds = null, accountIds = null, groupTypeIds = null, accountTypeIds = null, fromAmount = null, toAmount = null) {

        const reportsData = await this.findAllReports(tenantId, companyId, startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount, null);

        return reportsData;
    } catch(error) {
        console.error('Error in findAllPayment:', error);
        throw error;
    };

    static async findAllGroup(tenantId, companyId, startDate = null, endDate = null, paymentTypeIds = null, clientTypeIds = null, categoryTypeIds = null, accountIds = null, groupTypeIds = null, accountTypeIds = null, fromAmount = null, toAmount = null) {

        const reportsData = await this.findAllReports(tenantId, companyId, startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount, null);

        return reportsData;
    } catch(error) {
        console.error('Error in findAllGroup:', error);
        throw error;
    };

    static async findAllCompany(tenantId, companyId, startDate = null, endDate = null, paymentTypeIds = null, clientTypeIds = null, categoryTypeIds = null, accountIds = null, groupTypeIds = null, accountTypeIds = null, fromAmount = null, toAmount = null) {

        const reportsData = await this.findAllReports(tenantId, companyId, startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount, null);

        return reportsData;
    } catch(error) {
        console.error('Error in findAllCompany:', error);
        throw error;
    };

    static async findAllAccountType(tenantId, companyId, startDate = null, endDate = null, paymentTypeIds = null, clientTypeIds = null, categoryTypeIds = null, accountIds = null, groupTypeIds = null, accountTypeIds = null, fromAmount = null, toAmount = null) {

        const reportsData = await this.findAllReports(tenantId, companyId, startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount, null);

        return reportsData;
    } catch(error) {
        console.error('Error in findAllAccountType:', error);
        throw error;
    };

    static async findAllAnnually(tenantId, companyId, startDate = null, endDate = null, paymentTypeIds = null, clientTypeIds = null, categoryTypeIds = null, accountIds = null, groupTypeIds = null, accountTypeIds = null, fromAmount = null, toAmount = null) {

        const reportsData = await this.findAllReports(tenantId, companyId, startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount, null);

        return reportsData;
    } catch(error) {
        console.error('Error in findAllAnnually:', error);
        throw error;
    };

    static async findAllQuarterly(tenantId, companyId, startDate = null, endDate = null, paymentTypeIds = null, clientTypeIds = null, categoryTypeIds = null, accountIds = null, groupTypeIds = null, accountTypeIds = null, fromAmount = null, toAmount = null) {

        const reportsData = await this.findAllReports(tenantId, companyId, startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount, null);

        return reportsData;
    } catch(error) {
        console.error('Error in findAllQuarterly:', error);
        throw error;
    };

    static async findAllSemiannual(tenantId, companyId, startDate = null, endDate = null, paymentTypeIds = null, clientTypeIds = null, categoryTypeIds = null, accountIds = null, groupTypeIds = null, accountTypeIds = null, fromAmount = null, toAmount = null) {

        const reportsData = await this.findAllReports(tenantId, companyId, startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount, null);

        return reportsData;
    } catch(error) {
        console.error('Error in findAllSemiannual:', error);
        throw error;
    };

    static async findAllMonthly(tenantId, companyId, startDate = null, endDate = null, paymentTypeIds = null, clientTypeIds = null, categoryTypeIds = null, accountIds = null, groupTypeIds = null, accountTypeIds = null, fromAmount = null, toAmount = null) {

        const reportsData = await this.findAllReports(tenantId, companyId, startDate, endDate, paymentTypeIds, clientTypeIds, categoryTypeIds, accountIds, groupTypeIds, accountTypeIds, fromAmount, toAmount, null);

        return reportsData;
    } catch(error) {
        console.error('Error in findAllMonthly:', error);
        throw error;
    };
};

module.exports = reports;