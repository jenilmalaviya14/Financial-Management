const Joi = require('joi');

const createTenantSchema = Joi.object({
    tenantname: Joi.string().required(),
    personname: Joi.string().required(),
    address: Joi.string().required(),
    contact: Joi.string().required(),
    email: Joi.string().required(),
    startdate: Joi.string().required(),
    enddate: Joi.allow(null).optional(),
    status:Joi.number().integer().required()
});

const updateTenantSchema = Joi.object({
    tenantname: Joi.string().required(),
    personname: Joi.string().required(),
    address: Joi.string().required(),
    contact: Joi.string().required(),
    email: Joi.string().required(),
    startdate: Joi.string().required(),
    enddate: Joi.allow(null).optional(),
    status:Joi.number().integer().required()
});

module.exports = {
    createTenantSchema,
    updateTenantSchema
};
