const Joi = require('joi');

const createCompanySchema = Joi.object({
    company_name: Joi.string().required(),
    legal_name: Joi.string().required(),
    authorize_person_name: Joi.string().required(),
    address: Joi.string().allow(""),
    contact_no: Joi.string().allow(""),
    email: Joi.string().required(),
    website: Joi.string().allow(""),
    pan: Joi.string().allow(""),
    gstin: Joi.string().allow(""),
    status: Joi.number().integer().required()
});

const updateCompanySchema = Joi.object({
    company_name: Joi.string().required(),
    legal_name: Joi.string().required(),
    authorize_person_name: Joi.string().required(),
    address: Joi.string().allow(""),
    contact_no: Joi.string().allow(""),
    email: Joi.string().required(),
    website: Joi.string().allow(""),
    pan: Joi.string().allow(""),
    gstin: Joi.string().allow(""),
    status: Joi.number().integer().required()
});

module.exports = {
    createCompanySchema,
    updateCompanySchema
};