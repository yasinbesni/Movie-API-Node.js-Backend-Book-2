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
    throw invalidCredentials();
  }

  const isPasswordValid = await verifyPassword(
    user.passwordHash,
    password,
  );

  if (!isPasswordValid) {
    throw invalidCredentials();
  }

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
  const previous = await RefreshToken.findOneAndUpdate(
    { tokenHash, usedAt: null, revokedAt: null, expiresAt: { $gt: new Date() } },
    { $set: { usedAt: new Date() } },
    { new: false },
  );
  if (!previous) {
    const knownToken = await RefreshToken.findOne({ tokenHash });
    if (knownToken?.usedAt && !knownToken.revokedAt) {
      await revokeTokenFamily(knownToken.familyId);
    }
    throwUnauthorized();
  }
  const user = await User.findById(previous.userId);
  if (!user) throwUnauthorized();
  const refreshToken = await issueRefreshToken(user._id, previous.familyId);
  return { accessToken: createAccessToken(user._id.toString()), refreshToken, user };
};
