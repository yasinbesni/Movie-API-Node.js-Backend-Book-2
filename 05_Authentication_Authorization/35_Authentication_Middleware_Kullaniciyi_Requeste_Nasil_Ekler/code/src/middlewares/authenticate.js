import { User } from "../db/models/user.js";
import { verifyAccessToken } from "../utils/token.js";

const unauthorized = () => {
  const error = new Error("Kimlik doğrulaması gerekli.");
  error.status = 401;
  return error;
};

export const authenticate = async (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) return next(unauthorized());

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return next(unauthorized());
  }

  const user = await User.findById(payload.sub);
  if (!user) return next(unauthorized());

  req.user = user;
  return next();
};
