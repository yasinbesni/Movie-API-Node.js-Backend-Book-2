import { User } from "../db/models/user.js";
import { RefreshToken } from "../db/models/refreshToken.js";
import { createAccessToken, createRefreshToken, hashToken } from "../utils/token.js";
import { randomUUID } from "node:crypto";
import {
  hashPassword,
  verifyPassword,
} from "../utils/password.js";

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error("Bu e-posta adresiyle bir hesap zaten var.");
    error.status = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);
  return User.create({ name, email, passwordHash });
};

const invalidCredentials = () => {
  const error = new Error("E-posta veya parola hatalı.");
  error.status = 401;
  return error;
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email })
    .select("+passwordHash");

  if (!user) {
    await writeAuditEvent({ action: "LOGIN_FAILURE", outcome: "rejected" });
    throw invalidCredentials();
  }

  const isPasswordValid = await verifyPassword(
    user.passwordHash,
    password,
  );

  if (!isPasswordValid || !user.isActive) {
    await writeAuditEvent({ action: "LOGIN_FAILURE", outcome: "rejected" });
    throw invalidCredentials();
  }

  await writeAuditEvent({ action: "LOGIN_SUCCESS", actorId: user._id, outcome: "success" });
  return user;
};

const throwUnauthorized = () => {
  const error = new Error("Oturum yenilenemedi.");
  error.status = 401;
  throw error;
};

export const issueRefreshToken = async (userId, familyId = randomUUID()) => {
  const rawToken = createRefreshToken();
  await RefreshToken.create({
    userId,
    familyId,
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  return rawToken;
};

export const revokeTokenFamily = async (familyId) => {
  await RefreshToken.updateMany(
    { familyId, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
};

// Öğretim kontrol noktası: işlem adımları yalnız temel MongoDB
// atomicity sağlar. İleri üretim gereksinimleri ayrı değerlendirilir.
export const rotateRefreshToken = async (rawToken) => {
 const tokenHash = hashToken(rawToken);
 const result = await mongoose.connection.transaction(async (session) => {
  const previous = await RefreshToken.findOneAndUpdate(
   { tokenHash, usedAt: null, revokedAt: null, expiresAt: { $gt: new Date() } },
   { $set: { usedAt: new Date() } }, { returnDocument: "before", session },
  );
  if (!previous) {
   const known = await RefreshToken.findOne({ tokenHash }).session(session);
   if (known?.usedAt) await RefreshToken.updateMany({ familyId: known.familyId }, { $set: { revokedAt: new Date() } }, { session });
   return null; // İptal işlemi commit edilir; hata dışarıda üretilir.
  }
  const user = await User.findById(previous.userId).session(session);
  if (!user || !user.isActive) return null;
  const refreshToken = createRefreshToken();
  await RefreshToken.create([{ userId: user._id, familyId: previous.familyId, tokenHash: hashToken(refreshToken), expiresAt: new Date(Date.now()+7*24*60*60*1000) }], { session });
  return { user, refreshToken, accessToken: createAccessToken(user) };
 });
 if (!result) { await writeAuditEvent({ action: "REFRESH_REJECTED", outcome: "rejected" }); throwUnauthorized(); }
 return result;
};

import mongoose from "mongoose";
import { AccountToken } from "../db/models/accountToken.js";
import { issuePasswordResetToken, issueEmailVerificationToken } from "./accountTokens.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "./accountEmails.js";
export const resetPassword = async (rawToken, password) => {
  // Hash işlemini transaction başlamadan tamamlıyoruz.
  const passwordHash = await hashPassword(password);

  await mongoose.connection.transaction(async (session) => {
    const token = await AccountToken.findOneAndUpdate(
      {
        tokenHash: hashToken(rawToken),
        type: "password_reset",
        usedAt: null,
        expiresAt: { $gt: new Date() },
      },
      { $set: { usedAt: new Date() } },
      { returnDocument: "before", session },
    );

    if (!token) {
      const error = new Error("Bağlantı geçersiz veya süresi dolmuş.");
      error.status = 400;
      throw error;
    }

    const user = await User.findByIdAndUpdate(
      token.userId,
      {
        $set: { passwordHash },
        $inc: { authVersion: 1 },
      },
      { returnDocument: "after", session },
    );
    if (!user) throw new Error("Kullanıcı kaydı bulunamadı.");

    await RefreshToken.updateMany(
      { userId: token.userId, revokedAt: null },
      { $set: { revokedAt: new Date() } },
      { session },
    );
  });
};
export const requestPasswordReset = async (email) => {
  const user = await User.findOne({
    email,
    isEmailVerified: true,
    isActive: true,
  });
  if (!user) return;

  const rawToken = await issuePasswordResetToken(user._id);
  try {
    await sendPasswordResetEmail(user.email, rawToken);
  } catch {
    await AccountToken.updateOne(
      { tokenHash: hashToken(rawToken), usedAt: null },
      { $set: { usedAt: new Date() } },
    );
    // Hesap varlığını SMTP hatasıyla da açığa çıkarmıyoruz.
  }
};
export const requestEmailVerification = async (user) => {
  if (user.isEmailVerified) return;
  const rawToken = await issueEmailVerificationToken(user._id);
  try {
    await sendVerificationEmail(user.email, rawToken);
  } catch (error) {
    await AccountToken.updateOne(
      { tokenHash: hashToken(rawToken), usedAt: null },
      { $set: { usedAt: new Date() } },
    );
    throw error;
  }
};

export const logout = async (rawToken) => {
 await writeAuditEvent({ action: "LOGOUT", outcome: "success" });
 if (rawToken) await RefreshToken.updateOne({ tokenHash: hashToken(rawToken), revokedAt: null }, { $set: { revokedAt: new Date() } });
};

import { writeAuditEvent } from "./audit.js";
