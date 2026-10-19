export const errorHandler = (
  error,
  req,
  res,
  next,
) => {
  req.log.error(
    {
      err: error,
    },
    "Request işlenirken beklenmeyen hata oluştu.",
  );

  if (error.code === 11000) {
    return res.status(409).json({
      message: "Bu kayıt zaten mevcut.",
    });
  }

  if (error.name === "ValidationError") {
    const errors = Object.values(
      error.errors,
    ).map((item) => item.message);

    return res.status(400).json({
      message: "Validation hatası.",
      errors,
    });
  }

  return res.status(500).json({
    message:
      "Sunucuda beklenmeyen bir hata oluştu.",
  });
};
