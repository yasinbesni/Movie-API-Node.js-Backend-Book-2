export const requireVerifiedEmail = (req, res, next) => {
  if (req.user?.isEmailVerified !== true) {
    const error = new Error(
      "Bu işlem için e-posta doğrulaması gerekli.",
    );
    error.status = 403;
    return next(error);
  }

  return next();
};
