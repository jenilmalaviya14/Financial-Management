const User = require("../models/user");
const CompanyAccess = require('../models/company_access');
const Company = require('../models/company');
const Role = require("../models/role");
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const emailService = require('../service/email.service');
const { createUserSchema, updateUserSchema } = require('../validation/user.validation');
const { getDecodeToken } = require('../middlewares/decoded');
const baseURL = process.env.API_BASE_URL;

let userResultSearch = (q, userResult) => {
    if (q) {
        const queryLowered = q.toLowerCase();
        return userResult.filter(user =>
            (user.username && user.username.toLowerCase().includes(queryLowered)) ||
            (user.fullname && user.fullname.toLowerCase().includes(queryLowered)) ||
            (user.email && user.email.toLowerCase().includes(queryLowered)) ||
            (user.roleName && user.roleName.toLowerCase().includes(queryLowered)) ||
            (user.companyNames && user.companyNames.toLowerCase().includes(queryLowered)) ||
            (typeof user.status === 'string' && user.status.toLowerCase() === "active" && "active".includes(queryLowered))
        );
    }
    else {
        return userResult
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [user, _] = await User.findByEmail(email);

        if (!user[0]) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }
        if (user[0].profile_image_filename) {
            user[0].profile_image_filename = `${baseURL}/Images/Profile_Images/${user[0].profile_image_filename}`;
        }

        const isValidPassword = await User.comparePassword(password, user[0].password);

        if (!isValidPassword) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        const companyResult = await CompanyAccess.findAllByCompanyAccess(user[0].tenantId, user[0].id);

        const roleResult = await Role.findById(user[0].tenantId, user[0].roleId);

        const userWithCompanies = {
            ...user[0],
            companies: companyResult[0].map(comp => ({ companyId: comp.company_id, companyName: comp.company_name, fiscalStartMonth: comp.fiscal_start_month ?? 4, defaultDateOption: comp.default_date_option ?? 1 })),
            roleName: roleResult[0][0].rolename
        };

        let selectedCompany = userWithCompanies.companies.length > 0 ? userWithCompanies.companies[0] : null;

        const tokenPayload = {
            userId: userWithCompanies.id,
            email: userWithCompanies.email,
            tenantId: userWithCompanies.tenantId,
            roleId: userWithCompanies.roleId,
            companyId: selectedCompany.companyId
        };

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );


        return res.status(200).json({
            success: true,
            message: 'Login successful',
            userData: { ...userWithCompanies },
            token: token
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

const CreateUser = async (req, res) => {
    const token = getDecodeToken(req)
    try {
        const { error } = createUserSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        };

        let { username, fullname, email, password, confirmpassword, profile_image, companies, status, createdBy, updatedBy, roleId } = req.body;

        if (!Array.isArray(companies)) {
            return res.status(400).json({
                success: false,
                message: "Companies must be an array of integers (companyId)."
            });
        };

        const tenantId = token.decodedToken.tenantId;

        let user = new User(tenantId, username, fullname, email, password, confirmpassword, profile_image, null, status, createdBy, updatedBy, roleId);

        if (profile_image) {
            const matches = profile_image.match(/^data:(image\/([a-zA-Z]+));base64,(.+)$/);

            if (!matches || matches.length !== 4) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid profile_image format'
                });
            }

            const contentType = matches[1];
            const fileExtension = matches[2];
            const base64Data = matches[3];

            const buffer = Buffer.from(base64Data, 'base64');

            const fileName = `${Date.now()}-profile.${fileExtension}`;
            const filePath = path.join(__dirname, '../public/Images/Profile_Images', fileName);

            fs.mkdirSync(path.dirname(filePath), { recursive: true });

            fs.writeFileSync(filePath, buffer);

            profile_image = fileName;

            user.profile_image = fileName;
            user.profile_image_filename = fileName;
        }

        let newUser = await user.save();

        let companyAccessResults = [];

        for (const companyId of companies) {
            let companyAccess = new CompanyAccess(tenantId, newUser[0].insertId, [companyId], createdBy);
            let companyAccessResult = await companyAccess.save();

            companyAccessResults.push({ companyId, companyAccessResult });
        }

        res.status(200).json({
            success: true,
            message: "User created successfully!",
            data: {
                user: newUser,
                companyAccesses: companyAccessResults
            }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY' && (error.sqlMessage.includes('email'))) {
            return res.status(200).json({
                success: false,
                message: "Entry with provided email already exists"
            });
        }
        res.status(400).json({
            success: false,
            message: error.message
        });
        console.log(error);
    }
};

