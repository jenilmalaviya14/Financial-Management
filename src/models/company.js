const db = require('../db/dbconnection')

class Company {
    constructor(tenantId, company_name, legal_name, authorize_person_name, address, contact_no, email, website, pan, gstin, status, createdBy, updatedBy) {
        this.tenantId = tenantId;
        this.company_name = company_name;
        this.legal_name = legal_name;
        this.authorize_person_name = authorize_person_name;
        this.address = address;
        this.contact_no = contact_no;
        this.email = email;
        this.website = website;
        this.pan = pan;
        this.gstin = gstin;
        this.status = status;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
    };

    async save() {
        try {
            const checkEmailQuery = `
            SELECT COUNT(*) AS count
            FROM company_master
            WHERE tenantId = '${this.tenantId}' AND email = '${this.email}'
        `;
            const [emailCountResult] = await db.execute(checkEmailQuery);
            const emailCount = emailCountResult[0].count;

            if (emailCount > 0) {
                throw new Error("Email already exists for this tenant");
            }
            let sql = `
            INSERT INTO company_master(
                tenantId,
                company_name,
                legal_name,
                authorize_person_name,
                address,
                contact_no,
                email,
                website,
                pan,
                gstin,
                status,
                createdBy,
                createdOn,
                updatedBy,
                updatedOn
            )
            VALUES(
                '${this.tenantId}',
                '${this.company_name}',
                '${this.legal_name}',
                '${this.authorize_person_name}',
                '${this.address}',
                '${this.contact_no}',
                '${this.email}',
                '${this.website}',
                '${this.pan}',
                '${this.gstin} ',
                '${this.status}',
                '${this.createdBy}',
                UTC_TIMESTAMP(),
                '${this.updatedBy}',
                UTC_TIMESTAMP()
            )`;
            const result = await db.execute(sql);

            const InsertId = `SELECT LAST_INSERT_ID() as companyId`;
            const [rows] = await db.execute(InsertId);
            const companyId = rows[0].companyId;

            const insertCompanySetting = `
            INSERT INTO company_setting (tenantId, companyId, default_date_option,fiscal_start_month, createdBy,createdOn, updatedBy, updatedOn)
            VALUES ('${this.tenantId}', '${companyId}', 10, 4, '${this.createdBy}', UTC_TIMESTAMP(), '${this.updatedBy}', UTC_TIMESTAMP())`;
            await db.execute(insertCompanySetting);

            return result;

        } catch (error) {
            throw error;
        }
    };

    static AllCompany(tenantId) {
        return `  SELECT
        c.id,
        c.company_name,
        c.legal_name,
        c.authorize_person_name,
        c.address,
        c.contact_no,
        c.email,
        c.website,
        c.pan,
        c.gstin,
        c.status,
        c.createdBy,
        get_datetime_in_server_datetime(c.createdOn) AS createdOn,
        c.updatedBy,
        get_datetime_in_server_datetime(c.updatedOn) AS updatedOn
    FROM
        company_master c
    WHERE
        c.tenantId = ${tenantId}
      `;
    }

    static findAllByUserId(tenantId, userId) {
        let sql = `
            SELECT  c.id,
            c.company_name,
            c.legal_name,
            c.authorize_person_name,
            c.address,
            c.contact_no,
            c.email,
            c.website,
            c.pan,
            c.gstin,
            c.status,
            c.createdBy,
            get_datetime_in_server_datetime(c.createdOn) AS createdOn,
            c.updatedBy,
            get_datetime_in_server_datetime(c.updatedOn) AS updatedOn
            FROM company_master c
            INNER JOIN company_access ca ON c.id = ca.company_id
            WHERE c.tenantId = ${tenantId}
        `;

        if (userId) {
            sql += ` AND ca.user_id = ${userId}`;
        };
        sql += " ORDER BY c.company_name";
        return db.execute(sql);
    };

    static findAll(tenantId) {
        let sql = this.AllCompany(tenantId)
        sql += " ORDER BY c.company_name";
        return db.execute(sql);
    };

