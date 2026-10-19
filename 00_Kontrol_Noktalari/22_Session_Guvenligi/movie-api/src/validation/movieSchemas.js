import Joi from "joi";

const titleSchema = Joi.string()
  .pattern(/\S/)
  .messages({
    "string.base":
      "Film adı metin olmalıdır.",
    "string.empty":
      "Film adı boş bırakılamaz.",
    "string.pattern.base":
      "Film adı yalnızca boşluklardan oluşamaz.",
  });

const releaseYearSchema = Joi.number()
  .integer()
  .min(1888)
  .messages({
    "number.base":
      "Film yılı sayı olmalıdır.",
    "number.integer":
      "Film yılı tam sayı olmalıdır.",
    "number.min":
      "Film yılı 1888 veya daha büyük olmalıdır.",
  });

const voteAverageSchema = Joi.number()
  .min(0)
  .max(10)
  .messages({
    "number.base":
      "Film puanı sayı olmalıdır.",
    "number.min":
      "Film puanı 0'dan küçük olamaz.",
    "number.max":
      "Film puanı 10'dan büyük olamaz.",
  });

export const createMovieSchema = Joi.object({
  title: titleSchema
    .required()
    .messages({
      "any.required":
        "Film adı zorunludur.",
    }),
  releaseYear: releaseYearSchema,
  voteAverage: voteAverageSchema,
})
  .unknown(false)
  .messages({
    "object.unknown":
      "{{#label}} desteklenen bir alan değildir.",
  });

export const updateMovieSchema = Joi.object({
  title: titleSchema,
  releaseYear: releaseYearSchema,
  voteAverage: voteAverageSchema,
})
  .min(1)
  .unknown(false)
  .messages({
    "object.min":
      "Güncellenecek en az bir film alanı gönderilmelidir.",
    "object.unknown":
      "{{#label}} desteklenen bir alan değildir.",
  });
