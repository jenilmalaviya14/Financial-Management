const Common = require("../models/common");
const { createCommonSchema, updateCommonSchema } = require('../validation/common.validation');
const { getDecodeToken } = require('../middlewares/decoded');

let commonResultSearch = (q, commonResult) => {
    if (q) {
        const queryLowered = q.toLowerCase();
        return commonResult.filter(common =>
            (common.name.toLowerCase().includes(queryLowered)) ||
            (common.type.toLowerCase().includes(queryLowered)) ||
            (typeof common.status === 'string' && common.status.toLowerCase() === "active" && "active".includes(queryLowered))
        );
    }
    else {
        return commonResult
    }
};

const CreateCommon = async (req, res) => {
    const token = getDecodeToken(req)
    const tenantId = token.decodedToken.tenantId;
    const userId = token.decodedToken.userId;

    try {
        const { error } = createCommonSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }

        let { name, type, status } = req.body;

        let common = new Common(tenantId, name, type, status);

        common.createdBy = userId;
        common.updatedBy = userId;

        common = await common.save()

        res.status(200).json({
            success: true,
            message: "Common Created Successfully",
            record: { common }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        })
        console.log(error);
    }
};

const ListCommon = async (req, res, next) => {
    const token = getDecodeToken(req);
    const tenantId = token.decodedToken.tenantId;
    try {
        const { q = '', id } = req.query;
        const { type } = req.body;

        if (id) {
            const common = await Common.findById(tenantId, id)
                ;

            if (common[0].length === 0) {
                return res.status(404).json({ success: false, message: 'The specified Common was not found.' });
            }

            return res.status(200).json({ success: true, message: 'Common found', data: common[0][0] });
        }

        const commonResult = await Common.findAll(tenantId, type);

        commonResult[0] = commonResultSearch(q, commonResult[0]);

        let responseData = {
            success: true,
            message: 'Common list has been fetched Successfully.',
            data: commonResult[0]
        };

        res.status(200).json(responseData);

    } catch (error) {
        console.log(error);
        next(error);
    }
};

const Activecommon = async (req, res, next) => {
    const token = getDecodeToken(req);
    const tenantId = token.decodedToken.tenantId;
    try {
        const { q = '', id } = req.query;
        const { type } = req.body;

        if (id) {
            const common = await Common.findById(tenantId, id)
                ;

            if (common[0].length === 0) {
                return res.status(404).json({ success: false, message: 'The specified Common was not found.' });
            }

            return res.status(200).json({ success: true, message: 'Common found', data: common[0][0] });
        }

        const commonResult = await Common.findActiveAll(tenantId, type);

        commonResult[0] = commonResultSearch(q, commonResult[0]);

        let responseData = {
            success: true,
            message: 'Common list has been fetched Successfully.',
            data: commonResult[0]
        };

        responseData.data = responseData.data.map(common => {
            const { tenantId, ...rest } = common;
            return rest;
        })

        if (q) {
            const queryLowered = q.toLowerCase();
            const filteredData = commonResult[0].filter(
                common =>
                    common.name.toLowerCase().includes(queryLowered) ||
                    common.type.toLowerCase().includes(queryLowered) ||
                    (typeof common.status === 'string' && common.status.toLowerCase() === "active" && "active".includes(queryLowered))
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
                    message: 'No matching common found',
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

const getCommonById = async (req, res, next) => {
    const token = getDecodeToken(req)
    const tenantId = token.decodedToken.tenantId;
    try {
        let Id = req.params.id;
        let [common, _] = await Common.findById(tenantId, Id)
            ;

        res.status(200).json({
            success: true,
            message: "Common Record Successfully",
            data: common[0]
        });
    } catch (error) {
        console.log(error);
        next(error)
    }
};

const deleteCommon = async (req, res, next) => {
    try {
        const token = getDecodeToken(req)
        const tenantId = token.decodedToken.tenantId;
        let commonId = req.params.id;

        const commonValidation = await Common.deleteValidation(tenantId, commonId)
        if (!commonValidation) {
            res.status(200).json({
                success: false,
                message: "This Common contains Data, You can't Delete it."
            });
        }
        await Common.delete(tenantId, commonId);

        res.status(200).json({
            success: true,
            message: "Common Deleted Successfully"
        });
    } catch (error) {
        console.log(error);
        next(error)
    }
};

const updateCommon = async (req, res, next) => {
    const token = getDecodeToken(req)

    try {

        const { error } = updateCommonSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        };

        let { name, type, status } = req.body;

        const tenantId = token.decodedToken.tenantId;
        const userId = token.decodedToken.userId;

        let common = new Common(tenantId, name, type, status)

        common.updatedBy = userId;

        let Id = req.params.id;
        let [findcommon, _] = await Common.findById(tenantId, Id)
            ;
        if (!findcommon) {
            throw new Error("The specified Common was not found.!")
        }
        await common.update(tenantId, Id)

        res.status(200).json({
            success: true,
            message: "Common Successfully Updated",
            record: { common }, returnOriginal: false, runValidators: true
        });
    } catch (error) {
        console.log(error);
        next(error)
    }
};

module.exports = {
    CreateCommon,
    ListCommon,
    Activecommon,
    getCommonById,
    deleteCommon,
    updateCommon
}