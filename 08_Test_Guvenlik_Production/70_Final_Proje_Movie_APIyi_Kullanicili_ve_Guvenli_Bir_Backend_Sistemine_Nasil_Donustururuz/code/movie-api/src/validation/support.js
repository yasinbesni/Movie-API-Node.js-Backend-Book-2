import Joi from "joi";

export const supportRequestSchema = Joi.object({
  message: Joi.string().trim().min(10).max(2000).required(),
}).unknown(false);
