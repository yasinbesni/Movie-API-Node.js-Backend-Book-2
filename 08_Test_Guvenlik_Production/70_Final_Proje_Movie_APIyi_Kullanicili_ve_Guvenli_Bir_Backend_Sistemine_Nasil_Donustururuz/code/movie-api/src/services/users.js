import mongoose from "mongoose";
import { User } from "../db/models/user.js";
import { AccountToken } from "../db/models/accountToken.js";
import { RefreshToken } from "../db/models/refreshToken.js";
import { createOpaqueToken, hashToken } from "../utils/token.js";
import { verifyPassword } from "../utils/password.js";
import { sendEmailChangeCode } from "./accountEmails.js";
const buildProfileUpdate = (payload) => Object.fromEntries(
  ["name", "bio"].filter(key => Object.hasOwn(payload, key)).map(key => [key, payload[key]]),
);
export const updateMyProfile = async (
  userId,
  payload,
) => {
  const update = buildProfileUpdate(payload);

  return User.findByIdAndUpdate(
    userId,
    { $set: update },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );
};
const emailChangeError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

export const requestEmailChange = async (userId, newEmail, password) => {
  const user = await User.findById(userId).select("+passwordHash");

  if (!user || user.isActive === false ||
      !(await verifyPassword(user.passwordHash, password))) {
    throw emailChangeError("Kimlik bilgileri doğrulanamadı.", 401);
  }
  if (user.email === newEmail) {
    throw emailChangeError("Bu adres zaten hesabınızda kayıtlı.", 400);
  }
  if (await User.exists({ email: newEmail })) {
    throw emailChangeError("Bu adres kullanılamıyor.", 409);
  }

  await AccountToken.updateMany(
    { userId, type: "email_change", usedAt: null },
    { $set: { usedAt: new Date() } },
  );

  const rawToken = createOpaqueToken();
  const token = await AccountToken.create({
    userId,
    type: "email_change",
    tokenHash: hashToken(rawToken),
    emailBeforeChange: user.email,
    newEmail,
    authVersionAtIssue: user.authVersion ?? 0,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
  });

  try {
    await sendEmailChangeCode(newEmail, rawToken);
  } catch (error) {
    await AccountToken.updateOne(
      { _id: token._id, usedAt: null },
      { $set: { usedAt: new Date() } },
    );
    throw error;
  }
};
export const confirmEmailChange = async (rawToken) => {
  try {
    await mongoose.connection.transaction(async (session) => {
      const now = new Date();
      const token = await AccountToken.findOneAndUpdate(
        {
          tokenHash: hashToken(rawToken),
          type: "email_change",
          usedAt: null,
          expiresAt: { $gt: now },
        },
        { $set: { usedAt: now } },
        { returnDocument: "before", session },
      );

      if (!token) {
        throw emailChangeError("Kod geçersiz veya süresi dolmuş.", 400);
      }

      const user = await User.findOneAndUpdate(
        {
          _id: token.userId,
          email: token.emailBeforeChange,
          isActive: { $ne: false },
          $expr: {
            $eq: [
              { $ifNull: ["$authVersion", 0] },
              token.authVersionAtIssue,
            ],
          },
        },
        {
          $set: { email: token.newEmail, isEmailVerified: true },
          $inc: { authVersion: 1 },
        },
        { returnDocument: "after", runValidators: true, session },
      );

      if (!user) {
        throw emailChangeError("Hesap veya eski adres artık eşleşmiyor.", 400);
      }

      await RefreshToken.updateMany(
        { userId: token.userId, revokedAt: null },
        { $set: { revokedAt: now } },
        { session },
      );
      await AccountToken.updateMany(
        { userId: token.userId, usedAt: null },
        { $set: { usedAt: now } },
        { session },
      );
    });
  } catch (error) {
    if (error.code === 11000) {
      throw emailChangeError("Yeni e-posta adresi kullanılamıyor.", 409);
    }
    throw error;
  }
};

export const disableAccount = async (userId) => {
  await mongoose.connection.transaction(async (session) => {
    await User.updateOne({ _id: userId }, { $set: { isActive: false }, $inc: { authVersion: 1 } }, { session });
    await RefreshToken.updateMany({ userId, revokedAt: null }, { $set: { revokedAt: new Date() } }, { session });
  });
 await writeAuditEvent({ action: "ACCOUNT_DISABLED", actorId: userId, targetId: userId, outcome: "success" });
};

import { writeAuditEvent } from "./audit.js";
