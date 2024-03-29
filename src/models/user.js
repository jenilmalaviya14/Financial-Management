const db = require('../db/dbconnection');
const bcrypt = require('bcrypt');
class User {
    constructor(tenantId, username, fullname, email, password, profile_image_filename, companyId, status, createdBy, updatedBy, roleId) {
        this.tenantId = tenantId;
        this.username = username;
        this.fullname = fullname;
        this.email = email;
        this.password = password
        this.profile_image_filename = profile_image_filename;
        this.companyId = companyId;
        this.status = status;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
        this.roleId = roleId;
    };

    static getUser(tenantId) {
        return `SELECT u.id,
                   u.username,
                   u.fullname,
                   u.email,
                   u.password,
                   u.profile_image,
                   u.status,
                   u.createdBy,
                   get_datetime_in_server_datetime(u.createdOn) AS createdOn,
                   u.updatedBy,
                   get_datetime_in_server_datetime(u.updatedOn) AS updatedOn,
                   u.otp,
                   u.roleId,
                   u.profile_image_filename,
                   u.forcePasswordChange AS forcePasswordChange,
                   r.roleName,
                   GROUP_CONCAT(c.company_name ORDER BY c.company_name ASC) AS companyNames
            FROM user_master u
            LEFT JOIN role_master r ON u.tenantId = r.tenantId AND u.roleId = r.id
            LEFT JOIN company_access ca ON u.tenantId = ca.tenantId AND u.id = ca.user_id
            LEFT JOIN company_master c ON u.tenantId = c.tenantId AND ca.company_id = c.id
            WHERE u.tenantId = ${tenantId}
        `;
    }

    async save() {
        try {
            const hashedPassword = await bcrypt.hash(this.password, 8);

            let sql = `
            INSERT INTO user_master(
                tenantId,
                username,
                fullname,
                email,
                password,
                profile_image_filename,
                status,
                createdBy,
                createdOn,
                updatedBy,
                updatedOn,
                roleId,
                forcePasswordChange
            )
            VALUES(
                '${this.tenantId}',
                '${this.username}',
                '${this.fullname}',
                '${this.email}',
                '${hashedPassword}',
                '${this.profile_image_filename}',
                '${this.status}',
                '${this.createdBy}',
                UTC_TIMESTAMP(),
                '${this.updatedBy}',
                UTC_TIMESTAMP(),
                '${this.roleId}',
                '1'
            )`;
            const tmp = await db.execute(sql);
            return tmp;

        } catch (error) {
            throw error;
        }
    }

    static comparePassword(password, hashedPassword) {
        return bcrypt.compare(password, hashedPassword);
    }

    static async findAll(tenantId) {
        let sql = this.getUser(tenantId)
        sql += ` GROUP BY u.id`;
        sql += ` ORDER BY u.fullname ASC, u.id`;
        return db.execute(sql);
    }

    static findActiveAll(tenantId) {
        let sql = this.getUser(tenantId)
        sql += ` GROUP BY u.id`;
        sql += ` ORDER BY u.fullname ASC`;
        return db.execute(sql);
    }

    static findById(tenantId, id) {
        let sql = this.getUser(tenantId)
        sql += ` AND u.id = ${id}`
        sql += ' GROUP BY u.id';
        return db.execute(sql);
    }

    static findOne(tenantId, id) {
        let sql = this.getUser(tenantId)
        sql += ` AND u.id = ${id}`
        sql += ' GROUP BY u.id';
        return db.execute(sql);
    }

    static findByAdmin(tenantId, roleName) {
        let sql = `SELECT u.*,
                   GROUP_CONCAT(c.company_name ORDER BY c.company_name ASC) AS companyNames
                FROM user_master u
                LEFT JOIN role_master rm ON u.tenantId = rm.tenantId AND u.roleId = rm.id
                LEFT JOIN company_access ca ON u.tenantId = ca.tenantId AND u.id = ca.user_id
                LEFT JOIN company_master c ON u.tenantId = c.tenantId AND ca.company_id = c.id
                WHERE u.tenantId = ${tenantId}
                AND rm.roleName = '${roleName}'`;

        return db.execute(sql);
    }

    static findByEmail(email) {
        let sql = `SELECT * FROM user_master WHERE email = '${email}'`;
        return db.execute(sql);
    }

    static delete(id) {
        let sql = `DELETE FROM user_master WHERE id = ${id}`;
        return db.execute(sql)
    }

    async update(id, profile_image_filename) {
        try {
            if (profile_image_filename) {
                this.profile_image_filename = profile_image_filename;
            }

            let profileImageQueryPart = '';
            if (this.profile_image_filename) {
                profileImageQueryPart = `profile_image_filename='${this.profile_image_filename}'`;
            } else {
                profileImageQueryPart = `profile_image_filename=null`;
            }

            let sql = `
                UPDATE user_master
                SET tenantId='${this.tenantId}',
                    username='${this.username}',
                    fullname='${this.fullname}',
                    email='${this.email}',
                    status='${this.status}',
                    createdBy='${this.createdBy}',
                    updatedBy='${this.updatedBy}',
                    updatedOn=UTC_TIMESTAMP(),
                    roleId='${this.roleId}',
                    ${profileImageQueryPart}
                WHERE id = ${id}`;

            await db.execute(sql);

            if (this.companyId && Array.isArray(this.companyId) && this.companyId.length > 0) {
                const existingCompaniesSql = `SELECT company_id FROM company_access WHERE user_id = '${id}'`;
                const [existingCompaniesResult] = await db.execute(existingCompaniesSql);
                const existingCompanyIds = existingCompaniesResult.map(item => item.company_id);

                for (const companyId of existingCompanyIds) {
                    const updateCompanySql = `
                        UPDATE company_access
                        SET tenantId='${this.tenantId}',
                            user_id='${id}',
                            updatedOn=UTC_TIMESTAMP()
                        WHERE user_id = '${id}' AND company_id = '${companyId}'`;

                    await db.execute(updateCompanySql);
                };

                const newCompanies = this.companyId.filter(companyId => !existingCompanyIds.includes(companyId));
                for (const newCompanyId of newCompanies) {
                    const addCompanySql = `
                        INSERT INTO company_access(tenantId, user_id, company_id, createdOn, updatedOn)
                        VALUES('${this.tenantId}', '${id}', '${newCompanyId}', UTC_TIMESTAMP(), UTC_TIMESTAMP())`;
                    await db.execute(addCompanySql);
                }

                const removedCompanies = existingCompanyIds.filter(companyId => !this.companyId.includes(companyId));
                for (const removedCompanyId of removedCompanies) {
                    const removeCompanySql = `DELETE FROM company_access WHERE user_id = '${id}' AND company_id = '${removedCompanyId}'`;
                    await db.execute(removeCompanySql);
                }
            }
        } catch (error) {
            throw error;
        }
    }

    static saveOTP(email, otp) {
        try {
            let sql = `
        UPDATE user_master
        SET otp = '${otp}'
        WHERE email = '${email}'`;

            return db.execute(sql);
        } catch (error) {
            throw error;
        }
    }

    static findOTP(email) {
        let sql = `SELECT otp FROM user_master WHERE email = '${email}'`;
        return db.execute(sql);
    }

    static updatePassword(email, hashedPassword, forcePasswordChange) {
        let sql = `UPDATE user_master SET password='${hashedPassword}', forcePasswordChange=${forcePasswordChange} WHERE email = '${email}'`;
        return db.execute(sql);
    };
};
module.exports = User