import * as authService from "../services/auth.js";
import { toPublicUser } from "../utils/toPublicUser.js";
import { isProduction, sessionCookieName } from "../utils/sessionCookie.js";

export const registerUser = async (req, res) => {
  const user = await authService.registerUser(req.body);

  return res.status(201).json({
    message: "Kullanıcı oluşturuldu.",
    data: toPublicUser(user),
  });
};

export const loginUser = async (req, res, next) => {
  const user = await authService.loginUser(req.body);

  req.session.regenerate((error) => {
    if (error) {
      return next(error);
    }

    req.session.userId = user._id.toString();

    req.session.save((saveError) => {
      if (saveError) {
        return next(saveError);
      }

      return res.status(200).json({
        message: "Giriş başarılı.",
        data: toPublicUser(user),
      });
    });
  });
};

export const logoutUser = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    res.clearCookie(sessionCookieName, {
      path: "/",
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
    });

    return res.status(204).send();
  });
};
