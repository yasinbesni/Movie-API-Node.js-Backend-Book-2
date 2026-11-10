import { AccountToken } from "../db/models/accountToken.js";
import {
  createOpaqueToken,
  hashToken,
} from "../utils/token.js";

const EMAIL_TOKEN_LIFETIME_MS = 30 * 60 * 1000;

export const issueEmailVerificationToken = async (userId) => {
  await AccountToken.updateMany(
    { userId, type: "email_verify", usedAt: null },
    { $set: { usedAt: new Date() } },
  );

  const rawToken = createOpaqueToken();
  await AccountToken.create({
    userId,
    type: "email_verify",
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(Date.now() + EMAIL_TOKEN_LIFETIME_MS),
  });

  return rawToken;
};
import { User } from "../db/models/user.js";

export const verifyEmailToken = async (rawToken) => {
  const token = await AccountToken.findOneAndUpdate(
    {
      tokenHash: hashToken(rawToken),
      type: "email_verify",
      usedAt: null,
      expiresAt: { $gt: new Date() },
    },
    { $set: { usedAt: new Date() } },
    { returnDocument: "before" },
  );

  if (!token) {
    const error = new Error("Doğrulama bağlantısı geçersiz veya süresi dolmuş.");
    error.status = 400;
    throw error;
  }

  await User.findByIdAndUpdate(token.userId, {
    $set: { isEmailVerified: true },
  });
};
const RESET_TOKEN_LIFETIME_MS = 20 * 60 * 1000;

export const issuePasswordResetToken = async (userId) => {
  await AccountToken.updateMany(
    { userId, type: "password_reset", usedAt: null },
    { $set: { usedAt: new Date() } },
  );

  const rawToken = createOpaqueToken();
  await AccountToken.create({
    userId,
    type: "password_reset",
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(Date.now() + RESET_TOKEN_LIFETIME_MS),
  });

  return rawToken;
};
