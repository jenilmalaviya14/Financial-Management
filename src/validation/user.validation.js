const Joi = require('joi');

const createUserSchema = Joi.object({
  username: Joi.string().required(),
  fullname: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
  profile_image: Joi.string().allow(''),
  companies: Joi.array().items(
    Joi.number().integer().required()
  ).required(),
  status: Joi.number().integer().required(),
  roleId: Joi.number().integer().required(),
  createdBy: Joi.number().required(),
  updatedBy: Joi.number().required()
});

const updateUserSchema = Joi.object({
  username: Joi.string().required(),
  fullname: Joi.string().required(),
  email: Joi.string().required(),
  profile_image: Joi.string().allow(''),
  companyId: Joi.array().items(
    Joi.number().integer().required()
  ).required(),
  status: Joi.number().integer().required(),
  roleId: Joi.number().integer().required(),
  createdBy: Joi.number().required(),
  updatedBy: Joi.number().required()
});

module.exports = {
  createUserSchema,
  updateUserSchema
};
