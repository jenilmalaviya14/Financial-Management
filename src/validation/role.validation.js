const Joi = require('joi');

const createRoleSchema = Joi.object({
    rolename: Joi.string().required(),
    status: Joi.number().integer().required()
});

const updateRoleSchema = Joi.object({
    rolename: Joi.string().required(),
    status: Joi.number().integer().required(),
});

module.exports = {
    createRoleSchema,
    updateRoleSchema
};
