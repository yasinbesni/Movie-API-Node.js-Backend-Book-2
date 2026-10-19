import { toPublicUser } from "../utils/toPublicUser.js";

export const getCurrentUser = (req, res) => {
  res.status(200).json({ data: toPublicUser(req.user) });
};
