const Joi = require('joi');

const createCommonSchema = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().required(),
    status: Joi.number().integer().required()
});

const updateCommonSchema = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().required(),
    status: Joi.number().integer().required()
});

module.exports = {
    createCommonSchema,
    updateCommonSchema
};
