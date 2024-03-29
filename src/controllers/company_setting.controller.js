const CompanySetting = require('../models/company_setting');
const { getDecodeToken } = require('../middlewares/decoded');

const ListCompanySetting = async (req, res, next) => {
    const token = getDecodeToken(req)
    const tenantId = token.decodedToken.tenantId;
    const companyId = token.decodedToken.companyId;
    try {
        const { q = '', id } = req.query;

        if (id) {
            const companySetting = await CompanySetting.findById(id);

            if (companySetting[0].length === 0) {
                return res.status(404).json({ success: false, message: 'CompanySetting not found' });
            }

            return res.status(200).json({ success: true, message: 'CompanySetting found', data: companySetting[0][0] });
        }

        const companySettingResult = await CompanySetting.findAll(tenantId, companyId);
        let responseData = {
            success: true,
            message: 'CompanySetting list has been fetched Successfully.',
            data: companySettingResult[0]
        };

        responseData.data = responseData.data.map(companySetting => {
            const { tenantId, ...rest } = companySetting;
            return rest;
        });

        res.status(200).json(responseData);

    } catch (error) {
        console.log(error);
        next(error);
    }
};

const getIdCompanySetting = async (req, res, next) => {
    const token = getDecodeToken(req);
    const tenantId = token.decodedToken.tenantId;
    try {
        let Id = req.params.id;
        let [companysetting, _] = await CompanySetting.findById(tenantId, Id);

        res.status(200).json({
            success: true,
            message: "CompanySetting Record Successfully",
            data: companysetting[0]
        });
    } catch (error) {
        console.log(error);
        next(error)
    }
};

const updateCompanySetting = async (req, res, next) => {
    const token = getDecodeToken(req);
    const tenantId = token.decodedToken.tenantId;
    const companyId = token.decodedToken.companyId;
    const userId = token.decodedToken.userId;
    try {
        let { fiscalStartMonth, defaultDateOption } = req.body;

        let companysetting = new CompanySetting(tenantId, fiscalStartMonth, defaultDateOption, companyId, userId, userId)

        companysetting.updatedBy = userId;

        let [findcompanysetting, _] = await CompanySetting.findBycompanyId(tenantId, companyId);
        if (findcompanysetting.length > 0) {
            await companysetting.updateByCompanyId(tenantId, companyId)
        }
        else {
            await companysetting.save()
        }
        res.status(200).json({
            success: true,
            message: "companysetting Successfully Updated",
            record: { companysetting }, returnOriginal: false, runValidators: true
        });
    } catch (error) {
        console.log(error);
        next(error)
    }
};

module.exports = {
    ListCompanySetting,
    updateCompanySetting,
    getIdCompanySetting
};