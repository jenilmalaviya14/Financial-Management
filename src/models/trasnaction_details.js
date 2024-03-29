const db = require('../db/dbconnection')

class TransactionDetails {
    constructor(tenantId, transactionId, transactionType, subCategoryId, amount, description, companyId, createdBy, updatedBy) {
        this.tenantId = tenantId;
        this.transactionId = transactionId;
        this.transactionType = transactionType;
        this.subCategoryId = subCategoryId;
        this.amount = amount;
        this.description = description;
        this.companyId = companyId;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
    };

    static async save(details) {
        try {
            let values = details.map(detail => `(
                '${detail.tenantId}',
                '${detail.transactionId}',
                '${detail.transactionType}',
                '${detail.subCategoryId}',
                '${detail.amount}',
                '${detail.description}',
                '${detail.companyId}',
                '${detail.createdBy}',
                UTC_TIMESTAMP(),
                '${detail.updatedBy}',
                UTC_TIMESTAMP()
            )`).join(',');

            let sql = `
            INSERT INTO transaction_details(
                tenantId,
                transactionId,
                transaction_type,
                subCategoryId,
                amount,
                description,
                companyId,
                createdBy,
                createdOn,
                updatedBy,
                updatedOn
            )
            VALUES ${values}`;

            return db.execute(sql);
        } catch (error) {
            throw error;
        }
    }

    static async findAllTransactionDetails(tenantId, companyId, startDate = null, endDate = null, paymentTypeIds = null, clientTypeIds = null, categoryTypeIds = null, accountIds = null, groupTypeIds = null, accountTypeIds = null, subcategoryTypeIds = null, fromAmount = null, toAmount = null, reportTypes = null) {
        try {

            let sql;
            let params;

            const paymentTypeIdsString = Array.isArray(paymentTypeIds) && paymentTypeIds.length > 0 ? paymentTypeIds.join(',') : null;
            const clientTypeIdsString = Array.isArray(clientTypeIds) && clientTypeIds.length > 0 ? clientTypeIds.join(',') : null;
            const categoryTypeIdsString = Array.isArray(categoryTypeIds) && categoryTypeIds.length > 0 ? categoryTypeIds.join(',') : null;
            const accountIdsString = Array.isArray(accountIds) && accountIds.length > 0 ? accountIds.join(',') : null;
            const groupTypeIdsString = Array.isArray(groupTypeIds) && groupTypeIds.length > 0 ? groupTypeIds.join(',') : null;
            const accountTypeIdsString = Array.isArray(accountTypeIds) && accountTypeIds.length > 0 ? accountTypeIds.join(',') : null;
            const subcategoryTypeIdsString = Array.isArray(subcategoryTypeIds) && subcategoryTypeIds.length > 0 ? subcategoryTypeIds.join(',') : null;
            sql = `CALL transaction_report_statement(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            params = [tenantId, companyId, startDate, endDate, paymentTypeIdsString, clientTypeIdsString, categoryTypeIdsString, accountIdsString, groupTypeIdsString, accountTypeIdsString, subcategoryTypeIdsString, fromAmount, toAmount, reportTypes];

            const [result, _] = await db.execute(sql, params, { nullUndefined: true });
            return result;
        } catch (error) {
            console.error('Error in TransactionDetails:', error);
            throw error;
        };
    }

    static async findById(tenantId, companyId, id) {
        let sql = `SELECT * FROM transaction_details WHERE tenantId = ${tenantId} AND companyId = ${companyId} AND id = ${id}`;
        return db.execute(sql);
    }

    static async findAllByTransactionId(tenantId, companyId, transactionId) {
        let sql = `
            SELECT td.id,
            td.transactionId,
            td.subCategoryId,
            td.amount,
            td.description,
            cm.name AS subCategoryName
            FROM transaction_details AS td
            LEFT JOIN common_master AS cm ON td.subCategoryId = cm.common_id
            WHERE td.tenantId = ${tenantId} AND td.companyId = ${companyId} AND td.transactionId = ${transactionId}`;
        return db.execute(sql);
    }

    static delete(tenantId, companyId, ids) {
        if (!Array.isArray(ids)) {
            ids = [ids];
        }
        let sql = `DELETE FROM transaction_details WHERE tenantId = ${tenantId} AND companyId = ${companyId} AND id IN (${ids.join(',')})`;
        return db.execute(sql);
    }

    async update(tenantId, companyId, id) {
        let sql = `UPDATE transaction_details SET subCategoryId='${this.subCategoryId}', amount='${this.amount}', description='${this.description}' WHERE tenantId= ${tenantId} AND companyId = ${companyId} AND id = ${id}`;
        return db.execute(sql);
    }
}

module.exports = TransactionDetails;