const Joi = require('joi');

const createTransactionSchema = Joi.object({
    transaction_date: Joi.string().required(),
    transaction_type: Joi.string().required(),
    payment_type_Id: Joi.number().integer().required(),
    accountId: Joi.number().integer().required(),
    amount: Joi.number().required(),
    description: Joi.string().allow(""),
    clientId: Joi.number().integer().required()
});

const updateTransactionSchema = Joi.object({
    transaction_date: Joi.string().required(),
    transaction_type: Joi.string().required(),
    payment_type_Id: Joi.number().integer().required(),
    accountId: Joi.number().integer().required(),
    amount: Joi.number().required(),
    description: Joi.string().allow(""),
    clientId: Joi.number().integer().required()
});

module.exports = {
    createTransactionSchema,
    updateTransactionSchema
};