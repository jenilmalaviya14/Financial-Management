const Joi = require('joi');

const createClientSchema = Joi.object({
    clientName: Joi.string().required(),
    status: Joi.number().integer().required(),
    type: Joi.string().required()
});

const updateClientSchema = Joi.object({
    clientName: Joi.string().required(),
    status: Joi.number().integer().required(),
    type: Joi.string().required()
});

module.exports = {
    createClientSchema,
    updateClientSchema
};
