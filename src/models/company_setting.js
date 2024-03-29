const db = require('../db/dbconnection')

class CompanySetting {
    constructor(tenantId, fiscal_start_month, default_date_option, companyId, createdBy, updatedBy) {
        this.tenantId = tenantId;
        this.fiscal_start_month = fiscal_start_month;
        this.default_date_option = default_date_option;
        this.companyId = companyId;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
    };

    async save() {
        try {
            let sql = `
            INSERT INTO company_setting (tenantId, companyId, default_date_option, fiscal_start_month, createdBy, createdOn, updatedBy, updatedOn)
            VALUES ('${this.tenantId}', '${this.companyId}', ${this.default_date_option}, ${this.fiscal_start_month}, '${this.createdBy}', UTC_TIMESTAMP(), '${this.updatedBy}', UTC_TIMESTAMP())`;
            return db.execute(sql);

        } catch (error) {
            throw error;
        }
    };

    static findAll(tenantId, companyId) {
        let sql = `
        SELECT *
        FROM company_setting
        WHERE tenantId = ${tenantId}
        AND companyId = ${companyId}
        `;
        return db.execute(sql);
    };

    static findById(tenantId, id) {
        let sql = `SELECT id,
        fiscal_start_month,
        default_date_option,
        createdBy,
        get_datetime_in_server_datetime(createdOn) AS createdOn,
        updatedBy,
        get_datetime_in_server_datetime(updatedOn) AS updatedOn
        FROM company_setting WHERE tenantId = ${tenantId}`;
        sql += ` AND id = ${id}`;
        return db.execute(sql)
    };

    static findBycompanyId(tenantId, companyId) {
        let sql = `SELECT id,
        fiscal_start_month,
        default_date_option,
        createdBy,
        get_datetime_in_server_datetime(createdOn) AS createdOn,
        updatedBy,
        get_datetime_in_server_datetime(updatedOn) AS updatedOn
        FROM company_setting WHERE tenantId = ${tenantId}`;
        sql += ` AND companyId = ${companyId}`;
        return db.execute(sql)
    };

    async updateByCompanyId(tenantId, companyId) {
        try {
            let sql = `UPDATE company_setting SET fiscal_start_month='${this.fiscal_start_month}', default_date_option='${this.default_date_option}', updatedBy='${this.updatedBy}', updatedOn=UTC_TIMESTAMP() WHERE tenantId = ${tenantId} AND companyId = ${companyId}`;
            return db.execute(sql);
        } catch (error) {
            throw error;
        }
    };
    async update(tenantId, id) {
        try {
            let sql = `UPDATE company_setting SET fiscal_start_month='${this.fiscal_start_month}', default_date_option='${this.default_date_option}', updatedBy='${this.updatedBy}', updatedOn=UTC_TIMESTAMP() WHERE tenantId = ${tenantId} AND id = ${id}`;
            return db.execute(sql);
        } catch (error) {
            throw error;
        }
    };

    static delete(tenantId, companyId) {
        let sql = `DELETE FROM company_setting WHERE tenantId = ${tenantId} AND companyId = ${companyId}`;
        return db.execute(sql)
    };
}

module.exports = CompanySetting;