const changeCompany = async (req, res) => {
    try {
        const { companyId } = req.body;

        const existingTokenPayload = getDecodeToken(req).decodedToken;

        existingTokenPayload.companyId = companyId;

        const newToken = jwt.sign(
            existingTokenPayload,
            process.env.JWT_SECRET
        );

        return res.status(200).json({
            success: true,
            message: 'Company changed successfully',
            token: newToken
        });
    } catch (error) {
        console.error('Error changing company:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const findOneRec = async (req, res) => {
    try {
        const tokenInfo = getDecodeToken(req);
        const tenantId = tokenInfo.decodedToken.tenantId;

        if (!tokenInfo.success) {
            return res.status(401).json({
                success: false,
                message: tokenInfo.message,
            });
        }

        const userEmail = tokenInfo.decodedToken.email;

        let checkUser = await User.findByEmail(userEmail);

        if (!checkUser[0]) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const userRecord = checkUser[0];

        const userId = userRecord[0].id;

        let [user, _] = await User.findOne(tenantId, userId);

        user[0].companyNames = user[0].companyNames ? user[0].companyNames.split(',') : [];
        user[0].companyIds = user[0].companyIds ? user[0].companyIds.split(',').map(Number) : [];

        if (user[0].profile_image_filename) {
            user[0].profile_image_filename = `${baseURL}/Images/Profile_Images/${user[0].profile_image_filename}`;
        }

        return res.status(200).json({
            success: true, data: user[0]
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const ListUser = async (req, res, next) => {
    const token = getDecodeToken(req);
    const tenantId = token.decodedToken.tenantId
    try {
        const { q = '', id } = req.query;

        if (id) {
            const user = await User.findById(tenantId, id);

            if (user[0].length === 0) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            return res.status(200).json({ success: true, message: 'User found', data: user[0][0] });
        }

        const existingTokenPayload = getDecodeToken(req)
        const companyId = existingTokenPayload.decodedToken.companyId;

        const userResult = await User.findAll(token.decodedToken.tenantId);

        userResult[0] = userResultSearch(q, userResult[0]);

        let responseData = {
            success: true,
            message: 'User List Successfully!',
            data: userResult[0]
        };

        const companyResult = await CompanyAccess.findAll(token.decodedToken.tenantId);;
        let userResponse = responseData.data;
        let companyAccessResponse = companyResult[0];

        const userCompaniesMap = {};

        companyAccessResponse.forEach(access => {
            const userId = access.user_id;

            if (!userCompaniesMap[userId]) {
                userCompaniesMap[userId] = [];
            }

            userCompaniesMap[userId].push({ companyId: access.company_id, roleName: access.roleName });

        });

        userResponse = userResponse.filter(user => {
            const userId = user.id;
            return userCompaniesMap[userId]?.some(company => company.companyId === companyId);
        });

        userResponse.forEach(user => {
            const userId = user.id;
            if (userCompaniesMap[userId]) {
                user.companies = userCompaniesMap[userId];
                if (user.profile_image_filename) {
                    user.profile_image_filename = `${baseURL}/Images/Profile_Images/${user.profile_image_filename}`;
                }
                user.companyNames = user.companyNames.replaceAll(',', ', ');
            } else {
                user.companies = [];
            }
        });

        res.status(200).json({
            data: userResponse
        });

    } catch (error) {
        console.log(error);
        next(error);
    }
};

const Activeuser = async (req, res, next) => {
    const token = getDecodeToken(req);
    const tenantId = token.decodedToken.tenantId
    try {
        const { q = '', id } = req.query;

        if (id) {
            const user = await User.findById(tenantId, id);

            if (user[0].length === 0) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            return res.status(200).json({ success: true, message: 'User found', data: user[0][0] });
        }

        const existingTokenPayload = getDecodeToken(req)
        const companyId = existingTokenPayload.decodedToken.companyId;

        const userResult = await User.findActiveAll(token.decodedToken.tenantId);

        userResult[0] = userResultSearch(q, userResult[0]);

        let responseData = {
            success: true,
            message: 'User List Successfully!',
            data: userResult[0]
        };

        const companyResult = await CompanyAccess.findAll(token.decodedToken.tenantId);;
        let userResponse = responseData.data;
        let companyAccessResponse = companyResult[0];

        const userCompaniesMap = {};

        companyAccessResponse.forEach(access => {
            const userId = access.user_id;

            if (!userCompaniesMap[userId]) {
                userCompaniesMap[userId] = [];
            }

            userCompaniesMap[userId].push({ companyId: access.company_id, roleName: access.roleName });

        });

        userResponse = userResponse.filter(user => {
            const userId = user.id;
            return userCompaniesMap[userId]?.some(company => company.companyId === companyId);
        });

        userResponse.forEach(user => {
            const userId = user.id;
            if (userCompaniesMap[userId]) {
                user.companies = userCompaniesMap[userId];
                if (user.profile_image_filename) {
                    user.profile_image_filename = `${baseURL}/Images/Profile_Images/${user.profile_image_filename}`;
                }
            } else {
                user.companies = [];
            }
        });

        res.status(200).json({
            data: userResponse
        });

    } catch (error) {
        console.log(error);
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    const token = getDecodeToken(req);
    const tenantId = token.decodedToken.tenantId
    try {
        let userId = req.params.id;

        let [user, _] = await User.findOne(tenantId, userId);

        if (user.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user[0].companyNames = user[0].companyNames ? user[0].companyNames.split(',') : [];
        user[0].companyIds = user[0].companyIds ? user[0].companyIds.split(',').map(Number) : [];

        if (user[0].profile_image_filename) {
            user[0].profile_image_filename = `${baseURL}/Images/Profile_Images/${user[0].profile_image_filename}`;
        }

        res.status(200).json({
            success: true,
            message: "User Record Successfully!",
            data: user[0]
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        let userId = req.params.id;
        await User.delete(userId)
        res.status(200).json({
            success: true,
            message: "User Delete Successfully!"
        });
    } catch (error) {
        console.log(error);
        next(error)
    }
};

const updateUser = async (req, res, next) => {
    const token = getDecodeToken(req)
    try {

        const { error } = updateUserSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        };

        const { username, fullname, email, password, confirmpassword, profile_image, companyId, status, createdBy, updatedBy, roleId } = req.body;
        if (!companyId) {
            throw new Error("companyId is required for updating user.");
        };

        const companyIdArray = Array.isArray(companyId) ? companyId : [companyId];

        const tenantId = token.decodedToken.tenantId;

        let user = new User(tenantId, username, fullname, email, password, confirmpassword, '', companyIdArray, status, createdBy, updatedBy, roleId);
        const userId = req.params.id;

        if (profile_image) {
            const matches = profile_image.match(/^data:(image\/([a-zA-Z]+));base64,(.+)$/);

            if (!matches || matches.length !== 4) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid profile_image format'
                });
            }

            const contentType = matches[1];
            const fileExtension = matches[2];
            const base64Data = matches[3];

            const buffer = Buffer.from(base64Data, 'base64');

            const fileName = `${Date.now()}-profile.${fileExtension}`;
            const filePath = path.join(__dirname, '../public/Images/Profile_Images', fileName);

            fs.mkdirSync(path.dirname(filePath), { recursive: true });

            fs.writeFileSync(filePath, buffer);

            user.profile_image_filename = fileName;
        }
        let updateUserResult = await user.update(userId);

        res.status(200).json({
            success: true,
            message: "User Successfully Updated",
            record: { updateUserResult },
            returnOriginal: false,
            runValidators: true
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const [user, _] = await User.findByEmail(email);

        if (!user[0]) {
            return res.status(404).json({
                success: false,
                message: 'Email not found'
            });
        }

        const otp = generateOTP();

        await emailService.sendEmail(email, `Your OTP for password reset is: ${otp}`, 'Password Reset OTP');

        // Store the OTP in the database
        await User.saveOTP(email, otp);

        return res.status(200).json({
            success: true,
            message: 'OTP sent to email for password reset'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const verifyOTPAndUpdatePassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const [storedOTP, _] = await User.findOTP(email);

        if (!storedOTP[0] || storedOTP[0].otp !== otp) {
            return res.status(401).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 8);
        await User.updatePassword(email, hashedPassword);

        return res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const changePassword = async (req, res) => {
    const token = getDecodeToken(req)
    const tenantId = token.decodedToken.tenantId;
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;

        const userId = req.params.id;
        const [user, _] = await User.findById(tenantId, userId);

        if (!user[0]) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isValidPassword = await User.comparePassword(oldPassword, user[0].password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid old password'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password and confirm password do not match'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 8);
        await User.updatePassword(user[0].email, hashedPassword);

        return res.status(200).json({
            success: true,
            message: 'Password change successful'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const resetPassword = async (req, res) => {
    const token = getDecodeToken(req)
    try {
        const { newPassword, confirmPassword } = req.body;

        const userId = req.params.id;
        const [user, _] = await User.findById(tenantId, userId);

        if (!user[0]) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        };

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password and confirm password do not match'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 8);
        await User.updatePassword(user[0].email, hashedPassword);

        return res.status(200).json({
            success: true,
            message: 'Password change successful'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    CreateUser,
    ListUser,
    Activeuser,
    getUserById,
    deleteUser,
    updateUser,
    loginUser,
    changeCompany,
    findOneRec,
    forgotPassword,
    changePassword,
    verifyOTPAndUpdatePassword,
    resetPassword
}