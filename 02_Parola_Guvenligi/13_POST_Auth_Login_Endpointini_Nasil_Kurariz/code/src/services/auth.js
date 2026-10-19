import { User } from "../db/models/user.js";
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
