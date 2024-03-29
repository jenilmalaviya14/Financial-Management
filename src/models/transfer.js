const db = require('../db/dbconnection')
const TransactionDetails = require('./trasnaction_details')

class Transfer {
    constructor(tenantId, transactionDate, paymentType_Id, fromAccount, toAccount, amount, description, createdBy, updatedBy, companyId) {
        this.tenantId = tenantId;
        this.transactionDate = transactionDate;
        this.paymentType_Id = paymentType_Id;
        this.fromAccount = fromAccount;
        this.toAccount = toAccount;
        this.amount = amount;
        this.description = description;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
        this.companyId = companyId;
    };


    async save() {

        try {
            let sql = `
            INSERT INTO transfer(
                tenantId,
                transactionDate,
                paymentType_Id,
                fromAccount,
                toAccount,
                amount,
                description,
                createdBy,
                createdOn,
                updatedBy,
                updatedOn,
                companyId
            )
            VALUES(
                '${this.tenantId}',
                '${this.transactionDate}',
                '${this.paymentType_Id}',
                '${this.fromAccount}',
                '${this.toAccount}',
                '${this.amount}',
                '${this.description}',
                '${this.createdBy}',
                UTC_TIMESTAMP(),
                '${this.updatedBy}',
                UTC_TIMESTAMP(),
                '${this.companyId}'
            )`;
            return db.execute(sql)

        } catch (error) {
            throw error;
        }
    };

    static async findAll(tenantId, companyId, startDate = null, endDate = null, paymentTypeIds = null, accountTypeIds = null, limit = null, fromAmount = null, toAmount = null) {
        try {
            let sql;
            let params;

            const paymentTypeIdsString = Array.isArray(paymentTypeIds) && paymentTypeIds.length > 0 ? paymentTypeIds.join(',') : null;
            const accountTypeIdsString = Array.isArray(accountTypeIds) && accountTypeIds.length > 0 ? accountTypeIds.join(',') : null;
            sql = `CALL transfer(?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            params = [tenantId, companyId, startDate, endDate, paymentTypeIdsString, accountTypeIdsString, limit || 95, fromAmount, toAmount];

            const [result, _] = await db.execute(sql, params, { nullUndefined: true });

            for (let i = 0; i < result[0].length; i++) {
                const transactionId = result[0][i].transfer_id;
                const details = await TransactionDetails.findAllByTransactionId(tenantId, companyId, transactionId);
                result[0][i].details = details[0];
            }

            return result;
        } catch (error) {
            console.error('Error in findAll:', error);
            throw error;
        }

    };

    static findById(tenantId, id) {
        let sql = `SELECT * FROM transfer WHERE tenantId = ${tenantId} AND transfer_id = ${id}`;
        return db.execute(sql)
    }
    static delete(tenantId, id) {
        let sql = `DELETE FROM transfer WHERE tenantId = ${tenantId} AND transfer_id = ${id}`;
        return db.execute(sql)
    }

    async update(tenantId, id) {
        let sql = `UPDATE transfer SET transactionDate='${this.transactionDate}',paymentType_Id='${this.paymentType_Id}',fromAccount='${this.fromAccount}',toAccount='${this.toAccount}',amount='${this.amount}',description='${this.description}',updatedBy='${this.updatedBy}',updatedOn=UTC_TIMESTAMP() WHERE tenantId = ${tenantId} AND transfer_id = ${id}`;
        return db.execute(sql)
    };
}

module.exports = Transfer;