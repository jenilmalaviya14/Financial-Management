const Joi = require('joi');

const createAccountSchema = Joi.object({
    account_name: Joi.string().required(),
    group_name_Id: Joi.number().integer().required(),
    join_date: Joi.string().required(),
    exit_date: Joi.allow(null).optional(),
    account_type_Id: Joi.number().integer().required(),
    status: Joi.number().integer().required()
});

const updateAccountSchema = Joi.object({
    account_name: Joi.string().required(),
    group_name_Id: Joi.number().integer().required(),
    join_date: Joi.string().required(),
    exit_date: Joi.allow(null).optional(),
    account_type_Id: Joi.number().integer().required(),
    status: Joi.number().integer().required()
});
module.exports = {
    createAccountSchema,
    updateAccountSchema
};
