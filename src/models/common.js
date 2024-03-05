const db = require('../db/dbconnection')

class Common {
    constructor(tenantId, name, type, status, createdBy, updatedBy) {
        this.tenantId = tenantId;
        this.name = name;
        this.type = type;
        this.status = status;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
    }

    async save() {
        try {
            let sql = `
            INSERT INTO common_master(
                tenantId,
                name,
                type,
                status,
                createdBy,
                createdOn,
                updatedBy,
                updatedOn
            )
            VALUES(
                '${this.tenantId}',
                '${this.name}',
                '${this.type}',
                '${this.status}',
                '${this.createdBy}',
                UTC_TIMESTAMP(),
                '${this.updatedBy}',
                UTC_TIMESTAMP()
            )`;
            return db.execute(sql)

        } catch (error) {
            throw error;
        }
    };

    static getAllMasters(tenantId, type) {
        let sql = `SELECT common_id,
                          name,
                          type,
                          status,
                          createdBy,
                          get_datetime_in_server_datetime(createdOn) AS createdOn,
                          updatedBy,
                          get_datetime_in_server_datetime(updatedOn) AS updatedOn
         FROM common_master
         WHERE tenantId = ${tenantId}
         `
        if (type) {
            if (tenantId) {
                sql += ` AND type = '${type}'`;
            }
        }
        return sql
    }

    static findAll(tenantId, type) {
        let sql = this.getAllMasters(tenantId, type);
        sql += " ORDER BY name";
        return db.execute(sql)
    };

    static findActiveAll(tenantId, type) {
        let sql = this.getAllMasters(tenantId, type);
        sql += " ORDER BY name";
        return db.execute(sql);
    };

    static findById(tenantId, id) {
        let sql = this.getAllMasters(tenantId);
        sql += `AND common_id = ${id}`
        return db.execute(sql)
    };

    static delete(tenantId, commonId) {
        let sql = `DELETE FROM common_master WHERE tenantId = ${tenantId} AND common_id = ${commonId}`;
        return db.execute(sql)
    };

    async update(tenantId, id) {
        let sql = `UPDATE common_master SET name='${this.name}',type='${this.type}',status='${this.status}', updatedBy='${this.updatedBy}',updatedOn=UTC_TIMESTAMP() WHERE tenantId = ${tenantId} AND common_id = ${id}`;
        return db.execute(sql)

    };
}

module.exports = Common;