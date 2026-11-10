export const errorHandler = (
  error,
  req,
  res,
  next,
) => {
  req.log?.error(
    {
      err: error,
    },
    "Request işlenirken beklenmeyen hata oluştu.",
  );

  if (res.headersSent) return next(error);
  if (error.name === "CastError") return res.status(400).json({ message: "Geçersiz kimlik veya alan değeri." });
  if (error.type === "entity.parse.failed") return res.status(400).json({ message: "Geçersiz JSON." });
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

  if (Number.isInteger(error.status) && error.status >= 400 && error.status < 500) {
    return res.status(error.status).json({ message: error.message });
  }

  return res.status(500).json({
    message:
      "Sunucuda beklenmeyen bir hata oluştu.",
  });
};
