import { randomBytes, createHash } from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const createAccessToken = (userId) =>
  jwt.sign(
    { sub: userId },
    env.jwtAccessSecret,
    {
      algorithm: "HS256",
      expiresIn: "15m",
    },
  );

export const verifyAccessToken = (token) => {
  const payload = jwt.verify(
    token,
    env.jwtAccessSecret,
    { algorithms: ["HS256"] },
  );

  if (
    !payload ||
    typeof payload !== "object" ||
    typeof payload.sub !== "string" ||
    !payload.sub
  ) {
    throw new Error("Geçersiz erişim belirteci.");
  }

  return payload;
};



export const createRefreshToken = () =>
  randomBytes(48).toString("base64url");

export const hashToken = (token) =>
  createHash("sha256")
    .update(token)
    .digest("hex");
