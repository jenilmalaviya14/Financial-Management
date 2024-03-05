const db = require('../db/dbconnection')

class Role {
    constructor(tenantId, rolename, status, createdBy, updatedBy) {
        this.tenantId = tenantId;
        this.rolename = rolename;
        this.status = status;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
    }

    dateandtime = () => {

        let d = new Date();
        let yyyy = d.getFullYear();
        let mm = d.getMonth() + 1;
        let dd = d.getDate();
        let hours = d.getUTCHours();
        let minutes = d.getUTCMinutes();
        let seconds = d.getUTCSeconds();

        return `${yyyy}-${mm}-${dd}` + " " + `${hours}:${minutes}:${seconds}`;
    }

    async save() {
        try {
            let sql = `
        INSERT INTO role_master(
            tenantId,
            rolename,
            status,
            createdBy,
            createdOn,
            updatedBy,
            updatedOn
        )
        VALUES(
            '${this.tenantId}',
            '${this.rolename}',
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
    }

    static getAllRoles(tenantId) {
        return `
        SELECT id,
        rolename,
        status,
        createdBy,
        get_datetime_in_server_datetime(createdOn) AS createdOn,
        updatedBy,
        get_datetime_in_server_datetime(updatedOn) AS updatedOn
         FROM role_master
         WHERE tenantId='${tenantId}'
        `
    }

    static findAll(tenantId) {
        let sql = this.getAllRoles(tenantId)
        sql += `  ORDER BY rolename ASC;`;
        return db.execute(sql)
    }

    static findActiveAll(tenantId) {
        let sql = this.getAllRoles(tenantId)
        sql += ` AND status = 1`;
        return db.execute(sql)
    }

    static async findById(tenantId, id) {
        let sql = this.getAllRoles(tenantId)
        sql += `AND id = ${id}`;
        return await db.execute(sql)
    }

    static delete(tenantId, roleId) {
        let sql = `DELETE FROM role_master WHERE tenantId = ${tenantId} AND id = ${roleId}`;
        return db.execute(sql)
    };

    async update(tenantId, id) {
        let sql = `UPDATE role_master SET rolename='${this.rolename}',status='${this.status}',updatedBy='${this.updatedBy}',updatedOn=UTC_TIMESTAMP() WHERE tenantId = ${tenantId} AND id = ${id}`;
        return db.execute(sql)

    };
}

module.exports = Role;