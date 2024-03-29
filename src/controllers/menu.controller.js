const Menu = require("../models/menu");
const { createMenuSchema } = require('../validation/menu.validation');
const { getDecodeToken } = require('../middlewares/decoded');

let menuResultSearch = (q, menuResult) => {
    if (q) {
        const queryLowered = q.toLowerCase();
        return menuResult.filter(menu =>
            (typeof menu.status === 'string' && menu.status.toLowerCase() === "active" && menu.name.includes(queryLowered))`${menu.name} ${menu.description}`
        );
    }
    else {
        return menuResult
    }
};

const CreateMenu = async (req, res) => {
    try {
        const token = getDecodeToken(req);

        const { error } = createMenuSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }

        const { role_id, menuItems } = req.body;

        const tenantId = token.decodedToken.tenantId;
        const userId = token.decodedToken.userId;

        const menu = new Menu(tenantId, role_id, menuItems);

        menu.createdBy = userId;
        menu.updatedBy = userId;

        const result = await menu.save();

        res.status(200).json({
            success: true,
            message: "Menu items Created Successfully",
            record: { result }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
        console.log(error);
    }
};

const ListMenu = async (req, res, next) => {
    const token = getDecodeToken(req);
    const tenantId = token.decodedToken.tenantId;
    try {
        const { q = '', id } = req.query;

        if (id) {
            const menu = await Menu.findById(tenantId, id);

            if (menu[0].length === 0) {
                return res.status(404).json({ success: false, message: 'The specified Menu was not found.' });
            }

            return res.status(200).json({ success: true, message: 'Menu found', data: menu[0][0] });
        }

        const menuResult = await Menu.findAll(tenantId);

        menuResult[0] = menuResultSearch(q, menuResult[0]);

        let responseData = {
            success: true,
            message: 'Menu list has been fetched Successfully.',
            data: menuResult[0]
        };

        responseData.data = responseData.data.map(menu => {
            const { id, tenantId, ...rest } = menu;
            return rest;
        })

        res.status(200).json(responseData);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

const ListMenuWithRoleId = async (req, res, next) => {
    const token = getDecodeToken(req);
    const tenantId = token.decodedToken.tenantId;
    try {
        const { q = '', id } = req.query;
        const roleId = req.params.id;

        if (!roleId) {
            return res.status(400).json({ success: false, message: 'roleId parameter is required' });
        }

        if (id) {
            const menu = await Menu.findById(tenantId, roleId, id);

            if (menu[0].length === 0) {
                return res.status(404).json({ success: false, message: 'The specified Menu was not found.' });
            }

            return res.status(200).json({ success: true, message: 'Menu found', data: menu[0][0] });
        }

        const menuResult = await Menu.findAllWithRoleId(tenantId, roleId);

        menuResult[0] = menuResultSearch(q, menuResult[0]);

        let responseData = {
            success: true,
            message: 'Menu list has been fetched Successfully.',
            data: menuResult[0]
        };

        responseData.data = responseData.data.map(menu => {
            const { id, tenantId, ...rest } = menu;
            return rest;
        })

        res.status(200).json(responseData);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

const getMenuById = async (req, res, next) => {
    const token = getDecodeToken(req);
    const roleId = token.decodedToken.roleId;
    const tenantId = token.decodedToken.tenantId
    try {
        let Id = req.params.id;
        let [menu, _] = await Menu.findById(tenantId, roleId, Id);

        res.status(200).json({
            success: true,
            message: "Menu Record Successfully",
            data: menu[0]
        });
    } catch (error) {
        console.log(error);
        next(error)
    }
};

const deleteMenu = async (req, res, next) => {
    const token = getDecodeToken(req);
    const tenantId = token.decodedToken.tenantId;
    try {
        let Id = req.params.id;
        await Menu.delete(tenantId, Id)
        res.status(200).json({
            success: true,
            message: "Menu Deleted Successfully"
        });
    } catch (error) {
        console.log(error);
        next(error)
    }
};

const resetMenu = async (req, res, next) => {
    const token = getDecodeToken(req);
    const tenantId = token.decodedToken.tenantId;
    let roleId = req.params.id;
    try {
        await Menu.roleBydelete(tenantId, roleId)
        res.status(200).json({
            success: true,
            message: "Menu Reset Successfully"
        });
    } catch (error) {
        console.log(error);
        next(error)
    }
}

const updateMenu = async (req, res, next) => {
    try {
        const token = getDecodeToken(req);
        const tenantId = token.decodedToken.tenantId;
        const roleId = token.decodedToken.roleId;
        const userId = token.decodedToken.userId;

        let { role_id, menuItems } = req.body;

        let menu = new Menu(tenantId, role_id, menuItems)

        menu.updatedBy = userId;

        let Id = req.params.id;
        let [findmenu, _] = await Menu.findById(tenantId, Id, roleId);
        if (!findmenu) {
            throw new Error("The specified Menu was not found.!")
        }
        await menu.update(tenantId, Id)
        res.status(200).json({
            success: true,
            message: "Menu Successfully Updated",
            record: { menu }, returnOriginal: false, runValidators: true
        });
    } catch (error) {
        console.log(error);
        next(error)
    }
};

module.exports = {
    CreateMenu,
    ListMenu,
    ListMenuWithRoleId,
    getMenuById,
    deleteMenu,
    resetMenu,
    updateMenu
}