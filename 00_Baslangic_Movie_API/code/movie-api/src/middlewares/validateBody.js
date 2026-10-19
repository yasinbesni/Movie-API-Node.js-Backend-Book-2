export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(
      req.body,
      {
        abortEarly: false,
      },
    );

    if (error) {
      return res.status(400).json({
        message: "Validation hatası.",
        errors: error.details.map(
          (item) => item.message,
        ),
      });
    }

    req.body = value;

    next();
  };
};
