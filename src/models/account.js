const db = require('../db/dbconnection')

class Account {
    constructor(tenantId, account_name, group_name_Id, join_date, exit_date, account_type_Id, status, createdBy, updatedBy, companyId) {
        this.tenantId = tenantId;
        this.account_name = account_name;
        this.group_name_Id = group_name_Id;
        this.join_date = join_date;
        this.exit_date = exit_date;
        this.account_type_Id = account_type_Id;
        this.status = status;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
        this.companyId = companyId;
    };

    async save() {
        try {
            let sql = `
            INSERT INTO account_master(
                tenantId,
                account_name,
                group_name_Id,
                join_date,
                exit_date,
                account_type_Id,
                status,
                createdBy,
                createdOn,
                updatedBy,
                updatedOn,
                companyId
            )
            VALUES(
                '${this.tenantId}',
                '${this.account_name}',
                '${this.group_name_Id}',
                '${this.join_date}',
                '${this.exit_date}',
                '${this.account_type_Id}',
                '${this.status}',
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
    }

    static findAccountQuery(tenantId, companyId) {
        return `SELECT a.account_id,
                a.account_name,
                a.group_name_Id,
                a.join_date,
                a.exit_date,
                a.account_type_Id,
                a.status,
                a.createdBy,
                get_datetime_in_server_datetime(a.createdOn) AS createdOn,
                a.updatedBy,
                get_datetime_in_server_datetime(a.updatedOn) AS updatedOn,
                a.companyId,
                c.name AS group_name, ct.name AS account_type_name
        FROM account_master a
        LEFT JOIN common_master c ON a.tenantId = c.tenantId AND a.group_name_Id = c.common_id
        LEFT JOIN common_master ct ON a.tenantId = c.tenantId AND a.account_type_Id = ct.common_id
        WHERE a.tenantId = ${tenantId}
            AND a.companyId = ${companyId}
        `;
    }
    static findAll(tenantId, companyId) {
        let sql = this.findAccountQuery(tenantId, companyId);
        sql += " ORDER BY group_name, a.account_name";
        return db.execute(sql);
    };

    static findActiveAll(tenantId, companyId) {
        let sql = this.findAccountQuery(tenantId, companyId);
        sql += ` AND a.status = 1`;
        sql += " ORDER BY a.account_name";
        return db.execute(sql);
    };

    static findById(id, tenantId, companyId) {
        let sql = this.findAccountQuery(tenantId, companyId);
        sql += `AND a.account_id= ${id}`;
        return db.execute(sql);
    };

    static delete(accountId, tenantId) {
        let sql = `DELETE FROM account_master WHERE tenantId = ${tenantId} AND account_id = ${accountId}`;
        return db.execute(sql)
    };

    async update(id, tenantId) {
        let sql = `UPDATE account_master SET account_name='${this.account_name}',group_name_Id='${this.group_name_Id}',join_date='${this.join_date}',exit_date='${this.exit_date}',account_type_Id='${this.account_type_Id}',status='${this.status}',updatedBy='${this.updatedBy}',updatedOn=UTC_TIMESTAMP() WHERE tenantId = ${tenantId} AND account_id = ${id}`;
        return db.execute(sql)
    };
}

module.exports = Account;