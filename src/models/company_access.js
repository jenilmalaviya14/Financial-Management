const db = require('../db/dbconnection');

class CompanyAccess {
    constructor(tenantId, user_id, companyId) {
        this.tenantId = tenantId;
        this.user_id = user_id;
        this.company_id = companyId;
    };

    async save() {
        try {
            let insertionResults = [];

            for (const companyId of this.company_id) {
                const userExistsSql = `SELECT * FROM company_access WHERE user_id = '${this.user_id}' AND company_id = '${companyId}'`;
                const [userExistsResult] = await db.execute(userExistsSql);

                if (userExistsResult.length > 0) {
                    insertionResults.push({ message: `User with ID '${this.user_id}' and company ID '${companyId}' already exists.` });
                    continue;
                }

                const dataExistsSql = `SELECT * FROM company_master WHERE id = '${companyId}'`;
                const [dataExistsResult] = await db.execute(dataExistsSql);

                if (dataExistsResult.length === 0) {
                    insertionResults.push({ message: `No existing data for company ID '${companyId}' in company_master.` });
                    continue;
                }

                const chosenCompanyId = dataExistsResult[0].id;

                const chosenCompanyExistsSql = `SELECT * FROM company_access WHERE user_id = '${this.user_id}' AND company_id = '${chosenCompanyId}'`;
                const [chosenCompanyExistsResult] = await db.execute(chosenCompanyExistsSql);

                if (chosenCompanyExistsResult.length > 0) {
                    insertionResults.push({ message: `User with ID '${this.user_id}' already exists for chosen company ID '${chosenCompanyId}'.` });
                    continue;
                }

                let sql = `
                    INSERT INTO company_access(
                        tenantId,
                        user_id,
                        company_id,
                        createdOn,
                        updatedOn
                    )
                    VALUES(
                        '${this.tenantId}',
                        '${this.user_id}',
                        '${chosenCompanyId}',
                        UTC_TIMESTAMP(),
                        UTC_TIMESTAMP()
                    )`;

                const result = await db.execute(sql);
                insertionResults.push(result);
            }

            return insertionResults;
        } catch (error) {
            throw error;
        }
    };

    static findAll(tenantId) {
        let sql = "SELECT *, DATE_SUB(createdOn, INTERVAL 5 HOUR) AS adjusted_createdOn, DATE_SUB(updatedOn, INTERVAL 5 HOUR) AS adjusted_updatedOn FROM company_access";
        if (tenantId) {
            sql += ` WHERE tenantId = '${tenantId}'`;
        }
        return db.execute(sql)
    }

    static findAllByCompanyAccess(tenantId, userId) {
        let sql = "SELECT ca.*, cm.company_name, cs.default_date_option, cs.fiscal_start_month FROM company_access ca "
        sql += " LEFT JOIN company_master cm ON ca.tenantId = cm.tenantId AND ca.company_id = cm.id"
        sql += " LEFT JOIN company_setting cs ON ca.tenantId = cs.tenantId AND ca.company_id = cs.companyId"
        sql += " WHERE 1 = 1";
        if (tenantId) {
            sql += ` AND ca.tenantId = '${tenantId}'`;
        }
        if (userId) {
            sql += ` AND ca.user_id = '${userId}'`;
        }
        sql += ` ORDER BY cm.company_name`
        return db.execute(sql)
    }

    static findById(id) {
        let sql = `SELECT * FROM company_access WHERE id = ${id}`;
        return db.execute(sql)
    }

    static delete(id) {
        let sql = `DELETE FROM company_access WHERE id = ${id}`;
        return db.execute(sql)
    }

    async update(id) {
        try {
            const userExistsSql = `SELECT * FROM user_master WHERE id = '${this.user_id}'`;
            const [userExistsResult] = await db.execute(userExistsSql);

            if (userExistsResult.length === 0) {
                throw new Error(`User with ID '${this.user_id}' not found.`);
            };

            for (const companyId of this.company_id) {
                const companyExistsSql = `SELECT * FROM company_master WHERE id = '${companyId}'`;
                const [companyExistsResult] = await db.execute(companyExistsSql);

                if (companyExistsResult.length === 0) {
                    throw new Error(`Company with ID '${companyId}' not found.`);
                }
            };

            const updateCompanySql = `
                UPDATE company_access
                SET tenantId='${this.tenantId}',
                    user_id='${this.user_id}',
                    updatedOn=UTC_TIMESTAMP()
                WHERE user_id = '${id}'`;

            await db.execute(updateCompanySql);

            return { message: 'CompanyAccess Successfully updated.' };
        } catch (error) {
            throw error;
        }
    }

}

module.exports = CompanyAccess;