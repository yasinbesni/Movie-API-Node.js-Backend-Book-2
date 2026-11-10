import * as authService from "../services/auth.js";
import { toPublicUser } from "../utils/toPublicUser.js";
import { isProduction, sessionCookieName } from "../utils/sessionCookie.js";
import { createAccessToken } from "../utils/token.js";
import { setAuthCookies, clearAuthCookies } from "../utils/authCookies.js";

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
    req.session.authVersion = user.authVersion ?? 0;

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

export const loginUserWithToken = async (req, res) => {
  const user = await authService.loginUser(req.body);
  const accessToken = createAccessToken(user);
  const refreshToken = await authService.issueRefreshToken(user._id);
  setAuthCookies(res, accessToken, refreshToken);
  return res.status(200).json({ message: "Giriş başarılı.", data: toPublicUser(user) });
};

export const refreshSession = async (req, res) => {
  const rawToken = req.cookies?.refreshToken;
  if (!rawToken) {
    const error = new Error("Oturum yenilenemedi.");
    error.status = 401;
    throw error;
  }
  const { accessToken, refreshToken, user } =
    await authService.rotateRefreshToken(rawToken);
  setAuthCookies(res, accessToken, refreshToken);
  return res.status(200).json({ data: toPublicUser(user) });
};

import { verifyEmailToken } from "../services/accountTokens.js";

export const verifyEmailController = async (req, res) => {
  await verifyEmailToken(req.body.token);
  res.status(200).json({ message: "E-posta adresi doğrulandı." });
};
export const resetPasswordController = async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password);
  res.status(200).json({ message: "Parola güncellendi. Yeniden giriş yapın." });
};
export const forgotPasswordController = async (req, res) => {
  await authService.requestPasswordReset(req.body.email);
  res.status(202).json({
    message: "Adres uygunsa parola yenileme bağlantısı gönderilecektir.",
  });
};
export const sendVerificationController = async (req, res) => {
  await authService.requestEmailVerification(req.user);
  res.status(202).json({ message: "Doğrulama isteği alındı." });
};

export const logoutAll = async (req, res, next) => {
 await authService.logout(req.cookies?.refreshToken);
 clearAuthCookies(res);
 req.session.destroy(error => {
  if (error) return next(error);
  res.clearCookie(sessionCookieName, { path: "/", httpOnly: true, secure: isProduction, sameSite: "lax" });
  res.status(204).send();
 });
};