    static findActiveAllByUserId(tenantId, userId) {
        let sql = `
            SELECT c.id,
            c.company_name,
            c.legal_name,
            c.authorize_person_name,
            c.address,
            c.contact_no,
            c.email,
            c.website,
            c.pan,
            c.gstin,
            c.status,
            c.createdBy,
            get_datetime_in_server_datetime(c.createdOn) AS createdOn,
            c.updatedBy,
            get_datetime_in_server_datetime(c.updatedOn) AS updatedOn
            FROM company_master c
            INNER JOIN company_access ca ON c.id = ca.company_id
            WHERE status =1 AND c.tenantId = ${tenantId}
        `;

        if (userId) {
            sql += ` AND ca.user_id = ${userId}`;
        };
        sql += " ORDER BY c.company_name";
        return db.execute(sql);
    };

    static findActiveAll(tenantId) {
        let sql = this.AllCompany(tenantId)
        sql += ` AND c.status = 1`
        sql += `  ORDER BY c.company_name;`

        return db.execute(sql);
    };

    static findByIdWithUserId(tenantId, id, userId) {
        let sql = `
            SELECT  c.id,
            c.company_name,
            c.legal_name,
            c.authorize_person_name,
            c.address,
            c.contact_no,
            c.email,
            c.website,
            c.pan,
            c.gstin,
            c.status,
            c.createdBy,
            get_datetime_in_server_datetime(c.createdOn) AS createdOn,
            c.updatedBy,
            get_datetime_in_server_datetime(c.updatedOn) AS updatedOn
            FROM company_master c
            INNER JOIN company_access ca ON c.id = ca.company_id
            WHERE c.tenantId = ${tenantId}
        `;
        if (userId) {
            sql += ` AND ca.user_id = ${userId}`;
        };
        sql += `AND c.id=${id}`;
        return db.execute(sql)
    };

    static findById(tenantId, id) {
        let sql = `
            SELECT  c.id,
            c.company_name,
            c.legal_name,
            c.authorize_person_name,
            c.address,
            c.contact_no,
            c.email,
            c.website,
            c.pan,
            c.gstin,
            c.status,
            c.createdBy,
            get_datetime_in_server_datetime(c.createdOn) AS createdOn,
            c.updatedBy,
            get_datetime_in_server_datetime(c.updatedOn) AS updatedOn
            FROM company_master c
            INNER JOIN company_access ca ON c.id = ca.company_id
            WHERE c.tenantId = ${tenantId}
            AND c.id=${id}
        `;
        return db.execute(sql)
    };

    static async deleteValidation(companyId) {
        const [clientResults] = await db.execute(`SELECT COUNT(*) AS count FROM client_master WHERE companyId = ?`, [companyId]);

        if (clientResults[0].count > 0) {
            return false
        };
        const [accountResults] = await db.execute(`SELECT COUNT(*) AS count FROM account_master WHERE companyId = ?`, [companyId]);

        if (accountResults[0].count > 0) {
            return false
        };
        const [transaction] = await db.execute(`SELECT COUNT(*) AS count FROM transaction WHERE companyId = ?`, [companyId]);

        if (transaction[0].count > 0) {
            return false
        };

        const [transfer] = await db.execute(`SELECT COUNT(*) AS count FROM transfer WHERE companyId = ?`, [companyId]);

        if (transfer[0].count > 0) {
            return false
        };
        return true
    }

    static async delete(tenantId, companyId) {
        const [deleteResult] = await db.execute(`DELETE FROM company_master WHERE tenantId = ? AND id = ?`, [tenantId, companyId]);
        return deleteResult;
    };

    async update(tenantId, id) {
        let sql = `UPDATE company_master SET
                company_name='${this.company_name}',
                legal_name='${this.legal_name}',
                authorize_person_name='${this.authorize_person_name}',
                address='${this.address}',
                contact_no='${this.contact_no}',
                email='${this.email}',
                website='${this.website}',
                pan='${this.pan}',
                gstin='${this.gstin}',
                status='${this.status}',
                updatedBy='${this.updatedBy}',
                updatedOn=UTC_TIMESTAMP()
                WHERE tenantId = ${tenantId} AND id = ${id}`;
        return db.execute(sql);
    };

    static async exists(id) {
        let sql = `SELECT * FROM company_master WHERE id = ${id}`;
        const [result] = await db.execute(sql);
        return result.length > 0;
    };
};

module.exports = Company;