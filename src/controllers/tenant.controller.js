const Tenant = require("../models/tenant");
const Role = require("../models/role");
const User = require("../models/user");
const userController = require("../controllers/user.controller");
const { use } = require("../routes/company.route");
const { getDecodeToken } = require('../middlewares/decoded');
const { createTenantSchema, updateTenantSchema } = require('../validation/tenant.validation');
const unauthorizedmessage = ("Access Denied: This operation cannot be performed by an unauthorized user.");

let tenantResultSearch = (q, tenantResult) => {
    if (q) {
        const queryLowered = q.toLowerCase();
        return tenantResult.filter(tenant =>
            (tenant.tenantname.toLowerCase().includes(queryLowered)) ||
            (tenant.personname.toLowerCase().includes(queryLowered)) ||
            (tenant.address.toLowerCase().includes(queryLowered)) ||
            (typeof tenant.status === 'number' && tenant.status === 1 && "active".includes(queryLowered)) ||
            (typeof tenant.status === 'number' && tenant.status === 0 && "inactive".includes(queryLowered))
        );
    }
    else {
        return tenantResult
    }
};

let tenantDifferenceDays = async (tenantResult) => {
    const currentDate = new Date();
    tenantResult[0].forEach(tenant => {
        const endDate = new Date(tenant.enddate);
        const daysDifference = Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24));
        tenant.tenantDays = daysDifference;
    });
}

const CreateTenant = async (req, res) => {
    try {
        const token = getDecodeToken(req);
        const userId = token.decodedToken.userId;
        const tenantId = token.decodedToken.tenantId;
        const roleId = token.decodedToken.roleId;

        const isValidRole = await Role.isThisSuperAdminRole(tenantId, roleId)
        if (!isValidRole) {
            res.status(401).json({
                success: false,
                message: unauthorizedmessage
            })
        }

        const { error } = createTenantSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        };

        let { tenantname, personname, address, contact, email, startdate, enddate, status } = req.body;
        let tenant = new Tenant(tenantname, personname, address, contact, email, startdate, enddate, status);

        tenant.createdBy = userId;
        tenant.updatedBy = userId

        tenant = await tenant.save()

        res.status(200).json({
            success: true,
            message: "Tenant Created Successfully",
            record: { tenant }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.sqlMessage.includes('email')) {
                return res.status(200).json({
                    success: false,
                    message: "Duplicate Email is not allowed. This Email is already exists."
                });
            } else if (error.sqlMessage.includes('tenantname')) {
                return res.status(200).json({
                    success: false,
                    message: "Duplicate Tenant Name is not allowed. This Tenant Name is already exists."
                });
            }
        }
    }
};

const ListTenant = async (req, res, next) => {
    try {
        const token = getDecodeToken(req)
        const tenantId = token.decodedToken.tenantId;
        const roleId = token.decodedToken.roleId;

        const isValidRole = await Role.isThisSuperAdminRole(tenantId, roleId)
        if (!isValidRole) {
            return res.status(401).json({
                success: false,
                message: unauthorizedmessage
            });
        }

        const { q = '', id } = req.query;

        if (id) {
            const tenant = await Tenant.findById(id);

            if (tenant[0].length === 0) {
                return res.status(404).json({ success: false, message: 'The specified Tenant was not found.' });
            }

            return res.status(200).json({ success: true, message: 'Tenant found', data: tenant[0][0] });
        }

        const tenantResult = await Tenant.findAll();

        await tenantDifferenceDays(tenantResult)

        tenantResult[0] = tenantResultSearch(q, tenantResult[0]);

        let responseData = {
            success: true,
            message: 'Tenant list has been fetched Successfully.',
            data: tenantResult[0]
        };

        return res.status(200).json(responseData);

    } catch (error) {
        console.log(error);
        return next(error);
    }
};

const logintenant = async (req, res, next) => {
    try {
        const tenantId = req.params.id;

        if (!tenantId) {
            return res.status(400).json({
                message: 'TenantId is required'
            });
        }

        const [adminUser] = await User.findByAdmin(tenantId, 'Admin');

        if (!adminUser) {
            return res.status(404).json({
                message: 'Admin User not found for the given tenantId.'
            });
        }

        const authenticationResult = await userController.checkUserLogin(adminUser);

        return res.status(200).json(authenticationResult);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: error.message
        });
    }
};

