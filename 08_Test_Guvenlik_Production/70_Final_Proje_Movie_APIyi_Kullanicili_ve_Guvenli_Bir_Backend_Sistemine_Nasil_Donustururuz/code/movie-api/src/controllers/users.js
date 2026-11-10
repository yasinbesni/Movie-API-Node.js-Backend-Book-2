import { toPublicUser } from "../utils/toPublicUser.js";
import * as usersService from "../services/users.js";
import { saveAvatar } from "../services/files.js";
import { clearAuthCookies } from "../utils/authCookies.js";
import { User } from "../db/models/user.js";
export const getCurrentUser = (req, res) => res.json({ data: toPublicUser(req.user) });
export const updateCurrentUser = async (req, res) => {
  const user = await usersService.updateMyProfile(
    req.user._id,
    req.body,
  );

  res.status(200).json({
    data: toPublicUser(user),
  });
};
export const requestEmailChangeController = async (req, res) => {
  await usersService.requestEmailChange(
    req.user._id,
    req.body.newEmail,
    req.body.password,
  );
  res.status(202).json({
    message: "Yeni adrese doğrulama kodu gönderilmesi istendi.",
  });
};

export const confirmEmailChangeController = async (req, res) => {
  await usersService.confirmEmailChange(req.body.token);
  clearAuthCookies(res);
  res.status(200).json({
    message: "E-posta adresi değiştirildi. Yeniden giriş yapın.",
  });
};

export const updateAvatar = async (req, res) => {
 if (!req.file) return res.status(400).json({ message: "Fotoğraf gerekli." });
 const avatarUrl = await saveAvatar({ userId: req.user._id, buffer: req.file.buffer });
 const user = await User.findByIdAndUpdate(req.user._id, { $set: { avatarUrl } }, { returnDocument: "after" });
 res.json({ data: toPublicUser(user) });
};
export const disableCurrentUser = async (req, res, next) => {
 await usersService.disableAccount(req.user._id);
 clearAuthCookies(res);
 req.session.destroy(error => error ? next(error) : res.status(204).send());
};
