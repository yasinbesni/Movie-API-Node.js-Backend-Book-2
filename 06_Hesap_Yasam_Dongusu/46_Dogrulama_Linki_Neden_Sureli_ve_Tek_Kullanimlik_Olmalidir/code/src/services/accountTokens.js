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
