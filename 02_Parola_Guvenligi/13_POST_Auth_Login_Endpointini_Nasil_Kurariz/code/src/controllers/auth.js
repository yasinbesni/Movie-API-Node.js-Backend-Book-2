import * as authService from "../services/auth.js";
import { toPublicUser } from "../utils/toPublicUser.js";

export const registerUser = async (req, res) => {
  const user = await authService.registerUser(req.body);

  return res.status(201).json({
    message: "Kullanıcı oluşturuldu.",
    data: toPublicUser(user),
  });
};

export const loginUser = async (req, res) => {
  const user = await authService.loginUser(req.body);

  return res.status(200).json({
    message: "Giriş başarılı.",
    data: toPublicUser(user),
  });
};
