export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      const error = new Error("Kimlik doğrulaması gerekli.");
      error.status = 401;
      return next(error);
    }

    if (!allowedRoles.includes(req.user.role)) {
      const error = new Error("Bu işlem için yetkiniz yok.");
      error.status = 403;
      return next(error);
    }

    return next();
  };
};
