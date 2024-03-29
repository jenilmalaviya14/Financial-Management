const Role = require("../models/role");
const { createRoleSchema, updateRoleSchema } = require('../validation/role.validation');
const { getDecodeToken } = require('../middlewares/decoded');
const db = require('../db/dbconnection');

let roleResultSearch = (q, roleResult) => {
    if (q) {
        const queryLowered = q.toLowerCase();
        return roleResult.filter(role =>
            (role.rolename.toLowerCase().includes(queryLowered)) ||
            (typeof role.status === 'string' && role.status.toLowerCase() === "active" && "active".includes(queryLowered))
        );
    }
    else {
        return roleResult
    }
};

const CreateRole = async (req, res) => {
    const token = getDecodeToken(req);
    try {

        const { error } = createRoleSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        };

        let { rolename, status } = req.body;

        const tenantId = token.decodedToken.tenantId;
        const userId = token.decodedToken.userId;

        let role = new Role(null, tenantId, rolename, status);

        const isUnique = await role.isRoleNameUnique();
        if (!isUnique) {
            return res.status(400).json({
                success: false,
                message: "Duplicate Role Name is not allowed. This Role Name is already exists."
            });
        }

        role.createdBy = userId;
        role.updatedBy = userId;

        role = await role.save()

        res.status(200).json({
            success: true,
            message: "Role Created Successfully",
            record: { role }
        });
    } catch (error) {
        console.log(error);
        next(error)
    }
};

const ListRole = async (req, res, next) => {
    const token = getDecodeToken(req);
    const tenantId = token.decodedToken.tenantId;
    try {
        const { q = '', id } = req.query;

        if (id) {
            const role = await Role.findById(tenantId, id);

            if (role[0].length === 0) {
                return res.status(404).json({ success: false, message: 'The specified Role was not found.' });
            }

            return res.status(200).json({ success: true, message: 'Role found', data: role[0][0] });
        }

        const roleResult = await Role.findAll(tenantId);

        roleResult[0] = roleResultSearch(q, roleResult[0]);

        let responseData = {
            success: true,
            message: 'Role list has been fetched Successfully.',
            data: roleResult[0]
        };
        res.status(200).json(responseData);

    } catch (error) {
        console.log(error);
        next(error);
    }
};

const ActiveRole = async (req, res, next) => {
    const token = getDecodeToken(req);
    const tenantId = token.decodedToken.tenantId;
    try {
        const { q = '', id } = req.query;

        if (id) {
            const role = await Role.findById(tenantId, id);

            if (role[0].length === 0) {
                return res.status(404).json({ success: false, message: 'The specified Role was not found.' });
            }

            return res.status(200).json({ success: true, message: 'Role found', data: role[0][0] });
        }

        const roleResult = await Role.findActiveAll(tenantId);

        roleResult[0] = roleResultSearch(q, roleResult[0]);

        let responseData = {
            success: true,
            message: 'Role list has been fetched Successfully.',
            data: roleResult[0]
        };

        responseData.data = responseData.data.map(role => {
            const { tenantId, ...rest } = role;
            return rest;
        });

        res.status(200).json(responseData);

    } catch (error) {
        console.log(error);
        next(error);
    }
};

const getRoleById = async (req, res, next) => {
    const token = getDecodeToken(req);
    const tenantId = token.decodedToken.tenantId;
    try {
        let Id = req.params.id;
        let [role, _] = await Role.findById(tenantId, Id);

        res.status(200).json({
            success: true,
            message: "Role Record Successfully",
            data: role[0]
        });
    } catch (error) {
        console.log(error);
        next(error)
    }
};

const deleteRole = async (req, res, next) => {
    const token = getDecodeToken(req);
    const tenantId = token.decodedToken.tenantId;
    try {
        let roleId = req.params.id;

        const [roleResults] = await db.execute(`SELECT COUNT(*) AS count FROM user_master WHERE roleId = ${roleId}`);

        if (roleResults[0].count > 0) {
            return res.status(200).json({
                success: false,
                message: "This Role contains Data, You can't Delete it."
            });
        }

        await Role.delete(tenantId, roleId);

        res.status(200).json({
            success: true,
            message: "Role Deleted Successfully"
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};

const updateRole = async (req, res, next) => {
    const token = getDecodeToken(req);
    const tenantId = token.decodedToken.tenantId;
    const userId = token.decodedToken.userId;
    try {
        let Id = req.params.id;
        const { error } = updateRoleSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        };

        let { rolename, status } = req.body;

        let role = new Role(Id, tenantId, rolename, status);

        role.updatedBy = userId;

        const isUnique = await role.isRoleNameUnique();
        if (!isUnique) {
            return res.status(400).json({
                success: false,
                message: "Duplicate Role Name is not allowed. This Role Name is already exists."
            });
        }

        let [findrole, _] = await Role.findById(tenantId, Id);
        if (!findrole) {
            throw new Error("The specified Role was not found.!")
        }
        await role.update(tenantId, Id)
        res.status(200).json({
            success: true,
            message: "Role Successfully Updated",
            record: { role }, returnOriginal: false, runValidators: true
        });
    } catch (error) {
        console.log(error);
        next(error)
    }
};

module.exports = {
    CreateRole,
    ListRole,
    ActiveRole,
    getRoleById,
    deleteRole,
    updateRole
}