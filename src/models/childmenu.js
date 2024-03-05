const db = require('../db/dbconnection')

class Childmenu {
    constructor(tenantId, menu_name, parent_id, display_rank, status, createdBy, updatedBy) {
        this.tenantId = tenantId;
        this.menu_name = menu_name;
        this.parent_id = parent_id;
        this.display_rank = display_rank;
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
            INSERT INTO childmenu_master(
                tenantId,
                menu_name,
                parent_id,
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
                '${this.parent_id}',
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

    static findChildmenuQuery(tenantId) {
        return `
        SELECT c.id,
               c.menu_name,
               c.parent_id,
               c.display_rank,
               c.status,
               c.createdBy,
               get_datetime_in_server_datetime(c.createdOn) AS createdOn,
               c.updatedBy,
               get_datetime_in_server_datetime(c.updatedOn) AS updatedOn,
               p.menu_name as parent_menu_name,
               p.display_rank as parent_display_rank
        FROM childmenu_master c
        LEFT JOIN parentmenu_master p ON c.tenantId = p.tenantId AND c.parent_id = p.id
        WHERE c.tenantId = ${tenantId}
        `;
    }

    static findAll(tenantId) {
        let sql = this.findChildmenuQuery(tenantId)
        sql += " ORDER BY parent_display_rank, display_rank ASC";
        return db.execute(sql);
    };

    static findActiveAll(tenantId) {
        let sql = this.findChildmenuQuery(tenantId);
        sql += " ORDER BY parent_display_rank, display_rank ASC";
        return db.execute(sql);
    };

    static findById(tenantId, id) {
        let sql = this.findChildmenuQuery(tenantId)
        sql += `AND c.id = ${id}`;
        return db.execute(sql)
    };

    static delete(tenantId, id) {
        let sql = `DELETE FROM childmenu_master WHERE id = ${id} AND tenantId = ${tenantId}`;
        return db.execute(sql)
    };

    async update(tenantId, id) {
        let sql = `UPDATE childmenu_master SET menu_name='${this.menu_name}',parent_id='${this.parent_id}',display_rank='${this.display_rank}',status='${this.status}',updatedBy='${this.updatedBy}',updatedOn=UTC_TIMESTAMP() WHERE tenantId = ${tenantId} AND id = ${id} `;
        return db.execute(sql)

    };
}

module.exports = Childmenu;