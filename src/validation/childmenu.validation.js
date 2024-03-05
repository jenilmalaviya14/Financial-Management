const Joi = require('joi');

const createChildmenuSchema = Joi.object({
    menu_name: Joi.string().required(),
    parent_id: Joi.number().integer().required(),
    display_rank: Joi.number().integer().required(),
    status: Joi.number().integer().required()
});

const updateChildmenuSchema = Joi.object({
    menu_name: Joi.string().required(),
    parent_id: Joi.number().integer().required(),
    display_rank: Joi.number().integer().required(),
    status: Joi.number().integer().required(),
});

module.exports = {
    createChildmenuSchema,
    updateChildmenuSchema
};
