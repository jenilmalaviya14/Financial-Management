const db = require('../db/dbconnection');

class Client {
    constructor(tenantId, clientName, status, createdBy, updatedBy, companyId, type) {
        this.tenantId = tenantId;
        this.clientName = clientName;
        this.status = status;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
        this.companyId = companyId;
        this.type = type;
    }

    async save() {
        try {
            let sql = `
            INSERT INTO client_master(
                tenantId,
                clientName,
                status,
                createdBy,
                createdOn,
                updatedBy,
                updatedOn,
                companyId,
                type
            )
            VALUES(
                '${this.tenantId}',
                '${this.clientName}',
                '${this.status}',
                '${this.createdBy}',
                UTC_TIMESTAMP(),
                '${this.updatedBy}',
                UTC_TIMESTAMP(),
                '${this.companyId}',
                '${this.type}'
            )`;
            return db.execute(sql)

        } catch (error) {
            throw error;
        }
    };

    static getAllClientDetails(tenantId, companyId, type) {
        let whereClause = ` WHERE tenantId = '${tenantId}'`;
        if (companyId) {
            whereClause += ` AND companyId = '${companyId}'`;
        }
        if (type) {
            whereClause += ` AND (type = 'Both' OR type = '${type}')`;
        }
        const sql = `SELECT clientId,
                        clientName,
                        status,
                        type,
                        createdBy,
                        get_datetime_in_server_datetime(createdOn) AS createdOn,
                        updatedBy,
                        get_datetime_in_server_datetime(updatedOn) AS updatedOn,
                        companyId
        FROM client_master${whereClause}`;

        return sql;
    };

    static findAll(tenantId, companyId, type) {
        let sql = this.getAllClientDetails(tenantId, companyId, type)
        sql += " ORDER BY clientName ASC";
        return db.execute(sql);
    };

    static findActiveAll(tenantId, companyId, type) {
        let sql = this.getAllClientDetails(tenantId, companyId, type)
        sql += " AND status = 1"
        sql += " ORDER BY clientName ASC";
        return db.execute(sql);
    };

    static findById(tenantId, companyId, id) {
        let sql = this.getAllClientDetails(tenantId, companyId)
        sql += `AND clientId= ${id}`;
        return db.execute(sql)
    };

    static async deleteValidation(clientId) {
        const [clientResults] = await db.execute(`SELECT COUNT(*) AS count FROM transaction WHERE clientId = ?`, [clientId]);

        if (clientResults[0].count > 0) {
            return false
        };
        return true
    }

    static async delete(tenantId, companyId, clientId) {
        const [deleteResult] = await db.execute(`DELETE FROM client_master WHERE tenantId = ? AND companyId = ? AND clientId = ?`, [tenantId, companyId, clientId]);
        return deleteResult;
    }

    async update(tenantId, companyId, id) {
        let sql = `UPDATE client_master SET clientName='${this.clientName}',status='${this.status}',updatedBy='${this.updatedBy}',updatedOn=UTC_TIMESTAMP(), companyId='${this.companyId}',type='${this.type}' WHERE tenantId = ${tenantId} AND companyId = ${companyId} AND clientId = ${id}`;
        return db.execute(sql)

    };
}

module.exports = Client;