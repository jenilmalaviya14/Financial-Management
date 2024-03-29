const db = require('../db/dbconnection');
const bcrypt = require('bcrypt');

class Tenant {
    constructor(tenantname, personname, address, contact, email, startdate, enddate, status, createdBy, updatedBy) {
        this.tenantname = tenantname;
        this.personname = personname;
        this.address = address;
        this.contact = contact;
        this.email = email;
        this.startdate = startdate;
        this.enddate = enddate;
        this.status = status;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
    };
    async save() {
        try {

            const hashedPassword = await bcrypt.hash('Test@123', 8);

            const sql = 'CALL create_new_tenant(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const values = [
                this.tenantname, this.personname, this.address, this.contact,
                this.email, this.startdate, this.enddate, this.status, this.createdBy, this.updatedBy, hashedPassword
            ];
            return db.execute(sql, values)

        } catch (error) {
            throw error;
        }
    }

    static getTenants() {
        return `SELECT tenantId,
        tenantname,
        personname,
        address,
        contact,
        email,
        startdate,
        enddate,
        status,
        createdBy,
        get_datetime_in_server_datetime(createdOn) AS createdOn,
        get_datetime_in_server_datetime( updatedOn) AS updatedOn,
        updatedBy
        FROM tenant_master`
    }

    static findByEmail(email) {
        let sql = `SELECT * FROM tenant_master WHERE email = '${email}'`;
        return db.execute(sql);
    }


    static findAll() {
        let sql = this.getTenants()
        return db.execute(sql)
    }

    static findActiveAll() {
        let sql = this.getTenants()
        sql += ` WHERE status = 1`
        return db.execute(sql)
    }

    static findById(id) {
        let sql = this.getTenants()
        sql += ` WHERE tenantId= ${id}`
        return db.execute(sql)
    }

    static async deleteValidation(tenantId) {
        const [accountResults] = await db.execute(`SELECT COUNT(*) AS count FROM account_master WHERE tenantId = ${tenantId}`);

        if (accountResults[0].count > 0) {
            return false
        }

        const [clientResults] = await db.execute(`SELECT COUNT(*) AS count FROM client_master WHERE tenantId = ${tenantId}`);

        if (clientResults[0].count > 0) {
            return false
        }

        const [commonResult] = await db.execute(`SELECT COUNT(*) AS count FROM common_master WHERE tenantId = ${tenantId}`);

        if (commonResult[0].count > 0) {
            return false
        }

        const [transactionResult] = await db.execute(`SELECT COUNT(*) AS count FROM transaction WHERE tenantId = ${tenantId}`);

        if (transactionResult[0].count > 0) {
            return false
        }

        const [transferResult] = await db.execute(`SELECT COUNT(*) AS count FROM transfer WHERE tenantId = ${tenantId}`);

        if (transferResult[0].count > 0) {
            return false
        };

        const [menuResult] = await db.execute(`SELECT COUNT(*) AS count FROM menu_master WHERE tenantId = ${tenantId}`);

        if (menuResult[0].count > 0) {
            return false
        };

        const [transactionDetailsResult] = await db.execute(`SELECT COUNT(*) AS count FROM transaction_details WHERE tenantId = ${tenantId}`);

        if (transactionDetailsResult[0].count > 0) {
            return false
        };

        const [companyResult] = await db.execute(`SELECT CASE WHEN totalcount = 1 AND totalcount = unchangecount THEN 0 ELSE totalcount END AS count FROM (SELECT COUNT(*) AS totalcount, SUM(CASE WHEN createdOn = updatedOn THEN 1 ELSE 0 END ) AS unchangecount FROM company_master WHERE tenantId = ${tenantId} ) AS a`);

        if (companyResult[0].count > 0) {
            return false
        };

        const [companySettingResult] = await db.execute(`SELECT CASE WHEN totalcount = 1 AND totalcount = unchangecount THEN 0 ELSE totalcount END AS count FROM (SELECT COUNT(*) AS totalcount, SUM(CASE WHEN createdOn = updatedOn THEN 1 ELSE 0 END ) AS unchangecount FROM company_setting WHERE tenantId = ${tenantId} ) AS a`);

        if (companySettingResult[0].count > 0) {
            return false
        };

        const [userResult] = await db.execute(`SELECT CASE WHEN totalcount = 1 AND totalcount = unchangecount THEN 0 ELSE totalcount END AS count FROM (SELECT COUNT(*) AS totalcount, SUM(CASE WHEN createdOn = updatedOn THEN 1 ELSE 0 END ) AS unchangecount FROM user_master WHERE tenantId = ${tenantId} ) AS a`);

        if (userResult[0].count > 0) {
            return false
        };

        const [companyAccessResult] = await db.execute(`SELECT CASE WHEN totalcount = 1 AND totalcount = unchangecount THEN 0 ELSE totalcount END AS count FROM (SELECT COUNT(*) AS totalcount, SUM(CASE WHEN createdOn = updatedOn THEN 1 ELSE 0 END ) AS unchangecount FROM company_access WHERE tenantId = ${tenantId} ) AS a`);

        if (companyAccessResult[0].count > 0) {
            return false
        };

        return true
    }

    static async delete(tenantId) {
        await db.execute('CALL delete_tenant(?)', [tenantId]);
        return { success: true };
    }

    async update(id) {
        let sql = `UPDATE tenant_master SET tenantname='${this.tenantname}',personname='${this.personname}',address='${this.address}',contact='${this.contact}',email='${this.email}',startdate='${this.startdate}',enddate='${this.enddate}',status='${this.status}',updatedBy='${this.updatedBy}',updatedOn=UTC_TIMESTAMP() WHERE tenantId = ${id}`;
        return db.execute(sql)

    };
}

module.exports = Tenant;