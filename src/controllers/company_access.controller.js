const CompanyAccess = require("../models/company_access");
const { getDecodeToken } = require('../middlewares/decoded');

const CreateCompanyAccess = async (req, res) => {
    try {
        let { tenantId, user_id, company_id } = req.body;
        if (!Array.isArray(company_id)) {
            company_id = [company_id];
        }
        let companyAccess = new CompanyAccess(tenantId, user_id, company_id);

        companyAccess = await companyAccess.save()

        res.status(200).json({
            success: true,
            message: "CompanyAccess create successfully!",
            record: { companyAccess }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        })
        console.log(error);
    }
};

const ListCreateCompanyAccess = async (req, res, next) => {
    const token = getDecodeToken(req)
    try {
        const { q = '', id } = req.query;

        if (id) {
            const companyAccess = await CompanyAccess.findById(id);

            if (companyAccess[0].length === 0) {
                return res.status(404).json({ success: false, message: 'CompanyAccess not found' });
            }

            return res.status(200).json({ success: true, message: 'CompanyAccess found', data: menu[0][0] });
        }

        const companyAccessResult = await CompanyAccess.findAll(token.decodedToken.tenantId);;
        let responseData = {
            success: true,
            message: 'CompanyAccsess List Successfully!',
            data: companyAccessResult[0]
        };

        if (q) {
            const queryLowered = q.toLowerCase();
            const filteredData = companyAccessResult[0].filter(
                menu =>
                    (menu.status.toLowerCase() === "active" && "active".includes(queryLowered))
            );

            if (filteredData.length > 0) {
                responseData = {
                    ...responseData,
                    data: filteredData,
                    total: filteredData.length
                };
            } else {
                responseData = {
                    ...responseData,
                    message: 'No matching CompanyAccess found',
                    data: [],
                    total: 0
                };
            }
        }

        res.status(200).json(responseData);

    } catch (error) {
        console.log(error);
        next(error);
    }
};

const getCreateCompanyAccessById = async (req, res, next) => {
    try {
        let Id = req.params.id;
        let [companyAccess, _] = await CompanyAccess.findById(Id);

        res.status(200).json({
            success: true,
            message: "CompanyAccess Record Successfully!",
            data: companyAccess[0]
        });
    } catch (error) {
        console.log(error);
        next(error)
    }
};

const deleteCompanyAccess = async (req, res, next) => {
    try {
        let Id = req.params.id;
        await CompanyAccess.delete(Id)
        res.status(200).json({
            success: true,
            message: "CompanyAccess Delete Successfully!"
        });
    } catch (error) {
        console.log(error);
        next(error)
    }
};

const updateCompanyAccess = async (req, res, next) => {
    try {
        let { tenantId, user_id, company_id, updatedBy } = req.body;
        let companyAccess = new CompanyAccess(tenantId, user_id, company_id, updatedBy)
        let Id = req.params.id;
        let [findcompanyAccess, _] = await CompanyAccess.findById(Id);
        if (!findcompanyAccess) {
            throw new Error("CompanyAccess not found!")
        }
        await companyAccess.update(Id)
        res.status(200).json({
            success: true,
            message: "CompanyAccess Successfully Updated",
            record: { companyAccess }, returnOriginal: false, runValidators: true
        });
    } catch (error) {
        console.log(error);
        next(error)
    }
};

module.exports = {
    CreateCompanyAccess,
    ListCreateCompanyAccess,
    getCreateCompanyAccessById,
    deleteCompanyAccess,
    updateCompanyAccess
}