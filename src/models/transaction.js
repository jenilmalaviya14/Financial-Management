const db = require('../db/dbconnection')

class Transaction {
    constructor(tenantId, transaction_date, transaction_type, payment_type_Id, accountId, amount, description, createdBy, updatedBy, companyId, clientId) {
        this.tenantId = tenantId;
        this.transaction_date = transaction_date;
        this.transaction_type = transaction_type;
        this.payment_type_Id = payment_type_Id;
        this.accountId = accountId;
        this.amount = amount;
        this.description = description;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
        this.companyId = companyId;
        this.clientId = clientId;
    };

    async save() {
        try {
            let sql = `
            INSERT INTO transaction(
                tenantId,
                transaction_date,
                transaction_type,
                payment_type_Id,
                accountId,
                amount,
                description,
                createdBy,
                createdOn,
                updatedBy,
                updatedOn,
                companyId,
                clientId
            )
            VALUES(
                '${this.tenantId}',
                '${this.transaction_date}',
                '${this.transaction_type}',
                '${this.payment_type_Id}',
                '${this.accountId}',
                '${this.amount}',
                '${this.description}',
                '${this.createdBy}',
                UTC_TIMESTAMP(),
                '${this.updatedBy}',
                UTC_TIMESTAMP(),
                '${this.companyId}',
                '${this.clientId}'
            )`;
            return db.execute(sql);
        } catch (error) {
            throw error;
        }
    }

    static async findAll(tenantId, companyId, startDate = null, endDate = null, type = null, paymentTypeIds = null, clientTypeIds = null, categoryTypeIds = null, accountIds = null, groupTypeIds = null, accountTypeIds = null, limit = null) {
        try {
            let sql;
            let params;

            const paymentTypeIdsString = Array.isArray(paymentTypeIds) && paymentTypeIds.length > 0 ? paymentTypeIds.join(',') : null;
            const clientTypeIdsString = Array.isArray(clientTypeIds) && clientTypeIds.length > 0 ? clientTypeIds.join(',') : null;
            const categoryTypeIdsString = Array.isArray(categoryTypeIds) && categoryTypeIds.length > 0 ? categoryTypeIds.join(',') : null;
            const accountIdsString = Array.isArray(accountIds) && accountIds.length > 0 ? accountIds.join(',') : null;
            const groupTypeIdsString = Array.isArray(groupTypeIds) && groupTypeIds.length > 0 ? groupTypeIds.join(',') : null;
            const accountTypeIdsString = Array.isArray(accountTypeIds) && accountTypeIds.length > 0 ? accountTypeIds.join(',') : null;
            sql = `CALL transaction(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            params = [tenantId, companyId, startDate, endDate, type, paymentTypeIdsString, clientTypeIdsString, categoryTypeIdsString, accountIdsString, groupTypeIdsString, accountTypeIdsString, limit || 95];

            const [result, _] = await db.execute(sql, params, { nullUndefined: true });
            return result;
        } catch (error) {
            console.error('Error in findAll:', error);
            throw error;
        }
    };

    static findById(tenantId, id) {
        let sql = `SELECT t.transactionId,
        t.transaction_date,
        t.transaction_type,
        t.payment_type_Id,
        t.accountId,
        t.amount,
        t.description,
        t.createdBy,
        get_datetime_in_server_datetime(t.createdOn) AS createdOn,
        t.updatedBy,
        get_datetime_in_server_datetime(t.updatedOn) AS updatedOn,
        t.companyId,
        t.clientId,
        a.account_type_Id,
        a.group_name_Id,
        cp.name AS payment_type_name,
        a.account_name AS account_name,
        cn.clientName AS client_name,
        atn.name AS account_type_name,
        ag.name AS account_group_name
        FROM transaction t
        LEFT JOIN
        common_master cp ON t.tenantId = cp.tenantId AND t.payment_type_Id = cp.common_id
        LEFT JOIN
            account_master a ON t.tenantId = a.tenantId AND t.accountId = a.account_id
        LEFT JOIN
            client_master cn ON t.tenantId = cn.tenantId AND t.clientId = cn.clientId
        LEFT JOIN
            common_master atn ON t.tenantId = atn.tenantId AND a.account_type_Id = atn.common_id
        LEFT JOIN
            common_master ag ON t.tenantId = ag.tenantId AND a.group_name_Id = ag.common_id
        WHERE t.tenantId = ${tenantId} AND t.transactionId = ${id}`;
        return db.execute(sql)
    };

    static delete(tenantId, id) {
        let sql = `DELETE FROM transaction WHERE tenantId = ${tenantId} AND transactionId = ${id}`;
        return db.execute(sql)
    }

    async update(tenantId, id) {
        let sql = `UPDATE transaction SET transaction_date='${this.transaction_date}', transaction_type='${this.transaction_type}', payment_type_Id='${this.payment_type_Id}',accountId='${this.accountId}', amount='${this.amount}', description='${this.description}',updatedBy='${this.updatedBy}', updatedOn=UTC_TIMESTAMP(), clientId='${this.clientId}' WHERE tenantId= ${tenantId} AND transactionId = ${id}`;
        return db.execute(sql);
    }
}

module.exports = Transaction;