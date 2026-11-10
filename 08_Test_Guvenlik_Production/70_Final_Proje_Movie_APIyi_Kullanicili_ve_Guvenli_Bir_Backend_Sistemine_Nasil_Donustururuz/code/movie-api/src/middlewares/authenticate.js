import mongoose from "mongoose";
import { User } from "../db/models/user.js";
import { verifyAccessToken } from "../utils/token.js";
export const authenticate = async (req, res, next) => {
 let id, version;
 if (req.cookies?.accessToken) {
  try { const payload = verifyAccessToken(req.cookies.accessToken); id = payload.sub; version = payload.ver; }
  catch { return res.status(401).json({ message: "Kimlik doğrulaması gerekli." }); }
 } else { id = req.session?.userId; version = req.session?.authVersion; }
 if (!mongoose.isObjectIdOrHexString(id)) return res.status(401).json({ message: "Kimlik doğrulaması gerekli." });
 const user = await User.findById(id);
 if (!user || !user.isActive || version !== (user.authVersion ?? 0)) return res.status(401).json({ message: "Kimlik doğrulaması gerekli." });
 req.user = user;
 next();
};
