const Parentmenu = require("../models/parentmenu");
const { createParentMenuSchema, updateParentMenuSchema } = require('../validation/parentmenu.validation');
const { getDecodeToken } = require('../middlewares/decoded');

let parentmenuResultSearch = (q, parentmenuResult) => {
    if (q) {
        const queryLowered = q.toLowerCase();
        return parentmenuResult.filter(parentmenu =>
            (parentmenu.menu_name.toLowerCase().includes(queryLowered)) ||
            (typeof parentmenu.status === 'string' && parentmenu.status.toLowerCase() === "active" && "active".includes(queryLowered))
        );
    }
    else {
        return parentmenuResult
    }
};

const CreateParentmenu = async (req, res) => {

    const token = getDecodeToken(req);
    try {
        const { error } = createParentMenuSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        };

        let { menu_name, display_rank, status } = req.body;

        const tenantId = token.decodedToken.tenantId;
        const userId = token.decodedToken.userId;

        let parentmenu = new Parentmenu(tenantId, menu_name, display_rank, status);

        parentmenu.createdBy = userId;
        parentmenu.updatedBy = userId;

        parentmenu = await parentmenu.save()

        res.status(200).json({
            success: true,
            message: "ParentMenu Created Successfully",
            record: { parentmenu }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        })
        console.log(error);
    }
};

const ListParentmenu = async (req, res, next) => {
    const token = getDecodeToken(req);
    const tenantId = token.decodedToken.tenantId;
    try {
        const { q = '', id } = req.query;

        if (id) {
            const parentmenu = await Parentmenu.findById(tenantId, id);

            if (parentmenu[0].length === 0) {
                return res.status(404).json({ success: false, message: 'The specified Parentmenu was not found.' });
            }

            return res.status(200).json({ success: true, message: 'parentmenu found', data: parentmenu[0][0] });
        }

        const parentmenuResult = await Parentmenu.findAll(tenantId);

        parentmenuResult[0] = parentmenuResultSearch(q, parentmenuResult[0]);

        let responseData = {
            success: true,
            message: 'Parentmenu list has been fetched Successfully.',
            data: parentmenuResult[0]
        };

        res.status(200).json(responseData);

    } catch (error) {
        console.log(error);
        next(error);
    }
};

const ActiveParentmenu = async (req, res, next) => {
    const token = getDecodeToken(req);
    const tenantId = token.decodedToken.tenantId;
    try {
        const { q = '', id } = req.query;

        if (id) {
            const parentmenu = await Parentmenu.findById(tenantId, id);

            if (parentmenu[0].length === 0) {
                return res.status(404).json({ success: false, message: 'The specified Parentmenu was not found.' });
            }

            return res.status(200).json({ success: true, message: 'parentmenu found', data: parentmenu[0][0] });
        }

        const parentmenuResult = await Parentmenu.findActiveAll(tenantId);

        parentmenuResult[0] = parentmenuResultSearch(q, parentmenuResult[0]);

        let responseData = {
            success: true,
            message: 'Parentmenu list has been fetched Successfully.',
            data: parentmenuResult[0]
        };
        res.status(200).json(responseData);

    } catch (error) {
        console.log(error);
        next(error);
    }
};

const getParentmenuById = async (req, res, next) => {
    const token = getDecodeToken(req);
    const tenantId = token.decodedToken.tenantId;
    try {
        let Id = req.params.id;
        let [parentmenu, _] = await Parentmenu.findById(tenantId, Id);

        res.status(200).json({
            success: true,
            message: "ParentMenu Record Successfully",
            data: parentmenu[0]
        });
    } catch (error) {
        console.log(error);
        next(error)
    }
};

const deleteParentmenu = async (req, res, next) => {
    const token = getDecodeToken(req);
    const tenantId = token.decodedToken.tenantId;
    try {
        let parentId = req.params.id;

        const parentmenuValidation = await Parentmenu.deleteValidation(parentId)
        if (!parentmenuValidation) {
            res.status(200).json({
                success: false,
                message: "This Parentmenu contains Data, You can't Delete it."
            });
        }

        await Parentmenu.delete(tenantId, parentId);

        res.status(200).json({
            success: true,
            message: "Parent Deleted Successfully"
        });
    } catch (error) {
        console.log(error);
        next(error)
    }
};

const updateParentmenu = async (req, res, next) => {
    const token = getDecodeToken(req);
    const tenantId = token.decodedToken.tenantId;
    const userId = token.decodedToken.userId;
    try {

        const { error } = updateParentMenuSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        };

        let { menu_name, display_rank, status } = req.body;

        let parentmenu = new Parentmenu(tenantId, menu_name, display_rank, status)

        parentmenu.updatedBy = userId

        let Id = req.params.id;
        let [findparentmenu, _] = await Parentmenu.findById(tenantId, Id);
        if (!findparentmenu) {
            throw new Error("The specified Parentmenu was not found.!")
        }
        await parentmenu.update(tenantId, Id)
        res.status(200).json({
            success: true,
            message: "ParentMenu Successfully Updated",
            record: { parentmenu }, returnOriginal: false, runValidators: true
        });
    } catch (error) {
        console.log(error);
        next(error)
    }
};

module.exports = {
    CreateParentmenu,
    ListParentmenu,
    ActiveParentmenu,
    getParentmenuById,
    deleteParentmenu,
    updateParentmenu
}