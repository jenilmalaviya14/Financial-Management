const db = require('../db/dbconnection')

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

            let sql = `
        INSERT INTO tenant_master(
            tenantname,
            personname,
            address,
            contact,
            email,
            startdate,
            enddate,
            status,
            createdBy,
            createdOn,
            updatedBy,
            updatedOn
        )
        VALUES(
            '${this.tenantname}',
            '${this.personname}',
            '${this.address}',
            '${this.contact}',
            '${this.email}',
            '${this.startdate}',
            '${this.enddate}',
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

    // async save() {
    //     try {

    //         const sql = 'CALL create_new_tenant(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    //         const values = [
    //             this.tenantname, this.personname, this.address, this.contact,
    //             this.email, this.startdate, this.enddate, this.status, this.createdBy, this.updatedBy
    //         ];

    //         return db.execute(sql, values)

    //     } catch (error) {
    //         throw error;
    //     }
    // }

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
        get_datetime_in_server_datetime(updatedOn) AS updatedOn,
        updatedBy
        FROM tenant_master`
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

    static delete(id) {
        let sql = `DELETE FROM tenant_master WHERE tenantId = ${id}`;
        return db.execute(sql)
    }

    async update(id) {
        let sql = `UPDATE tenant_master SET tenantname='${this.tenantname}',personname='${this.personname}',address='${this.address}',contact='${this.contact}',email='${this.email}',startdate='${this.startdate}',enddate='${this.enddate}',status='${this.status}',updatedBy='${this.updatedBy}',updatedOn=UTC_TIMESTAMP() WHERE tenantId = ${id}`;
        return db.execute(sql)

    };
}

module.exports = Tenant;