const Joi = require('joi');

const menuItemSchema = Joi.object({
    child_id: Joi.number().integer().required(),
    allow_access: Joi.number().valid(0, 1),
    allow_add: Joi.number().valid(0, 1),
    allow_edit: Joi.number().valid(0, 1),
    allow_delete: Joi.number().valid(0, 1),
});

const createMenuSchema = Joi.object({
    role_id: Joi.number().integer().required(),
    menuItems: Joi.array().items(menuItemSchema).min(1)
});

module.exports = {
    createMenuSchema,
};
