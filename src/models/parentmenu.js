const db = require('../db/dbconnection');

class Parentmenu {
    constructor(tenantId, menu_name, display_rank, status, createdBy, updatedBy) {
        this.tenantId = tenantId;
        this.menu_name = menu_name;
        this.display_rank = display_rank;
        this.status = status;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
    }

    async save() {
        try {
            let sql = `
            INSERT INTO parentmenu_master(
                tenantId,
                menu_name,
                display_rank,
                status,
                createdBy,
                createdOn,
                updatedBy,
                updatedOn
            )
            VALUES(
                '${this.tenantId}',
                '${this.menu_name}',
                '${this.display_rank}',
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

    static findAllParentMenu(tenantId) {
        return `SELECT id,
                       menu_name,
                       display_rank,
                       status,
                       createdBy,
                       get_datetime_in_server_datetime(createdOn) AS createdOn,
                       updatedBy,
                       get_datetime_in_server_datetime(updatedOn) AS updatedOn
          FROM parentmenu_master WHERE tenantId = ${tenantId}`
    }

    static findAll(tenantId) {
        let sql = this.findAllParentMenu(tenantId);
        sql += " ORDER BY display_rank ASC";
        return db.execute(sql)
    };

    static findActiveAll(tenantId) {
        let sql = this.findAllParentMenu(tenantId);
        sql += " ORDER BY menu_name, display_rank ASC";
        return db.execute(sql)
    };

    static findById(tenantId, id) {
        let sql = this.findAllParentMenu(tenantId);
        sql += ` AND id = ${id}`;
        return db.execute(sql)
    };

    static delete(tenantId, parentId) {
        let sql = `DELETE FROM parentmenu_master WHERE tenantId = ${tenantId} AND id = ${parentId}`;
        return db.execute(sql)
    };

    async update(tenantId, id) {
        let sql = `UPDATE parentmenu_master SET menu_name='${this.menu_name}',display_rank='${this.display_rank}',status='${this.status}',updatedBy='${this.updatedBy}',updatedOn=UTC_TIMESTAMP() WHERE tenantId = ${tenantId} AND id = ${id}`;
        return db.execute(sql)

    };
}

module.exports = Parentmenu;