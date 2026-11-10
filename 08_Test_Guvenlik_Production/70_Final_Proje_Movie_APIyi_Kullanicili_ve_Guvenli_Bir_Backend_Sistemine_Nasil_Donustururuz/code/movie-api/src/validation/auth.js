import Joi from "joi";

export const registerUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(15).max(128).required(),
});

export const loginUserSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});
export const verifyEmailSchema = Joi.object({
  token: Joi.string().trim().required(),
});
export const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
});
export const resetPasswordSchema = Joi.object({
  token: Joi.string().trim().required(),
  password: Joi.string().min(15).max(128).required(),
});