const ActiveTenant = async (req, res, next) => {
    try {
        const token = getDecodeToken(req)
        const tenantId = token.decodedToken.tenantId;
        const roleId = token.decodedToken.roleId;

        const isValidRole = await Role.isThisSuperAdminRole(tenantId, roleId)
        if (!isValidRole) {
            res.status(401).json({
                success: false,
                message: unauthorizedmessage
            })
        }

        const { q = '', id } = req.query;

        if (id) {
            const tenant = await Tenant.findById(id);

            if (tenant[0].length === 0) {
                return res.status(404).json({ success: false, message: 'The specified Tenant was not found.' });
            }

            return res.status(200).json({ success: true, message: 'Tenant found', data: tenant[0][0] });
        };

        const tenantResult = await Tenant.findActiveAll();

        await tenantDifferenceDays(tenantResult)

        tenantResult[0] = tenantResultSearch(q, tenantResult[0]);

        let responseData = {
            success: true,
            message: 'Tenant list has been fetched Successfully.',
            data: tenantResult[0]
        };

        res.status(200).json(responseData);

    } catch (error) {
        console.log(error);
        next(error);
    }
};

const getTenantById = async (req, res, next) => {
    try {
        const token = getDecodeToken(req)
        const tenantId = token.decodedToken.tenantId;
        const roleId = token.decodedToken.roleId;

        const isValidRole = await Role.isThisSuperAdminRole(tenantId, roleId)
        if (!isValidRole) {
            res.status(401).json({
                success: false,
                message: unauthorizedmessage
            })
        }

        let Id = req.params.id;
        let tenantResult = await Tenant.findById(Id);

        await tenantDifferenceDays(tenantResult)

        res.status(200).json({
            success: true,
            message: "tenant Record Successfully",
            data: tenantResult[0]
        });
    } catch (error) {
        console.log(error);
        next(error)
    }
};

const deleteTenant = async (req, res, next) => {
    try {
        const token = getDecodeToken(req)
        const tenantId = token.decodedToken.tenantId;
        const roleId = token.decodedToken.roleId;

        const isValidRole = await Role.isThisSuperAdminRole(tenantId, roleId)
        if (!isValidRole) {
            res.status(401).json({
                success: false,
                message: unauthorizedmessage
            })
        }

        let id = req.params.id;

        const tenantValidation = await Tenant.deleteValidation(id)
        if (!tenantValidation) {
            return res.status(200).json({
                success: false,
                message: "This Tenant contains Data, You can't Delete it."
            });
        }
        await Tenant.delete(id);
        return res.status(200).json({
            success: true,
            message: "Tenant Deleted Successfully"
        });
    } catch (error) {
        return res.status(200).json({
            success: false,
            message: error.message
        });
    };
};

const updateTenant = async (req, res, next) => {
    try {
        const token = getDecodeToken(req);
        const userId = token.decodedToken.userId;
        const roleId = token.decodedToken.roleId;
        const tenantId = token.decodedToken.tenantId;

        const isValidRole = await Role.isThisSuperAdminRole(tenantId, roleId)
        if (!isValidRole) {
            res.status(401).json({
                success: false,
                message: unauthorizedmessage
            })
        }

        const { error } = updateTenantSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        };

        let { tenantname, personname, address, contact, email, startdate, enddate, status } = req.body;
        let tenant = new Tenant(tenantname, personname, address, contact, email, startdate, enddate, status);

        tenant.updatedBy = userId

        let Id = req.params.id;
        let [findtenant, _] = await Tenant.findById(Id);
        if (!findtenant) {
            throw new Error("The specified Tenant was not found.!")
        }
        await tenant.update(Id)
        res.status(200).json({
            success: true,
            message: "Tenant Successfully Updated",
            record: { tenant }, returnOriginal: false, runValidators: true
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.sqlMessage.includes('email')) {
                return res.status(200).json({
                    success: false,
                    message: "Duplicate Email is not allowed. This Email is already exists."
                });
            } else if (error.sqlMessage.includes('tenantname')) {
                return res.status(200).json({
                    success: false,
                    message: "Duplicate Tenant Name is not allowed. This Tenant Name is already exists."
                });
            }
        }
    }
};

module.exports = {
    CreateTenant,
    ListTenant,
    ActiveTenant,
    getTenantById,
    deleteTenant,
    updateTenant,
    logintenant
}