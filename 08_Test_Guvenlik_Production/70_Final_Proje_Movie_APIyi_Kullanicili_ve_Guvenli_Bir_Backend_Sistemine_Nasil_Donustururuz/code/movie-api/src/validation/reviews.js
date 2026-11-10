import Joi from "joi";
export const createReviewSchema = Joi.object({ rating: Joi.number().integer().min(1).max(10).required(), text: Joi.string().trim().max(2000).allow("").default("") });
