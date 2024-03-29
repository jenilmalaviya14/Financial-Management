const db = require('../db/dbconnection')

class Menu {
    constructor(tenantId, role_id, menuItems, createdBy, updatedBy) {
        this.tenantId = tenantId;
        this.role_id = role_id;
        this.menuItems = menuItems;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
    };

    async save() {
        try {
            const deletionPromises = [];

            for (const item of this.menuItems) {
                const existingMenu = await this.findByChildIdAndRoleId(this.tenantId, item.child_id, this.role_id);

                if (item.allow_access === 0 && item.allow_add === 0 && item.allow_edit === 0 && item.allow_delete === 0) {
                    if (existingMenu) {
                        let sql = `DELETE FROM menu_master WHERE child_id = '${item.child_id}' AND role_id='${this.role_id}'`;
                        deletionPromises.push(db.execute(sql));
                    }
                } else {
                    if (existingMenu) {
                        let sql = `
                            UPDATE menu_master SET
                            tenantId='${this.tenantId}',
                            role_id='${this.role_id}',
                            allow_access='${item.allow_access}',
                            allow_add='${item.allow_add}',
                            allow_edit='${item.allow_edit}',
                            allow_delete='${item.allow_delete}',
                            createdBy='${this.createdBy}',
                            updatedOn=UTC_TIMESTAMP(),
                            updatedBy='${this.updatedBy}'
                            WHERE child_id = '${item.child_id}' AND role_id='${this.role_id}'`;
                        await db.execute(sql);
                    } else {
                        let sql = `
                            INSERT INTO menu_master(
                                tenantId,
                                role_id,
                                child_id,
                                allow_access,
                                allow_add,
                                allow_edit,
                                allow_delete,
                                createdBy,
                                createdOn,
                                updatedBy,
                                updatedOn
                            )
                            VALUES (
                                '${this.tenantId}',
                                '${this.role_id}',
                                '${item.child_id}',
                                '${item.allow_access}',
                                '${item.allow_add}',
                                '${item.allow_edit}',
                                '${item.allow_delete}',
                                '${this.createdBy}',
                                UTC_TIMESTAMP(),
                                '${this.updatedBy}',
                                UTC_TIMESTAMP()
                            )`;

                        await db.execute(sql);
                    }
                }
            }
            await Promise.all(deletionPromises);

            return { success: true };
        } catch (error) {
            throw error;
        }
    }

    async findByChildIdAndRoleId(tenantId, childId, roleId) {
        let sql = `SELECT
            role_id,
            child_id,
            allow_access,
            allow_add,
            allow_edit,
            allow_delete,
            createdBy,
            get_datetime_in_server_datetime(createdOn) AS createdOn,
            updatedBy,
            get_datetime_in_server_datetime(updatedOn) AS updatedOn
            FROM menu_master WHERE tenantId = ? AND child_id = ? AND role_id = ?`;
        const result = await db.execute(sql, [tenantId, childId, roleId]);
        return result[0][0];
    }

    static async findAll(tenantId) {
        let sql = `SELECT m.role_id,
                          m.child_id,
                          m.allow_access,
                          m.allow_add,
                          m.allow_edit,
                          m.allow_delete,
                          m.createdBy,
                          get_datetime_in_server_datetime(m.createdOn) AS createdOn,
                          m.updatedBy,
                          get_datetime_in_server_datetime(m.updatedOn) AS updatedOn,
                          c.menu_name AS child_menu_name,
                          c.parent_id,
                          p.menu_name AS parent_menu_name
        FROM menu_master m
        LEFT JOIN childmenu_master c ON m.tenantId = c.tenantId AND m.child_id = c.id
        LEFT JOIN parentmenu_master p ON m.tenantId = p.tenantId ANd c.parent_id = p.id
        WHERE m.tenantId = ${tenantId}`;

        return db.execute(sql);
    };

    static findAllWithRoleId(tenantId, roleId) {
        let sql = `SELECT m.role_id,
        m.child_id,
        m.allow_access,
        m.allow_add,
        m.allow_edit,
        m.allow_delete,
        m.createdBy,
        get_datetime_in_server_datetime(m.createdOn) AS createdOn,
        m.updatedBy,
        get_datetime_in_server_datetime(m.updatedOn) AS updatedOn,
        c.menu_name AS child_menu_name,
        c.parent_id,
        p.menu_name AS parent_menu_name,
        c.menu_name AS child_menu_name,
        c.parent_id,
        p.menu_name AS parent_menu_name
        FROM menu_master m
        LEFT JOIN childmenu_master c ON m.tenantId = c.tenantId AND m.child_id = c.id
        LEFT JOIN parentmenu_master p ON m.tenantId = p.tenantId ANd c.parent_id = p.id
        WHERE m.tenantId = ${tenantId}`;
        const params = [];
        if (roleId) {
            sql += ` AND m.role_id = ?`;
            params.push(roleId);
        }

        return db.execute(sql, params);
    };

    static async findById(tenantId, roleId, id) {
        try {
            let sql = `SELECT m.role_id,
                            m.child_id,
                            m.allow_access,
                            m.allow_add,
                            m.allow_edit,
                            m.allow_delete,
                            m.createdBy,
                            get_datetime_in_server_datetime(m.createdOn) AS createdOn,
                            m.updatedBy,
                            get_datetime_in_server_datetime(m.updatedOn) AS updatedOn,
                            c.menu_name AS child_menu_name,
                            c.parent_id,
                            p.menu_name AS parent_menu_name,
                            c.menu_name AS child_menu_name,
                c.parent_id, p.menu_name AS parent_menu_name
                FROM menu_master m
                LEFT JOIN childmenu_master c ON m.tenantId = c.tenantId AND m.child_id = c.id
                LEFT JOIN parentmenu_master p ON m.tenantId = p.tenantId AND c.parent_id = p.id
                WHERE m.tenantId = ?`;

            const params = [tenantId];

            if (roleId) {
                sql += ` AND m.role_id = ?`;
                params.push(roleId);
            }

            sql += ` AND m.id = ?`;

            params.push(id);

            const [rows, fields] = await db.execute(sql, params);

            return rows;
        } catch (error) {
            throw error;
        }
    };

    static delete(tenantId, id) {
        let sql = `DELETE FROM menu_master WHERE tenantId = ${tenantId} AND id = ${id}`;
        return db.execute(sql)
    };

    static roleBydelete(tenantId, roleId) {
        let sql = `DELETE FROM menu_master WHERE tenantId = ${tenantId} AND role_id = ${roleId}`;
        return db.execute(sql)
    };

    async update(tenantId, id) {
        try {
            let sql = `
                UPDATE menu_master SET
                role_id=?,
                child_id=?,
                allow_access=?,
                allow_add=?,
                allow_edit=?,
                allow_delete=?,
                updatedBy=?,
                updatedOn=?
                WHERE tenantId = ? AND id = ?`

            let values = [
                this.tenantId,
                this.role_id,
                this.child_id,
                this.allow_access,
                this.allow_add,
                this.allow_edit,
                this.allow_delete,
                this.updatedBy,
                this.dateandtime(),
                tenantId,
                id
            ];

            await db.execute(sql, values);
        } catch (error) {
            throw error;
        }
    }

};

module.exports = Menu;