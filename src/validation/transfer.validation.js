const Joi = require('joi');

const transactionDetailSchema = Joi.object({
    id: Joi.number().integer().allow(null),
    subCategoryId: Joi.number().integer(),
    amount: Joi.number().required(),
    description: Joi.string().allow("").required()
});

const createTransferSchema = Joi.object({
    transactionDate: Joi.string().required(),
    paymentType_Id: Joi.number().integer().required(),
    fromAccount: Joi.number().integer().required(),
    toAccount: Joi.number().integer().required(),
    amount: Joi.number().positive().required(),
    description: Joi.string().allow(""),
    details: Joi.array().items(transactionDetailSchema).optional()
});

const updateTransferSchema = Joi.object({
    transactionDate: Joi.string().required(),
    paymentType_Id: Joi.number().integer().required(),
    fromAccount: Joi.number().integer().required(),
    toAccount: Joi.number().integer().required(),
    amount: Joi.number().positive().required(),
    description: Joi.string().allow(""),
    details: Joi.array().items(transactionDetailSchema).optional()
});

module.exports = {
    createTransferSchema,
    updateTransferSchema
};
