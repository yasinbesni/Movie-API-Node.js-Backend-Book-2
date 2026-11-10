import { randomBytes, createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../config/env.js";
const options = { httpOnly: true, secure: env.nodeEnv === "production", sameSite: "lax", path: "/" };
const name = env.nodeEnv === "production" ? "__Host-csrfBinding" : "csrfBinding";
const sign = (binding, token) => createHmac("sha256", env.csrfSecret).update(`${binding}.${token}`).digest("base64url");
export const issueCsrf = (req, res) => {
 const binding = req.cookies[name] || randomBytes(32).toString("base64url");
 const token = randomBytes(32).toString("base64url");
 res.cookie(name, binding, options);
 res.set("Cache-Control", "no-store").json({ csrfToken: `${token}.${sign(binding, token)}` });
};
export const csrf = (req, res, next) => {
 if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
 if (req.get("origin") && req.get("origin") !== env.corsOrigin) return res.status(403).json({ message: "İstek kaynağı reddedildi." });
 const value = req.get("x-csrf-token") || "";
 const [token, signature, extra] = value.split(".");
 const binding = req.cookies[name];
 if (!binding || !token || !signature || extra) return res.status(403).json({ message: "CSRF doğrulaması gerekli." });
 const expected = Buffer.from(sign(binding, token)); const received = Buffer.from(signature);
 if (received.length !== expected.length || !timingSafeEqual(received, expected)) return res.status(403).json({ message: "CSRF doğrulaması başarısız." });
 next();
};
