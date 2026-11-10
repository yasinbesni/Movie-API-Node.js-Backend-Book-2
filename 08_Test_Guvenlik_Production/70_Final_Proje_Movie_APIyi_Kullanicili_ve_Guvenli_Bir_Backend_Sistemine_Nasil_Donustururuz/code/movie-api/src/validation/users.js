import Joi from "joi";
export const updateProfileSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(80),

  bio: Joi.string()
    .trim()
    .max(300)
    .allow(""),
}).min(1);
export const requestEmailChangeSchema = Joi.object({
  newEmail: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

export const confirmEmailChangeSchema = Joi.object({
  token: Joi.string().trim().required(),
});
